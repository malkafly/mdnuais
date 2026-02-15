# OpenKB — Open Source Knowledge Base

## Visão Geral

Criar um knowledge base open source, bonito, simples e funcional. O app tem duas faces:

1. **Pública** — leitura dos documentos com navegação estilo Outline/Notion, busca rápida, TOC lateral, syntax highlighting, dark mode
2. **Admin** — editor markdown com paste de imagens (ctrl+v cola direto), CRUD de documentos e pastas, preview ao vivo, gerenciamento de configurações

O projeto se chama **OpenKB**. Será publicado no GitHub como open source.

---

## Stack Técnica

- **Framework**: Next.js 14+ (App Router)
- **Linguagem**: TypeScript (strict mode)
- **Estilização**: Tailwind CSS 3+
- **Editor Markdown**: Tiptap ou Milkdown (o que for melhor pra paste de imagens e extensibilidade) — NÃO usar textarea simples, precisa ser um editor WYSIWYG-like com toolbar
- **Markdown Rendering (público)**: react-markdown + rehype-raw + rehype-highlight (Shiki ou Prism) + remark-gfm
- **Busca**: Fuse.js (client-side, índice gerado no servidor e servido como JSON)
- **Storage**: S3-compatible (AWS S3 ou Cloudflare R2) — configurável via env vars. Usa o AWS SDK v3 (`@aws-sdk/client-s3`) que funciona pra ambos
- **Auth Admin**: Token simples via variável de ambiente `ADMIN_TOKEN`. Middleware protege todas as rotas `/admin/*`. Login é uma tela simples de senha que seta um cookie httpOnly
- **Cache**: In-memory cache no servidor (Map com TTL) para leitura dos .md e do índice de busca. Invalidação no save. TTL padrão: 5 minutos
- **Deploy target**: Vercel (mas deve funcionar em qualquer plataforma que rode Next.js)

---

## Arquitetura de Storage

Todos os arquivos vivem no bucket S3/R2. Não há filesystem local para conteúdo. Isso torna o deploy 100% stateless.

### Estrutura no Bucket

```
/openkb/
  config.json              ← configurações do site (nome, logo, cores, etc)
  sidebar.json             ← estrutura de navegação (ordem, títulos, hierarquia)
  /docs/
    /getting-started/
      index.md
      installation.md
    /api-reference/
      index.md
      endpoints.md
  /assets/
    /images/
      screenshot-2024-01-15-abc123.png
      logo.png
```

### config.json

```json
{
  "name": "Meu Knowledge Base",
  "logo": "/assets/images/logo.png",
  "favicon": "/assets/images/favicon.png",
  "colors": {
    "primary": "#2563eb",
    "primaryDark": "#60a5fa"
  },
  "footer": "© 2025 Minha Empresa",
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
      "title": "API Reference",
      "slug": "api-reference",
      "children": [
        { "title": "Visão Geral", "slug": "api-reference/index" },
        { "title": "Endpoints", "slug": "api-reference/endpoints" }
      ]
    }
  ]
}
```

O slug mapeia diretamente para o caminho do .md no bucket: `getting-started/installation` → `/openkb/docs/getting-started/installation.md`

---

## Variáveis de Ambiente

```env
# Storage (S3/R2)
STORAGE_ENDPOINT=https://xxx.r2.cloudflarestorage.com    # para R2, ou omitir para AWS S3
STORAGE_REGION=auto                                        # "auto" para R2, região real para S3
STORAGE_ACCESS_KEY_ID=seu_access_key
STORAGE_SECRET_ACCESS_KEY=seu_secret_key
STORAGE_BUCKET=meu-bucket
STORAGE_BASE_PATH=openkb                                   # prefixo no bucket (default: openkb)

# Auth
ADMIN_TOKEN=uma-senha-forte-aqui

# App
NEXT_PUBLIC_BASE_URL=https://docs.meusite.com              # URL pública do app
CACHE_TTL_SECONDS=300                                       # TTL do cache em memória (default: 300)
```

---

## Páginas e Rotas

### Públicas

| Rota | Descrição |
|------|-----------|
| `/` | Redirect para o primeiro documento do sidebar |
| `/docs/[...slug]` | Renderiza o .md correspondente ao slug |
| `/search?q=termo` | Página de resultados de busca |

### Admin (protegidas por middleware)

| Rota | Descrição |
|------|-----------|
| `/admin/login` | Tela de login (campo de senha) |
| `/admin` | Dashboard — lista de documentos, estatísticas básicas (total de docs, último editado) |
| `/admin/docs` | Lista/árvore de todos os documentos com drag-and-drop pra reordenar |
| `/admin/docs/new` | Criar novo documento (escolher pasta ou criar nova) |
| `/admin/docs/[...slug]/edit` | Editor do documento |
| `/admin/settings` | Editar config.json (nome, logo, cores, links, metadata) |

### API Routes (internas)

| Rota | Método | Descrição |
|------|--------|-----------|
| `/api/auth/login` | POST | Valida token, seta cookie |
| `/api/auth/logout` | POST | Remove cookie |
| `/api/docs` | GET | Lista todos os docs (para busca e sidebar) |
| `/api/docs/[...slug]` | GET | Retorna conteúdo do .md |
| `/api/docs/[...slug]` | PUT | Salva .md (admin) |
| `/api/docs/[...slug]` | DELETE | Remove .md (admin) |
| `/api/docs/reorder` | PUT | Atualiza sidebar.json (admin) |
| `/api/upload` | POST | Upload de imagem (paste/drag), retorna URL (admin) |
| `/api/config` | GET | Retorna config.json |
| `/api/config` | PUT | Atualiza config.json (admin) |
| `/api/search-index` | GET | Retorna índice de busca (JSON pré-processado) |

---

## Funcionalidades Detalhadas

### 1. Navegação Pública

**Layout**: sidebar fixa à esquerda (240px) + conteúdo central (max-width 800px) + TOC à direita (200px, sticky, hidden em telas < 1280px)

**Sidebar esquerda**:
- Logo + nome do projeto no topo (clicável, volta pro home)
- Árvore de navegação baseada no sidebar.json
- Itens com filhos são colapsáveis (seta de toggle)
- Item ativo highlighted
- Seção da sidebar é colapsável em mobile (hamburger menu)

**TOC direita** (Table of Contents):
- Gerado automaticamente dos headings h2 e h3 do markdown atual
- Scroll spy — destaca o heading visível na viewport
- Clique no item faz smooth scroll até o heading
- Sticky, acompanha o scroll

**Breadcrumbs**: no topo do conteúdo, mostra o caminho completo (ex: Primeiros Passos > Instalação)

**Headings clicáveis**: hover em qualquer heading mostra um ícone de link (🔗). Clicar copia o URL com âncora pro clipboard. Toast de confirmação "Link copiado!"

**Navegação inferior**: botões "← Anterior" e "Próximo →" no final de cada documento, baseado na ordem do sidebar.json

**Responsivo**:
- Desktop (≥1280px): sidebar + conteúdo + TOC
- Tablet (768-1279px): sidebar colapsável + conteúdo (TOC escondido ou dentro de um dropdown)
- Mobile (<768px): hamburger menu pra sidebar, conteúdo full-width

### 2. Busca (Ctrl+K)

**Command palette** estilo Spotlight/Raycast:
- Atalho: `Ctrl+K` ou `Cmd+K` abre o modal
- Campo de busca no topo com autofocus
- Resultados aparecem em tempo real conforme digita (debounce 200ms)
- Cada resultado mostra: título do doc, breadcrumb da seção, snippet com match highlighted
- Enter ou clique navega pro documento
- Esc fecha o modal
- Índice carregado via `/api/search-index` (cacheia no client)

**Motor**: Fuse.js configurado com:
- Busca nos campos: título, conteúdo (stripped de markdown syntax), headings
- Threshold: 0.3 (balanceado)
- Highlight dos matches

### 3. Editor Markdown (Admin)

**Editor**: usar Tiptap com extensões markdown — é o melhor pra paste de imagem e tem boa DX em React.

**Toolbar**:
- Bold, Italic, Strikethrough
- H1, H2, H3
- Bullet list, Ordered list
- Blockquote
- Code inline, Code block (com seletor de linguagem)
- Link
- Image (upload via botão)
- Table
- Horizontal rule
- Undo/Redo

**Paste de imagem (CRÍTICO)**:
- Ctrl+V com imagem no clipboard: intercepta o evento, faz upload via `/api/upload`, insere a referência markdown `![](url)` automaticamente
- Drag-and-drop de imagem: mesmo comportamento
- Upload via botão na toolbar: abre file picker, faz upload, insere
- Formatos aceitos: PNG, JPG, JPEG, GIF, WebP
- Limite: 5MB por imagem
- Nome do arquivo no bucket: `images/{timestamp}-{random6chars}.{ext}`
- Mostrar loading indicator durante upload
- Mostrar preview inline da imagem após upload

**Preview ao vivo**: split view opcional (editor à esquerda, preview à direita) ou toggle entre edição e preview

**Autosave**: NÃO fazer autosave (perigoso com storage remoto). Botão explícito "Salvar" (Ctrl+S). Indicador de "não salvo" quando há alterações pendentes. Confirmação ao tentar sair com alterações não salvas.

**Metadados do documento** (editáveis no topo da tela de edição):
- Título (obrigatório)
- Slug (auto-gerado do título, editável)
- Pasta/seção (dropdown ou campo com autocomplete)

### 4. CRUD de Documentos (Admin)

**Lista de documentos** (`/admin/docs`):
- Árvore com as seções e documentos, mesma estrutura do sidebar.json
- Drag-and-drop pra reordenar (tanto docs dentro de seções quanto seções entre si)
- Botão pra criar novo doc ou nova seção
- Cada item tem ações: Editar, Mover, Excluir
- Excluir pede confirmação
- Busca/filtro rápido na lista

**Criar documento**:
- Modal ou página com: título, seção (existente ou nova), posição
- Cria o .md no bucket e atualiza sidebar.json

**Criar seção**:
- Modal com: título da seção
- Cria a pasta no bucket e atualiza sidebar.json

### 5. Dark Mode

- Toggle no header (ícone sol/lua)
- Persiste preferência no localStorage
- Respeita `prefers-color-scheme` do sistema como default
- Implementar via classe `dark` no html + Tailwind dark variant
- Transição suave (200ms)

### 6. Syntax Highlighting

- Usar Shiki (melhor qualidade, themes bonitos)
- Theme light: `github-light`
- Theme dark: `github-dark`
- Suporte a todas linguagens comuns (js, ts, php, python, bash, json, yaml, sql, html, css, etc)
- Botão "Copiar código" no canto superior direito de cada bloco de código
- Line numbers opcionais

### 7. Compartilhar

- Botão de compartilhar no topo de cada documento
- Opções: Copiar link, abrir no Twitter/X, abrir no LinkedIn
- O link copiado inclui âncora se o usuário estiver numa seção específica

### 8. Configurações (Admin)

Tela `/admin/settings` com formulário pra editar o config.json:

- Nome do projeto
- Upload de logo
- Upload de favicon
- Cores (primary e primaryDark) — color picker
- Texto do footer
- Links sociais (GitHub, website, etc)
- Meta title e description (SEO)
- Preview ao vivo das mudanças

### 9. Multi-tenant

O app é multi-tenant por design: cada instância tem seu próprio bucket (ou base path dentro de um bucket). Para replicar:

1. Fork/clone o repo
2. Configura as env vars com outro bucket/path
3. Deploy

O `config.json` no bucket define toda a identidade visual. Não precisa mexer em código pra customizar.

---

## Design e UI

### Princípios

- **Clean e minimalista** — nada de firula, o conteúdo é rei
- **Rápido** — first contentful paint < 1s, navegação instantânea entre docs
- **Acessível** — contraste adequado, navegação por teclado, semântica HTML correta
- **Profissional** — parecer produto, não projeto de faculdade

### Inspirações visuais

- Stripe Docs (layout, tipografia)
- Tailwind Docs (sidebar, busca)
- Outline (navegação, simplicidade)
- GitBook (organização, TOC)

### Tipografia

- Font: `Inter` (via Google Fonts ou next/font)
- Heading sizes: h1 2rem, h2 1.5rem, h3 1.25rem
- Body: 1rem, line-height 1.75
- Code: `JetBrains Mono` ou `Fira Code`
- Max-width do conteúdo: 800px (centralized)

### Cores default (customizáveis via config.json)

Light mode:
- Background: #ffffff
- Sidebar bg: #f8fafc
- Text: #1e293b
- Primary: #2563eb
- Borders: #e2e8f0

Dark mode:
- Background: #0f172a
- Sidebar bg: #1e293b
- Text: #e2e8f0
- Primary: #60a5fa
- Borders: #334155

---

## Estrutura de Pastas do Projeto

```
openkb/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    ← root layout (fonts, theme provider)
│   │   ├── page.tsx                      ← redirect pro primeiro doc
│   │   ├── docs/
│   │   │   └── [...slug]/
│   │   │       └── page.tsx              ← renderiza markdown público
│   │   ├── search/
│   │   │   └── page.tsx                  ← resultados de busca
│   │   ├── admin/
│   │   │   ├── layout.tsx                ← layout admin (sidebar admin)
│   │   │   ├── page.tsx                  ← dashboard
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── docs/
│   │   │   │   ├── page.tsx              ← lista/árvore de docs
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [...slug]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx      ← editor
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   └── logout/route.ts
│   │       ├── docs/
│   │       │   └── [...slug]/route.ts
│   │       ├── docs/reorder/route.ts
│   │       ├── upload/route.ts
│   │       ├── config/route.ts
│   │       └── search-index/route.ts
│   ├── components/
│   │   ├── public/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TableOfContents.tsx
│   │   │   ├── Breadcrumbs.tsx
│   │   │   ├── MarkdownRenderer.tsx
│   │   │   ├── SearchModal.tsx
│   │   │   ├── DocNavigation.tsx         ← prev/next
│   │   │   ├── ShareButton.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── CodeBlock.tsx
│   │   └── admin/
│   │       ├── DocEditor.tsx             ← Tiptap editor wrapper
│   │       ├── DocTree.tsx               ← árvore com drag-and-drop
│   │       ├── ImageUploader.tsx
│   │       ├── SettingsForm.tsx
│   │       └── AdminSidebar.tsx
│   ├── lib/
│   │   ├── storage.ts                    ← adapter S3/R2 (read, write, delete, list, upload)
│   │   ├── cache.ts                      ← in-memory cache with TTL
│   │   ├── markdown.ts                   ← parsing, heading extraction, strip for search
│   │   ├── search.ts                     ← build search index, Fuse config
│   │   ├── auth.ts                       ← validate token, cookie helpers
│   │   └── config.ts                     ← read/write config.json, types
│   ├── types/
│   │   └── index.ts                      ← todas as interfaces TypeScript
│   └── middleware.ts                      ← protege /admin/* (exceto /admin/login)
├── public/
│   └── (apenas assets estáticos do app, não do conteúdo)
├── tailwind.config.ts
├── next.config.ts
├── package.json
├── tsconfig.json
├── .env.example
├── LICENSE                               ← MIT
└── README.md
```

---

## Regras de Código

- TypeScript strict mode, sem `any`
- SEM comentários no código
- SEM migrations, SEM ORM — não tem banco de dados
- Imports com `@/` alias
- Server Components por padrão, Client Components só quando necessário (editor, busca, theme toggle, interações)
- Error boundaries em todas as páginas
- Loading states (skeleton) em todas as páginas com fetch
- Tratamento de erro consistente (try/catch, toast no client, log no server)
- ESLint + Prettier configurados
- Nomes de variáveis e funções em inglês
- UI labels em inglês (o conteúdo é multilíngue, mas a interface do app é em inglês)

---

## Fluxo de Desenvolvimento

Implementar nesta ordem:

### Fase 1 — Foundation
1. Setup Next.js + TypeScript + Tailwind
2. Implementar `lib/storage.ts` (adapter S3/R2 com AWS SDK v3)
3. Implementar `lib/cache.ts` (in-memory com TTL)
4. Implementar `lib/auth.ts` + middleware
5. Criar `.env.example` e `config.json` de exemplo
6. Criar `sidebar.json` de exemplo com 3-4 docs de exemplo

### Fase 2 — Leitura Pública
7. Layout público (sidebar + conteúdo + TOC)
8. Renderização markdown com syntax highlighting
9. Sidebar com navegação baseada no sidebar.json
10. TOC com scroll spy
11. Breadcrumbs
12. Headings com link de âncora
13. Navegação prev/next
14. Dark mode
15. Responsividade (mobile/tablet/desktop)

### Fase 3 — Busca
16. Gerar índice de busca a partir dos docs
17. API route `/api/search-index`
18. SearchModal (Ctrl+K) com Fuse.js

### Fase 4 — Admin
19. Tela de login
20. Dashboard admin
21. Lista/árvore de documentos com drag-and-drop
22. Editor Tiptap com toolbar completa
23. Paste de imagem (upload pro S3/R2)
24. CRUD completo de docs (criar, editar, mover, excluir)
25. CRUD de seções
26. Tela de configurações (config.json)

### Fase 5 — Polish
27. Botão de compartilhar
28. Copiar código nos code blocks
29. Meta tags dinâmicas (SEO)
30. Favicon dinâmico
31. Loading skeletons
32. Error boundaries
33. README.md completo pra GitHub
34. LICENSE MIT

---

## Dependências Principais

```json
{
  "dependencies": {
    "next": "^14",
    "react": "^18",
    "react-dom": "^18",
    "@aws-sdk/client-s3": "^3",
    "@tiptap/react": "latest",
    "@tiptap/starter-kit": "latest",
    "@tiptap/extension-image": "latest",
    "@tiptap/extension-code-block-lowlight": "latest",
    "@tiptap/extension-table": "latest",
    "@tiptap/extension-link": "latest",
    "@tiptap/extension-placeholder": "latest",
    "react-markdown": "^9",
    "rehype-raw": "^7",
    "rehype-highlight": "latest",
    "remark-gfm": "^4",
    "shiki": "^1",
    "fuse.js": "^7",
    "@dnd-kit/core": "^6",
    "@dnd-kit/sortable": "^8",
    "sonner": "^1",
    "lucide-react": "latest"
  }
}
```

---

## Resumo do Projeto

**OpenKB** é um knowledge base open source feito com Next.js que:

- Armazena tudo (markdown + imagens + config) em S3/R2
- Tem um editor bonito com paste de imagem
- Tem navegação estilo Outline/Notion com sidebar + TOC
- Busca rápida via Ctrl+K
- Dark mode
- Auth simples por token
- Deploy stateless (Vercel/qualquer plataforma)
- Multi-tenant via config.json
- Open source, MIT license

Simples pra caralho de usar, bonito de olhar, e resolve o problema de ter docs bem organizados sem depender de serviço pago.