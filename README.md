# Conecta SUS+ 🏥

Plataforma de agendamento de consultas no SUS.  
**Stack:** Next.js 14 · TypeScript · Tailwind CSS · Node.js · Express · MongoDB

---

## Pré-requisitos

| Ferramenta | Versão mínima | Download |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| MongoDB | 7+ | https://www.mongodb.com/try/download/community |
| npm | 9+ | (vem com Node) |

---

## Estrutura do projeto

```
conecta-sus/
├── frontend/          ← Next.js (porta 3000)
│   ├── src/
│   │   ├── app/           ← páginas (roteamento Next.js App Router)
│   │   ├── components/    ← ui, layout, accessibility, map
│   │   ├── hooks/         ← useAuth, useAgendamento, useGeolocation
│   │   ├── services/      ← chamadas à API backend
│   │   ├── types/         ← interfaces TypeScript (UML)
│   │   ├── utils/         ← cn, formatDate, etc.
│   │   └── styles/        ← globals.css
│   ├── .env.local         ← (você cria, ver abaixo)
│   └── package.json
│
├── backend/           ← Express + Mongoose (porta 4000)
│   ├── src/
│   │   ├── models/        ← schemas Mongoose
│   │   ├── routes/        ← rotas da API
│   │   ├── middleware/    ← autenticação JWT
│   │   ├── database.ts    ← conexão MongoDB
│   │   ├── seed.ts        ← dados iniciais de teste
│   │   └── index.ts       ← entry point
│   ├── .env               ← (você cria, ver abaixo)
│   └── package.json
│
└── README.md
```

---

## PARTE 4 — Passo a passo para rodar

### 1. Clone / abra o projeto no VS Code

```bash
# Se ainda não tem a pasta:
cd Desktop
# Abra a pasta conecta-sus no VS Code
code conecta-sus
```

---

### 2. Configure o Backend

```bash
# Entre na pasta backend
cd backend

# Instale as dependências
npm install

# Crie o arquivo .env copiando o exemplo
cp .env.example .env
```

Abra o arquivo `.env` e ajuste se necessário:

```env
MONGO_URI=mongodb://localhost:27017/conectasus
PORT=4000
JWT_SECRET=troque_por_um_segredo_forte_aqui
JWT_EXPIRES_IN=7d
```

> **MongoDB local:** certifique-se que o MongoDB está rodando.  
> Windows: pesquise "Services" → inicie "MongoDB".  
> Mac/Linux: `brew services start mongodb-community` ou `sudo systemctl start mongod`

---

### 3. Popule o banco com dados de teste (seed)

```bash
# Ainda dentro de /backend
npx ts-node src/seed.ts
```

Saída esperada:
```
✅ MongoDB conectado
✅ 15 especialidades criadas
✅ 3 unidades criadas
✅ Usuários criados
✅ Agendas criadas

📋 Credenciais de teste:
  Paciente:       CPF 123.456.789-00 / senha: senha123
  Médico:         CPF 000.000.000-02 / senha: senha123
  Administrador:  CPF 000.000.000-01 / senha: senha123
```

---

### 4. Rode o Backend

```bash
# Ainda dentro de /backend
npm run dev
```

Saída esperada:
```
✅ MongoDB conectado
🚀 Backend rodando em http://localhost:4000
📋 Health: http://localhost:4000/health
```

**Teste no navegador:** abra http://localhost:4000/health  
Deve retornar: `{"status":"ok","timestamp":"..."}`

---

### 5. Configure o Frontend

```bash
# Abra um NOVO terminal, entre na pasta frontend
cd frontend

# Instale as dependências
npm install

# Crie o .env.local
cp .env.local.example .env.local
```

O `.env.local` deve conter:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

### 6. Rode o Frontend

```bash
# Ainda dentro de /frontend
npm run dev
```

Saída esperada:
```
▲ Next.js 14.2.3
- Local: http://localhost:3000
```

**Abra no navegador:** http://localhost:3000

---

## Rotas disponíveis no Frontend

| Rota | Descrição |
|---|---|
| `/` | Landing page |
| `/login` | Login do paciente |
| `/medico/login` | Login do médico |
| `/cadastro` | Cadastro de paciente |
| `/dashboard` | Painel do paciente |
| `/agendamento/especialidade` | Wizard — passo 1 |
| `/agendamento/unidade` | Wizard — passo 2 |
| `/agendamento/medico` | Wizard — passo 3 |
| `/agendamento/horario` | Wizard — passo 4 |
| `/agendamento/confirmacao` | Wizard — passo 5 |
| `/medico` | Painel do médico |
| `/admin` | Painel do administrador |
| `/admin/unidades` | Cadastrar unidade |
| `/admin/especialidades` | Cadastrar especialidade |
| `/admin/profissionais` | Cadastrar profissional |
| `/admin/agendas` | Organizar agenda |

---

## Rotas da API (Backend)

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/especialidades
POST   /api/especialidades        (admin)

GET    /api/unidades
GET    /api/unidades/:id
POST   /api/unidades              (admin)

GET    /api/profissionais
GET    /api/profissionais/:id
POST   /api/profissionais         (admin)

GET    /api/agendas/horarios?profissionalId=X&data=YYYY-MM-DD
POST   /api/agendas               (admin)
PUT    /api/agendas/:id           (admin)

GET    /api/agendamentos
POST   /api/agendamentos
PATCH  /api/agendamentos/:id/cancelar

GET    /api/admin/stats           (admin)

GET    /health
```

---

## Testar a API com curl

```bash
# Verificar conexão
curl http://localhost:4000/health

# Login paciente
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"cpf":"12345678900","senha":"senha123"}'

# Listar especialidades
curl http://localhost:4000/api/especialidades
```

---

## Problemas comuns

| Problema | Solução |
|---|---|
| `MongooseServerSelectionError` | MongoDB não está rodando. Inicie o serviço. |
| `EADDRINUSE 4000` | Porta ocupada. Mude `PORT` no `.env`. |
| `EADDRINUSE 3000` | Porta ocupada. Rode `npm run dev -- -p 3001` |
| Tela branca no Next.js | Verifique se `.env.local` existe e tem `NEXT_PUBLIC_API_URL` |
| `Unauthorized` nas rotas | Faça login primeiro para obter o token JWT |

---

## PARTE 5 — Próximos passos

1. **Autenticação real** — implementar refresh token e proteção de rotas no Next.js com middleware
2. **Integração de mapa** — adicionar Leaflet (gratuito) no `MapContainer`
3. **Libras** — integrar widget VLibras oficial
4. **Upload de foto** — perfil do profissional (Cloudinary ou AWS S3)
5. **Notificações** — e-mail de confirmação de agendamento (Nodemailer)
6. **Testes** — Jest + React Testing Library no frontend, Jest + Supertest no backend
7. **Deploy** — Frontend: Vercel · Backend: Railway · Banco: MongoDB Atlas (gratuito)

---

## Credenciais de teste

| Perfil | CPF | Senha |
|---|---|---|
| Paciente | 123.456.789-00 | senha123 |
| Médico | 000.000.000-02 | senha123 |
| Admin | 000.000.000-01 | senha123 |
