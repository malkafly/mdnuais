# mdnuais

**Manual de sistemas online em Markdown** — Knowledge base open source, bonito, simples e funcional.

Armazena tudo (markdown, imagens, configurações) em S3/R2, tem editor rico com paste de imagens, navegação estilo Outline/Notion, busca rápida, dark mode e deploy 100% stateless.

---

## Features

**Interface pública**
- Sidebar de navegação com hierarquia colapsável e links externos
- Table of Contents (TOC) com scroll spy automático
- Breadcrumbs e navegação anterior/próximo
- Headings clicáveis com cópia de link âncora
- Syntax highlighting com Shiki (temas GitHub Light/Dark)
- Botão copiar código em blocos de código
- Busca rápida via `Ctrl+K` / `Cmd+K` (Fuse.js)
- Dark mode com persistência e detecção do sistema
- Compartilhamento (copiar link, Twitter/X, LinkedIn)
- Responsivo (desktop, tablet, mobile)
- Suporte a GFM (tabelas, strikethrough, task lists)

**Painel admin**
- Autenticação simples por token (cookie httpOnly)
- Dashboard com estatísticas (total de docs e seções)
- CRUD completo de documentos e seções
- Editor Tiptap com toolbar completa (bold, italic, headings, listas, citações, código, tabelas, links, imagens)
- Paste de imagem via `Ctrl+V` e drag-and-drop (upload direto pro S3/R2)
- Preview ao vivo (split view)
- Drag-and-drop para reordenar documentos e seções
- Links externos no menu de navegação
- Configurações do site (nome, logo, favicon, cores, footer, links sociais, SEO)
- Atalho `Ctrl+S` para salvar, indicador de alterações não salvas

**Internacionalização**
- Interface em português (PT) por padrão
- Estrutura preparada para adicionar outros idiomas

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript (strict mode) |
| Estilização | Tailwind CSS 3 |
| Editor | Tiptap + extensões (image, table, code block, link) |
| Markdown | react-markdown + rehype-raw + remark-gfm |
| Syntax Highlight | Shiki |
| Busca | Fuse.js (client-side) |
| Storage | S3-compatible (AWS S3 / Cloudflare R2) via AWS SDK v3 |
| Drag & Drop | @dnd-kit |
| Ícones | Lucide React |
| Toasts | Sonner |
| Fonts | Inter + JetBrains Mono (next/font) |

---

## Início rápido

### Pré-requisitos

- Node.js 18+
- Bucket S3-compatible (AWS S3 ou Cloudflare R2)

### Instalação

```bash
git clone https://github.com/seu-usuario/mdnuais.git
cd mdnuais
npm install
```

### Configuração

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env
```

```env
# Storage (S3/R2)
STORAGE_ENDPOINT=https://xxx.r2.cloudflarestorage.com
STORAGE_REGION=auto
STORAGE_ACCESS_KEY_ID=seu_access_key
STORAGE_SECRET_ACCESS_KEY=seu_secret_key
STORAGE_BUCKET=nome-do-bucket
STORAGE_BASE_PATH=mdnuais

# Auth
ADMIN_TOKEN=uma-senha-forte-aqui

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_LOCALE=pt
CACHE_TTL_SECONDS=300
```

**Cloudflare R2:** crie um bucket, vá em *Manage R2 API Tokens*, crie um token com permissão *Object Read & Write*, e use o Access Key ID e Secret Access Key gerados.

**AWS S3:** omita o `STORAGE_ENDPOINT` e configure `STORAGE_REGION` com a região real do bucket.

### Rodar

```bash
npm run dev
```

Acesse `http://localhost:3000/admin/login` e entre com a senha definida em `ADMIN_TOKEN`.

---

## Estrutura do projeto

```
mdnuais/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout (fonts, theme, toaster)
│   │   ├── page.tsx                    # Redirect pro primeiro doc
│   │   ├── not-found.tsx               # Página 404
│   │   ├── docs/[...slug]/page.tsx     # Renderiza markdown público
│   │   ├── search/page.tsx             # Resultados de busca
│   │   ├── admin/
│   │   │   ├── layout.tsx              # Layout admin (sidebar)
│   │   │   ├── page.tsx                # Dashboard
│   │   │   ├── login/page.tsx          # Login
│   │   │   ├── docs/page.tsx           # Lista/árvore de docs
│   │   │   ├── docs/new/page.tsx       # Criar doc/seção/link externo
│   │   │   ├── docs/edit/[...slug]/    # Editor do documento
│   │   │   └── settings/page.tsx       # Configurações do site
│   │   └── api/
│   │       ├── auth/login/route.ts     # POST - login
│   │       ├── auth/logout/route.ts    # POST - logout
│   │       ├── docs/route.ts           # GET - lista docs (sidebar)
│   │       ├── docs/[...slug]/route.ts # GET/PUT/DELETE - doc
│   │       ├── reorder/route.ts        # PUT - reordenar sidebar
│   │       ├── upload/route.ts         # POST - upload de imagem
│   │       ├── config/route.ts         # GET/PUT - config.json
│   │       ├── search-index/route.ts   # GET - índice de busca
│   │       └── assets/images/[...path] # GET - servir imagens do S3
│   ├── components/
│   │   ├── public/                     # Componentes da interface pública
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── TableOfContents.tsx
│   │   │   ├── Breadcrumbs.tsx
│   │   │   ├── MarkdownRenderer.tsx
│   │   │   ├── CodeBlock.tsx
│   │   │   ├── DocNavigation.tsx
│   │   │   ├── SearchModal.tsx
│   │   │   ├── ShareButton.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── ThemeProvider.tsx
│   │   └── admin/                      # Componentes do painel admin
│   │       ├── AdminSidebar.tsx
│   │       ├── DocEditor.tsx
│   │       └── DocTree.tsx
│   ├── lib/
│   │   ├── storage.ts                  # Adapter S3/R2
│   │   ├── cache.ts                    # Cache in-memory com TTL
│   │   ├── auth.ts                     # Autenticação por token
│   │   ├── config.ts                   # Read/write config.json e sidebar.json
│   │   ├── markdown.ts                 # Parsing, headings, strip
│   │   ├── navigation.ts              # Prev/next, breadcrumbs
│   │   ├── search.ts                   # Build do índice de busca
│   │   └── i18n.ts                     # Internacionalização
│   ├── locales/
│   │   └── pt.ts                       # Dicionário português
│   ├── types/
│   │   └── index.ts                    # Interfaces TypeScript
│   └── middleware.ts                   # Proteção das rotas /admin/*
├── .env.example
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
└── package.json
```

---

## Arquitetura de storage

Todos os arquivos vivem no bucket S3/R2. Não há filesystem local para conteúdo — deploy 100% stateless.

```
{STORAGE_BASE_PATH}/
├── config.json              # Configurações do site
├── sidebar.json             # Estrutura de navegação
├── docs/
│   ├── getting-started/
│   │   ├── index.md
│   │   └── installation.md
│   └── api-reference/
│       ├── index.md
│       └── endpoints.md
└── assets/
    └── images/
        ├── logo.png
        └── 1707912345-abc123.png
```

### config.json

Define a identidade visual e metadata do site:

```json
{
  "name": "Meu Knowledge Base",
  "logo": "/api/assets/images/logo.png",
  "favicon": "/api/assets/images/favicon.png",
  "colors": {
    "primary": "#2563eb",
    "primaryDark": "#60a5fa"
  },
  "footer": {
    "text": "© 2025 Minha Empresa",
    "links": [
      { "label": "Termos", "url": "https://meusite.com/termos" }
    ]
  },
  "socialLinks": {
    "github": "https://github.com/meu/repo",
    "website": "https://meusite.com"
  },
  "metadata": {
    "title": "Docs — Minha Empresa",
    "description": "Documentação oficial"
  }
}
```

### sidebar.json

Define a hierarquia de navegação. Suporta documentos, seções com filhos e links externos:

```json
{
  "items": [
    {
      "title": "Primeiros Passos",
      "slug": "getting-started",
      "children": [
        { "title": "Introdução", "slug": "getting-started/index" },
        { "title": "Instalação", "slug": "getting-started/installation" }
      ]
    },
    {
      "title": "GitHub",
      "slug": "github",
      "url": "https://github.com/meu/repo",
      "external": true
    }
  ]
}
```

---

## API Routes

| Rota | Método | Auth | Descrição |
|------|--------|------|-----------|
| `/api/auth/login` | POST | - | Valida token, seta cookie |
| `/api/auth/logout` | POST | - | Remove cookie |
| `/api/docs` | GET | - | Lista docs (sidebar.json) |
| `/api/docs/[...slug]` | GET | - | Retorna conteúdo do .md |
| `/api/docs/[...slug]` | PUT | Admin | Salva .md |
| `/api/docs/[...slug]` | DELETE | Admin | Remove .md |
| `/api/reorder` | PUT | Admin | Atualiza sidebar.json |
| `/api/upload` | POST | Admin | Upload de imagem (max 5MB) |
| `/api/config` | GET | - | Retorna config.json |
| `/api/config` | PUT | Admin | Atualiza config.json |
| `/api/search-index` | GET | - | Retorna índice de busca |
| `/api/assets/images/[...path]` | GET | - | Serve imagens do bucket |

---

## Deploy

### Vercel (recomendado)

1. Faça push do repo para o GitHub
2. Importe no Vercel
3. Configure as variáveis de ambiente no painel do Vercel
4. Deploy

### Qualquer plataforma com Node.js

```bash
npm run build
npm start
```

Configure as variáveis de ambiente da mesma forma.

---

## Multi-tenant

Cada instância é independente e configurável via variáveis de ambiente:

1. Clone/fork o repo
2. Configure `STORAGE_BUCKET` e/ou `STORAGE_BASE_PATH` com valores diferentes
3. Deploy
4. Customize tudo pelo painel admin (nome, logo, cores, etc.)

O `config.json` no bucket define toda a identidade visual — sem precisar mexer em código.

---

## Licença

MIT
