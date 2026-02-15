# mdnuais

**Manual de sistemas online em Markdown** — Knowledge base open source, bonito, simples e funcional.

Armazena tudo (markdown, imagens, configurações) em S3/R2, tem editor rico com paste de imagens, navegação estilo Outline/Notion, busca rápida, dark mode e deploy 100% stateless.

---

## Features

**Interface pública**
- Categorias e subcategorias com grid responsivo
- Table of Contents (TOC) com scroll spy automático
- Breadcrumbs hierárquicos (Home > Categoria > Subcategoria > Artigo)
- Navegação anterior/próximo entre artigos da mesma categoria
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
- Dashboard com estatísticas (total de artigos e categorias)
- CRUD completo de artigos e categorias com suporte a subcategorias
- Hierarquia visual de categorias com indentação e seletor de categoria pai
- Editor Tiptap com toolbar completa (bold, italic, headings, listas, citações, código, tabelas, links, imagens)
- Paste de imagem via `Ctrl+V` e drag-and-drop (upload direto pro S3/R2)
- Importação em massa via ZIP (com suporte a subcategorias)
- Configurações do site (nome, logo, favicon, cores, footer, links sociais, SEO)
- Atalho `Ctrl+S` para salvar, indicador de alterações não salvas

**Importação via ZIP**
- Formato simples: `zip > categoria > artigos.md`
- Formato com subcategorias: `zip > categoria > subcategoria > artigos.md`
- Formato misto: categorias com e sem subcategorias no mesmo ZIP
- Detecção automática de pasta wrapper (raiz)
- Estratégias de conflito: pular existentes ou sobrescrever
- Status padrão configurável (publicado/rascunho)

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
│   │   ├── layout.tsx                    # Root layout (fonts, theme, toaster)
│   │   ├── page.tsx                      # Home com grid de categorias
│   │   ├── not-found.tsx                 # Página 404
│   │   ├── categories/[...slug]/page.tsx # Categoria ou subcategoria
│   │   ├── articles/[slug]/page.tsx      # Renderiza artigo markdown
│   │   ├── search/page.tsx               # Resultados de busca
│   │   ├── admin/
│   │   │   ├── layout.tsx                # Layout admin (sidebar)
│   │   │   ├── page.tsx                  # Dashboard
│   │   │   ├── login/page.tsx            # Login
│   │   │   ├── categories/page.tsx       # Gerenciar categorias e subcategorias
│   │   │   ├── docs/page.tsx             # Lista de artigos
│   │   │   ├── docs/new/page.tsx         # Criar artigo
│   │   │   ├── docs/edit/[...slug]/      # Editor do artigo
│   │   │   ├── import/page.tsx           # Importar conteúdo via ZIP
│   │   │   └── settings/page.tsx         # Configurações do site
│   │   └── api/
│   │       ├── auth/login/route.ts       # POST - login
│   │       ├── auth/logout/route.ts      # POST - logout
│   │       ├── articles/route.ts         # GET - lista artigos
│   │       ├── articles/[slug]/route.ts  # GET/PUT/DELETE - artigo
│   │       ├── categories/route.ts       # GET/PUT - categorias
│   │       ├── import/route.ts           # POST - importação via ZIP
│   │       ├── upload/route.ts           # POST - upload de imagem
│   │       ├── config/route.ts           # GET/PUT - config.json
│   │       ├── search-index/route.ts     # GET - índice de busca
│   │       └── assets/images/[...path]   # GET - servir imagens do S3
│   ├── components/
│   │   ├── public/                       # Componentes da interface pública
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── CategoryGrid.tsx
│   │   │   ├── ArticleList.tsx
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
│   │   └── admin/                        # Componentes do painel admin
│   │       ├── AdminSidebar.tsx
│   │       └── DocEditor.tsx
│   ├── lib/
│   │   ├── storage.ts                    # Adapter S3/R2
│   │   ├── cache.ts                      # Cache in-memory com TTL
│   │   ├── auth.ts                       # Autenticação por token
│   │   ├── config.ts                     # Read/write config.json
│   │   ├── categories.ts                 # CRUD categorias + helpers subcategoria
│   │   ├── articles.ts                   # CRUD artigos
│   │   ├── markdown.ts                   # Parsing, headings, strip
│   │   ├── search.ts                     # Build do índice de busca
│   │   ├── sanitize-svg.ts              # Sanitização de SVG
│   │   └── i18n.ts                       # Internacionalização
│   ├── locales/
│   │   └── pt.ts                         # Dicionário português
│   ├── types/
│   │   └── index.ts                      # Interfaces TypeScript
│   └── middleware.ts                     # Proteção das rotas /admin/*
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
├── config.json                # Configurações do site
├── categories.json            # Categorias e subcategorias
├── docs/
│   ├── artigo-1.json          # Metadata do artigo
│   ├── artigo-1.md            # Conteúdo markdown
│   ├── artigo-2.json
│   └── artigo-2.md
└── assets/
    └── images/
        ├── logo.png
        └── 1707912345-abc123.png
```

### categories.json

Define as categorias e subcategorias. Subcategorias possuem `parentId` apontando para a categoria pai:

```json
{
  "categories": [
    {
      "id": "uuid-1",
      "title": "Financeiro",
      "description": "Módulos financeiros",
      "slug": "financeiro",
      "icon": "<svg>...</svg>",
      "iconBgColor": "#EEF2FF",
      "order": 0,
      "parentId": null
    },
    {
      "id": "uuid-2",
      "title": "Contas a Pagar",
      "description": "",
      "slug": "contas-a-pagar",
      "icon": "<svg>...</svg>",
      "iconBgColor": "#FEF3C7",
      "order": 0,
      "parentId": "uuid-1"
    }
  ]
}
```

### Metadata do artigo (docs/*.json)

```json
{
  "title": "Como cadastrar uma conta",
  "slug": "como-cadastrar-conta",
  "category": "uuid-2",
  "status": "published",
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z",
  "order": 0
}
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

---

## Importação via ZIP

Importe conteúdo em massa pelo painel admin. A estrutura do ZIP é detectada automaticamente:

### Formato simples (sem subcategorias)

```
manual.zip/
├── financeiro/
│   ├── artigo-1.md
│   └── artigo-2.md
├── recursos-humanos/
│   └── artigo-3.md
```

### Formato com subcategorias

```
manual.zip/
├── financeiro/
│   ├── contas-a-pagar/
│   │   ├── artigo-1.md
│   │   └── artigo-2.md
│   ├── contas-a-receber/
│   │   └── artigo-3.md
│   └── visao-geral.md          ← artigo direto na categoria
├── recursos-humanos/
│   ├── artigo-4.md
│   └── artigo-5.md
```

- Pastas de 1o nível = **categorias**
- Subpastas = **subcategorias** (vinculadas à categoria pai)
- Arquivos `.md` = **artigos** (vinculados à categoria/subcategoria mais próxima)
- O título do artigo é extraído do primeiro `# Heading` do markdown, ou gerado a partir do nome do arquivo
- Nomes de pasta em `kebab-case` são convertidos para Title Case automaticamente

---

## Rotas

### Páginas públicas

| Rota | Descrição |
|------|-----------|
| `/` | Home com grid de categorias |
| `/categories/{slug}` | Categoria (mostra subcategorias e/ou artigos) |
| `/categories/{slug}/{sub}` | Subcategoria (mostra artigos) |
| `/articles/{slug}` | Artigo com TOC e navegação |
| `/search` | Resultados de busca |

### API

| Rota | Método | Auth | Descrição |
|------|--------|------|-----------|
| `/api/auth/login` | POST | - | Valida token, seta cookie |
| `/api/auth/logout` | POST | - | Remove cookie |
| `/api/categories` | GET | - | Lista categorias com contagem de artigos |
| `/api/categories` | PUT | Admin | Salva categorias (incluindo subcategorias) |
| `/api/articles` | GET | - | Lista artigos (filtrável por categoria/status) |
| `/api/articles/[slug]` | GET | - | Retorna artigo (metadata + conteúdo) |
| `/api/articles/[slug]` | PUT | Admin | Salva artigo |
| `/api/articles/[slug]` | DELETE | Admin | Remove artigo |
| `/api/import` | POST | Admin | Importação via ZIP |
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
