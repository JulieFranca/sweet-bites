# Sweet Bites

Sistema de gestao para confeitaria artesanal. Controle de inventario, receitas com custo automatico, producao, lista de compras em tempo real e relatorios.

## Stack Tecnologica

### Frontend
- **Vue.js 3** (Composition API) + TypeScript
- **Tailwind CSS v3** para estilizacao
- **Pinia** para gerenciamento de estado
- **Vue Router 4** com lazy loading e guards de navegacao
- **Vite 6** para build e HMR
- **VeeValidate + Zod** para validacao de formularios
- **Axios** para HTTP com interceptors
- **vite-plugin-pwa** para suporte offline

### Backend
- **Node.js 20 LTS**
- **Fastify v5** com schema JSON nativo
- **Zod** para validacao (schemas compartilhados com frontend)
- **Firebase Admin SDK** para autenticacao e Firestore

### Firebase
- **Firestore** - Banco de dados principal (NoSQL, tempo real)
- **Firebase Auth** - Autenticacao de usuarios
- **Firebase Storage** - Upload de imagens
- **Cloud Functions** - Triggers de recalculo de custos

## Estrutura do Projeto

```
sweet-bites/
├── frontend/           # Vue.js 3 SPA
│   ├── src/
│   │   ├── assets/     # CSS, imagens
│   │   ├── components/ # Componentes reutilizaveis
│   │   ├── composables/# Logica reutilizavel
│   │   ├── config/     # Firebase config
│   │   ├── router/     # Vue Router + guards
│   │   ├── services/   # Camada de API (Axios)
│   │   ├── stores/     # Pinia stores
│   │   ├── types/      # TypeScript interfaces + Zod schemas
│   │   ├── utils/      # Formatadores, conversores
│   │   └── views/      # Paginas (lazy loaded)
│   └── ...
├── backend/            # Fastify API
│   ├── src/
│   │   ├── config/     # Env, Firebase Admin
│   │   ├── plugins/    # Auth, CORS
│   │   ├── modules/    # auth, inventory, recipes, products, production, shopping
│   │   └── shared/     # Types, errors, utils
│   └── ...
├── firestore.rules     # Regras de seguranca do Firestore
└── README.md
```

## Setup

### Pre-requisitos
- Node.js >= 20 LTS
- npm >= 10
- Firebase project configurado

### 1. Clonar o repositorio
```bash
git clone https://github.com/JulieFranca/sweet-bites.git
cd sweet-bites
```

### 2. Frontend
```bash
cd frontend
cp .env.example .env
# Editar .env com suas credenciais Firebase
npm install
npm run dev
```
O frontend roda em `http://localhost:3000`

### 3. Backend
```bash
cd backend
cp .env.example .env
# Editar .env com suas credenciais Firebase Admin
npm install
npm run dev
```
O backend roda em `http://localhost:3001`

## Modulos

### MVP (Fase 1) - Implementado
- **Autenticacao** - Login, registro, aprovacao de usuarios, guards de navegacao
- **Inventario** - CRUD completo, historico de precos, categorias, alertas de estoque
- **Receitas** - CRUD com ingredientes, calculo automatico de custo, rendimento
- **Dashboard** - Cards de resumo, alertas de estoque, acoes rapidas
- **Conversao de Unidades** - Tabela de conversao com overrides por ingrediente

### Fase 2 (Planejado)
- **Produtos** - Vinculo receita + embalagem, margem de lucro, preco de venda
- **Producao** - Dry run, baixa de estoque, historico
- **Lista de Compras** - Tempo real, sincronizacao multi-dispositivo

### Fase 3 (Planejado)
- **Relatorios** - Custos, rentabilidade, exportacao CSV/JSON
- **Notificacoes** - Estoque baixo, precos atualizados, producao
- **PWA Offline** - Cache completo, producao offline

## Scripts

### Frontend
| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de producao |
| `npm run preview` | Preview do build |
| `npm run typecheck` | Verificacao de tipos |

### Backend
| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Servidor com hot reload |
| `npm run build` | Compilar TypeScript |
| `npm run start` | Iniciar servidor compilado |
| `npm run typecheck` | Verificacao de tipos |

## API Endpoints

Base URL: `/api/v1`

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/health` | Health check |
| POST | `/auth/register` | Registrar usuario |
| GET | `/auth/me` | Perfil do usuario |
| GET | `/inventory` | Listar inventario |
| POST | `/inventory` | Criar item |
| PUT | `/inventory/:id` | Atualizar item |
| PATCH | `/inventory/:id/price` | Atualizar preco |
| DELETE | `/inventory/:id` | Desativar item |
| GET | `/recipes` | Listar receitas |
| POST | `/recipes` | Criar receita |
| GET | `/recipes/:id` | Detalhe da receita |
| PUT | `/recipes/:id` | Atualizar receita |
| DELETE | `/recipes/:id` | Desativar receita |

## Licenca

Projeto privado - Sweet Bites.
