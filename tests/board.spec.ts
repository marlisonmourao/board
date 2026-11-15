import { test, expect } from '@playwright/test'
import { createHmac, randomUUID } from 'node:crypto'
import postgres from 'postgres'
import { testDatabaseUrl, testSecret } from './config'

const sql = postgres(testDatabaseUrl)
const firstUser = randomUUID()
const secondUser = randomUUID()
const firstToken = `test-${randomUUID()}`
const secondToken = `test-${randomUUID()}`
const issueId = randomUUID()
const otherIssueId = randomUUID()

function cookie(token: string) {
  const signature = createHmac('sha256', testSecret).update(token).digest('base64')
  return `better-auth.session_token=${encodeURIComponent(`${token}.${signature}`)}`
}

test.beforeAll(async () => {
  await sql`insert into users (id, name, email, email_verified, created_at, updated_at) values
    (${firstUser}, 'Pessoa Teste', 'pessoa@example.test', true, now(), now()),
    (${secondUser}, 'Outra Pessoa', 'outra@example.test', true, now(), now())`
  await sql`insert into sessions (id, token, user_id, expires_at, created_at, updated_at) values
    (${randomUUID()}, ${firstToken}, ${firstUser}, now() + interval '1 day', now(), now()),
    (${randomUUID()}, ${secondToken}, ${secondUser}, now() + interval '1 day', now(), now())`
  await sql`insert into issues (id, title, description, status, priority, assignee_id) values
    (${issueId}, 'Busca alvo', 'Descrição inicial', 'todo', 'high', ${firstUser}),
    (${otherIssueId}, 'Busca alvo em outra coluna', 'Descrição', 'done', 'low', null)`
  await sql`insert into comments (issue_id, author_id, author_name, author_avatar, text) select ${issueId}, ${firstUser}, 'Pessoa Teste', '', 'Comentário ' || n from generate_series(1, 20) as n`
})

test.afterAll(async () => { await sql.end() })

test('listagem combina busca e estado e conta comentários', async ({ request }) => {
  const response = await request.get('/api/issues?search=Busca%20alvo&status=todo')
  expect(response.ok()).toBeTruthy()
  const data = await response.json()
  expect(data.todo).toHaveLength(1)
  expect(data.todo[0]).toMatchObject({ id: issueId, comments: 20 })
  expect(data.done).toHaveLength(0)
})

test('sessões protegem issues e autoria dos comentários', async ({ request }) => {
  expect((await request.post('/api/issues', { data: { title: 'Negado', description: 'Negado' } })).status()).toBe(401)
  const session = await request.get('/api/auth/get-session', { headers: { cookie: cookie(firstToken) } })
  expect((await session.json()).user.id).toBe(firstUser)
  const created = await request.post('/api/issues', { headers: { cookie: cookie(firstToken) }, data: { title: 'Criada no teste', description: 'Descrição' } })
  expect(created.status()).toBe(201)
  const createdId = (await created.json()).id
  const edited = await request.patch(`/api/issues/${createdId}`, { headers: { cookie: cookie(firstToken) }, data: { title: 'Título atualizado' } })
  expect(edited.status()).toBe(200)
  const comment = await request.post(`/api/issues/${createdId}/comments`, { headers: { cookie: cookie(firstToken) }, data: { text: 'Comentário pessoal' } })
  expect(comment.status()).toBe(201)
  const commentId = (await comment.json()).id
  const path = `/api/issues/${createdId}/comments/${commentId}`
  expect((await request.patch(path, { headers: { cookie: cookie(secondToken) }, data: { text: 'Tentativa' } })).status()).toBe(403)
  expect((await request.delete(path, { headers: { cookie: cookie(secondToken) } })).status()).toBe(403)
  expect((await request.patch(path, { headers: { cookie: cookie(firstToken) }, data: { text: 'Editado' } })).status()).toBe(200)
  expect((await request.delete(path, { headers: { cookie: cookie(firstToken) } })).status()).toBe(204)
})

test('curtidas simultâneas permanecem únicas e limitam IDs', async ({ request }) => {
  const options = { headers: { cookie: cookie(firstToken) } }
  const responses = await Promise.all(Array.from({ length: 4 }, () => request.post(`/api/issues/${issueId}/like`, options)))
  expect(responses.every((response) => response.status() === 200)).toBeTruthy()
  const [count] = await sql`select count(*)::int as total from issue_likes where issue_id = ${issueId} and user_id = ${firstUser}`
  expect(count.total).toBe(0)
  expect((await request.get(`/api/issues/interactions?issueIds=${Array.from({ length: 101 }, () => issueId).join(',')}`)).status()).toBe(400)
})

test('quadro permite filtrar e abrir issue com sessão', async ({ page, context }) => {
  const signed = cookie(firstToken).split('=')[1]
  await context.addCookies([{ name: 'better-auth.session_token', value: signed, domain: '127.0.0.1', path: '/' }])
  await page.goto('/?q=Busca')
  await expect(page.getByRole('button', { name: 'Nova issue' })).toBeVisible()
  await page.getByLabel('Prioridade', { exact: true }).selectOption('high')
  await expect(page.getByText('Busca alvo', { exact: true })).toBeVisible()
  await expect(page.getByText('Busca alvo em outra coluna')).toHaveCount(0)
  await page.getByText('Busca alvo', { exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Busca alvo' })).toBeVisible()
  await page.getByRole('heading', { name: 'Busca alvo' }).locator('..').getByRole('button', { name: 'Editar', exact: true }).click()
  await page.getByLabel('Título', { exact: true }).fill('Busca alterada')
  await page.getByRole('button', { name: 'Salvar alterações' }).click()
  await expect(page.getByRole('heading', { name: 'Busca alterada' })).toBeVisible()
  await expect(page.getByText('Pessoa Teste alterou título', { exact: false })).toBeVisible()
})
