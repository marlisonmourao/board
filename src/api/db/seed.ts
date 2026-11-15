import "dotenv/config"
import { fakerPT_BR as faker } from "@faker-js/faker"
import { sql } from "drizzle-orm"
import { db } from "./index"
import { comments, issues } from "./schema"

const issueNames = [
  "Adicionar suporte ao tema escuro",
  "Corrigir layout em celulares",
  "Implementar autenticação de usuários",
  "Atualizar dependências do projeto",
  "Adicionar testes para a API",
  "Melhorar o tempo de carregamento",
  "Corrigir vazamento de memória no painel",
  "Adicionar atalhos de teclado",
  "Implementar busca de issues",
  "Adicionar exportação para CSV",
  "Corrigir fuso horário das datas",
  "Adicionar notificações por e-mail",
  "Melhorar mensagens de erro",
  "Documentar a API",
  "Corrigir falha de segurança na autenticação",
  "Adicionar painel de métricas",
  "Implementar atualizações em tempo real",
  "Adicionar suporte a outros idiomas",
  "Corrigir mudanças inesperadas no layout",
  "Adicionar suporte a arrastar e soltar",
  "Otimizar consultas ao banco de dados",
  "Adicionar paginação às listas",
  "Corrigir contraste das cores",
  "Adicionar modo offline",
  "Implementar cache de dados",
  "Adicionar limite de requisições",
  "Corrigir compatibilidade entre navegadores",
  "Melhorar acessibilidade",
  "Melhorar navegação em celulares",
  "Otimizar imagens",
  "Corrigir seletor de datas",
  "Adicionar ações em lote",
  "Implementar webhooks",
  "Adicionar temas personalizados",
  "Corrigir erros de validação",
]

async function main() {
  console.log("🗑️  Resetting database...")

  // Truncate tables
  await db.execute(sql`TRUNCATE TABLE comments CASCADE`)
  await db.execute(sql`TRUNCATE TABLE issues CASCADE`)

  // Reset sequence to 0
  await db.execute(sql`ALTER SEQUENCE issue_number_seq RESTART WITH 0`)

  console.log("🌱 Seeding database...")

  // Insert 25 issues
  for (let i = 0; i < 25; i++) {
    const randomTitle =
      issueNames[Math.floor(Math.random() * issueNames.length)]
    const statuses = ["backlog", "todo", "in_progress", "done"] as const
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

    const [issue] = await db
      .insert(issues)
      .values({
        title: randomTitle,
        description: `Descrição para: ${randomTitle}.`,
        status: randomStatus,
      })
      .returning()

    // Insert 5 comments per issue
    for (let j = 0; j < 5; j++) {
      await db.insert(comments).values({
        issueId: issue.id,
        authorName: `Pessoa ${j + 1}`,
        authorAvatar: `https://i.pravatar.cc/150?u=${j}`,
        text: `Este é o comentário ${j + 1} da issue ${issue.issueNumber}.`,
      })
    }
  }

  const statuses = ["backlog", "todo", "in_progress", "done"] as const

  // Insert 25 issues
  for (let i = 0; i < 25; i++) {
    const randomTitle = faker.helpers.arrayElement(issueNames)
    const randomStatus = faker.helpers.arrayElement(statuses)

    const [issue] = await db
      .insert(issues)
      .values({
        title: randomTitle,
        description: faker.lorem.paragraph(),
        status: randomStatus,
      })
      .returning()

    // Insert 5 comments per issue
    for (let j = 0; j < 5; j++) {
      await db.insert(comments).values({
        issueId: issue.id,
        authorName: faker.person.fullName(),
        authorAvatar: faker.image.avatar(),
        text: faker.lorem.sentence(),
      })
    }
  }

  console.log("✅ Database seeded successfully!")
  process.exit(0)
}

main().catch((error) => {
  console.error("❌ Error seeding database:", error)
  process.exit(1)
})
