# 🎓 Presensee — Backend API

API RESTful para o sistema de monitoramento de frequência escolar e prevenção de evasão.

---

## 🚀 Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações (especialmente JWT_SECRET)

# 3. Popular banco com dados de teste
npm run seed

# 4. Iniciar em modo desenvolvimento
npm run dev

# Ou em produção:
npm start
```

O servidor sobe em `http://localhost:3000`.

---

## 🗂️ Endpoints

### Autenticação (`/api/auth`)
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/login` | Login — retorna JWT |
| POST | `/cadastrar` | Cadastrar novo usuário |
| GET | `/perfil` | Dados do usuário logado |
| PUT | `/alterar-senha` | Alterar senha |

### Alunos (`/api/alunos`)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Listar alunos (filtros: turmaId, statusEvasao, busca) |
| GET | `/:id` | Buscar aluno por ID |
| GET | `/:id/frequencia` | Frequência do aluno (filtros: mes, ano, turmaId) |
| POST | `/` | Cadastrar aluno |
| PUT | `/:id` | Atualizar aluno |
| DELETE | `/:id` | Desativar aluno |
| POST | `/:id/biometria` | Cadastrar foto biométrica |

### Turmas (`/api/turmas`)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Listar turmas |
| GET | `/:id` | Buscar turma por ID (com alunos) |
| POST | `/` | Criar turma |
| PUT | `/:id` | Atualizar turma |
| DELETE | `/:id` | Desativar turma |

### Frequências (`/api/frequencias`)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Buscar chamada por turma e data (`?turmaId=&data=`) |
| POST | `/chamada` | Registrar chamada completa de uma turma |
| PUT | `/:id/justificar` | Justificar uma falta |

### Alertas (`/api/alertas`)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Listar alertas (filtros: turmaId, alunoId, tipo, resolvido) |
| GET | `/nao-lidos` | Contar alertas não lidos |
| PUT | `/:id/lido` | Marcar alerta como lido |
| PUT | `/:id/resolver` | Resolver alerta |

### Dashboard (`/api/dashboard`)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/resumo` | Indicadores gerais |
| GET | `/evolucao-mensal` | Frequência dos últimos 6 meses |
| GET | `/frequencia-por-turma` | Frequência agrupada por turma |
| GET | `/relatorio-mensal` | Relatório completo mensal |

---

## 🧠 Regras de negócio

- **Aluno com ≥ 25% de faltas** → Alerta de `percentual` gerado automaticamente
- **4 faltas consecutivas** → Alerta de `consecutivas` gerado automaticamente
- Alertas são gerados assincronamente após cada registro de chamada
- Status de evasão do aluno: `normal` → `atencao` → `risco` → `evadido`

---

## 🔐 Autenticação

Todas as rotas (exceto `/api/auth/login` e `/api/auth/cadastrar`) requerem JWT:

```
Authorization: Bearer <token>
```

### Perfis e permissões
| Perfil | Permissões |
|--------|-----------|
| `professor` | Ver turmas próprias, registrar chamada, ver alertas |
| `coordenador` | Tudo do professor + gerenciar alunos e turmas |
| `secretaria` | Gerenciar alunos e turmas, ver relatórios |
| `gestor` | Acesso total |

---

## 🗄️ Banco de dados

Por padrão usa **SQLite** (arquivo `database.sqlite`). Para produção, configure PostgreSQL no `.env`:

```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=presensee
DB_USER=postgres
DB_PASSWORD=senha
```

---

## 📦 Exemplo de requisição — Registrar chamada

```json
POST /api/frequencias/chamada
Authorization: Bearer <token>

{
  "turmaId": "uuid-da-turma",
  "data": "2025-06-10",
  "metodoRegistro": "manual",
  "registros": [
    { "alunoId": "uuid-aluno-1", "presente": true },
    { "alunoId": "uuid-aluno-2", "presente": false, "justificada": false },
    { "alunoId": "uuid-aluno-3", "presente": false, "justificada": true, "justificativa": "Atestado médico" }
  ]
}
```

---

## 🛠️ Stack

- **Node.js** + **Express**
- **Sequelize** ORM (SQLite / PostgreSQL)
- **JWT** para autenticação
- **bcryptjs** para hash de senhas
- **Helmet** + **express-rate-limit** para segurança
