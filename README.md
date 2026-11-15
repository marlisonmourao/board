# Board - Gerenciador de Issues

![Banner do Projeto](.github/images/board.png)

## 📋 Sobre o Projeto

O **Board** é uma aplicação moderna de gerenciamento de issues (tarefas) inspirada pela simplicidade e eficiência de ferramentas de rastreamento de problemas. O projeto permite visualizar, criar e gerenciar tarefas de forma organizada, utilizando uma interface intuitiva e recursos avançados de navegação.

Este projeto foi desenvolvido como parte de um desafio técnico para demonstrar habilidades em tecnologias modernas do ecossistema React/Next.js.

## 🚀 Tecnologias

O projeto utiliza o que há de mais moderno em desenvolvimento web:

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Autenticação**: [Better-Auth](https://www.better-auth.com/)
- **Persistência**: [Drizzle ORM](https://orm.drizzle.team/) com [PostgreSQL](https://www.postgresql.org/)
- **API**: [Hono](https://hono.dev/) (integrada para maior performance)
- **Gerenciamento de Estado**: [TanStack React Query v5](https://tanstack.com/query/latest)
- **Componentes de UI**: [Radix UI](https://www.radix-ui.com/) e [Lucide Icons](https://lucide.dev/)
- **Padronização**: [Biome](https://biomejs.dev/) (Lint & Format)

## 📸 Screenshots

Aqui estão algumas capturas de tela das principais funcionalidades:

### Detalhes da Issue (Modal e Página)
O projeto utiliza **Intercepting Routes** e **Parallel Routes** do Next.js para fornecer uma experiência de usuário fluida, onde é possível visualizar detalhes de uma issue sem perder o contexto do board.

| Detalhes via Modal | Página de Detalhes Completa |
|:---:|:---:|
| ![Modal de Detalhes](.github/images/modal-details.png) | ![Página de Detalhes](.github/images/details-page.png) |

## ✨ Funcionalidades

- [x] **Visualização em Board**: Listagem de issues com filtros.
- [x] **Páginas de Detalhes**: Cada issue possui uma página dedicada e acessível.
- [x] **Navegação Inteligente**: Abertura de detalhes em modal mantendo o estado da página anterior através de rotas interceptadas.
- [x] **Gestão de Comentários**: Possibilidade de interagir com as issues.
- [x] **Autenticação Segura**: Fluxo completo de login e gerenciamento de sessão.
- [x] **Performance Otimizada**: Utilização de `server-only` para segurança e React Compiler para renderização eficiente.

## 🛠️ Como rodar o projeto

### Pré-requisitos
- Node.js installed (LTS recomendado)
- Docker (opcional, para o banco de dados)
- pnpm (recomendado)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/marlisonmourao/board.git
cd board
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente (.env):
Crie um arquivo `.env` na raiz do projeto com base no seu ambiente local (PostgreSQL e AUTH).

4. Rode as migrations e o seed do banco:
```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
```

5. Inicie o servidor de desenvolvimento:
```bash
pnpm dev
```

Abra `http://localhost:3000` no seu navegador.

### Testes

Os testes usam um PostgreSQL temporário isolado na porta `5433` e iniciam o aplicativo de teste na porta `3100`. O banco de desenvolvimento não é usado. Cada execução recria o esquema do banco de teste e apaga seus dados.

```bash
docker compose -f docker-compose.test.yml up -d
pnpm exec playwright install chromium
pnpm test
docker compose -f docker-compose.test.yml stop
```

Para usar um Chrome já instalado, defina `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` com o caminho do executável antes de executar os testes. As sessões de teste são criadas somente no banco isolado; o login GitHub real não é exercitado.

O quadro continua carregando todas as issues. As consultas de comentários foram agrupadas e as interações são solicitadas em lotes, mas quadros muito grandes ainda consomem memória e tempo de renderização no navegador.
