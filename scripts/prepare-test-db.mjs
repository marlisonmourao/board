import { spawnSync } from 'node:child_process'
import postgres from 'postgres'

const databaseUrl = 'postgres://board_test:board_test@127.0.0.1:5433/board_test'
const sql = postgres(databaseUrl, { max: 1 })
try {
  const [identity] = await sql`select current_database() as name, current_user as owner`
  if (identity.name !== 'board_test' || identity.owner !== 'board_test') throw new Error('Banco de teste inválido')
  await sql`drop schema public cascade`
  await sql`create schema public`
} finally {
  await sql.end()
}

const result = spawnSync('node_modules/.bin/drizzle-kit', ['push', '--force'], {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: databaseUrl, BETTER_AUTH_SECRET: 'board-test-secret-only-for-isolated-tests-2026', BETTER_AUTH_URL: 'http://127.0.0.1:3100', GITHUB_CLIENT_ID: 'test', GITHUB_CLIENT_SECRET: 'test' },
})
if (result.status !== 0) process.exit(result.status ?? 1)
