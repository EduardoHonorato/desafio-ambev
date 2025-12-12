# Sistema de Gestão de Funcionários

Sistema completo de gestão de funcionários desenvolvido com .NET 8 (Clean Architecture), React (Vite + TypeScript), TailwindCSS, shadcn/ui, JWT, MySQL e Docker.

## 📋 Índice

- [Características](#características)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Execução](#instalação-e-execução)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Endpoints](#api-endpoints)
- [Usuários e Permissões](#usuários-e-permissões)
- [Validações](#validações)
- [Configuração JWT](#configuração-jwt)
- [Front-end](#front-end)
- [Testes](#testes)
- [Docker](#docker)
- [Requisitos do Desafio](#requisitos-do-desafio)

## 🚀 Características

- ✅ Autenticação JWT com 2FA (código OTP por email 'mailhog')
- ✅ CRUD completo de funcionários, departamentos e cargos
- ✅ Sistema de permissões baseado em cargos (Employee, Leader, Director)
- ✅ Validações de negócio (idade mínima, documentos únicos, etc.)
- ✅ Dashboard com estatísticas
- ✅ Interface moderna e responsiva com shadcn/ui
- ✅ Hot reload automático
- ✅ Docker Compose para ambiente completo

## 🛠 Tecnologias

### Back-end
- .NET 8
- Clean Architecture
- Entity Framework Core (MySQL)
- JWT Authentication
- MailHog (email testing)
- Swagger/OpenAPI

### Front-end
- React 18
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui
- React Query
- Axios
- React Router

### Infraestrutura
- Docker & Docker Compose
- MySQL 8.0
- MailHog

## 📦 Pré-requisitos

- Docker & Docker Compose instalados

## 🔧 Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/EduardoHonorato/desafio-ambev.git
cd desafio
```

### 2. Execute com Docker Compose

```bash
docker-compose up -d
```

Isso irá iniciar:
- MySQL na porta 3007 (mapeada para 3306 interna)
- API na porta 3006 (com hot reload)
- Front-end na porta 3005 (com hot reload)
- MailHog na porta 8025 (interface web) e 1025 (SMTP)

### 3. Acesse a aplicação

- **Front-end**: http://localhost:3005
- **API Swagger**: http://localhost:3006
- **MailHog (emails)**: http://localhost:8025

### Comandos úteis

```bash
# Ver logs
docker-compose logs -f

# Parar containers
docker-compose down

# Reconstruir containers
docker-compose build
docker-compose up -d

# Ver logs de um serviço específico
docker-compose logs -f api
docker-compose logs -f frontend
```

## 📁 Estrutura do Projeto

### Backend (Clean Architecture)

```
backend/
├── EmployeeManagement.API/                    # Camada de apresentação
│   ├── Controllers/                          # Controllers da API
│   │   ├── AuthController.cs                # Autenticação (login, OTP)
│   │   ├── EmployeesController.cs            # CRUD de funcionários
│   │   ├── DepartmentsController.cs          # CRUD de departamentos
│   │   └── PositionsController.cs            # CRUD de cargos
│   ├── Program.cs                            # Configuração da aplicação
│   └── appsettings.json                      # Configurações (JWT, DB, etc)
│
├── EmployeeManagement.Application/            # Camada de casos de uso
│   ├── Services/                             # Serviços de negócio
│   │   ├── IEmployeeService.cs               # Interface do serviço
│   │   ├── EmployeeService.cs                # Lógica de negócio de funcionários
│   │   ├── IAuthService.cs                   # Interface de autenticação
│   │   └── AuthService.cs                    # Lógica de autenticação e OTP
│   ├── DTOs/                                 # Data Transfer Objects
│   │   ├── EmployeeDto.cs
│   │   ├── CreateEmployeeRequest.cs
│   │   ├── UpdateEmployeeRequest.cs
│   │   ├── UpdateProfileRequest.cs
│   │   ├── LoginRequest.cs
│   │   ├── LoginResponse.cs
│   │   └── VerifyOtpRequest.cs
│   └── DependencyInjection.cs                # Injeção de dependências
│
├── EmployeeManagement.Domain/                 # Camada de domínio
│   ├── Entities/                             # Entidades do domínio
│   │   ├── Employee.cs                       # Entidade Funcionário
│   │   ├── Phone.cs                          # Entidade Telefone
│   │   ├── Department.cs                     # Entidade Departamento
│   │   ├── Position.cs                       # Entidade Cargo
│   │   └── OtpCode.cs                        # Entidade Código OTP
│   └── Interfaces/                           # Interfaces (contratos)
│       ├── IEmployeeRepository.cs
│       ├── IPasswordHasher.cs
│       ├── IJwtTokenService.cs
│       ├── IEmailService.cs
│       └── IOtpCodeRepository.cs
│
├── EmployeeManagement.Infrastructure/         # Camada de infraestrutura
│   ├── Data/                                 # Acesso a dados
│   │   ├── ApplicationDbContext.cs           # Contexto do EF Core
│   │   └── DataSeeder.cs                     # Seed inicial do banco
│   ├── Repositories/                         # Implementação dos repositórios
│   │   ├── Repository.cs                     # Repositório genérico
│   │   ├── EmployeeRepository.cs             # Repositório de funcionários
│   │   └── OtpCodeRepository.cs              # Repositório de códigos OTP
│   ├── Services/                             # Serviços de infraestrutura
│   │   ├── PasswordHasher.cs                 # Hash de senhas
│   │   ├── JwtTokenService.cs                # Geração de tokens JWT
│   │   └── EmailService.cs                   # Envio de emails (MailHog)
│   └── DependencyInjection.cs                # Configuração de DI
│
└── EmployeeManagement.Tests/                 # Testes unitários
    └── Services/
        ├── EmployeeServiceTests.cs            # Testes do serviço de funcionários
        └── AuthServiceTests.cs                # Testes do serviço de autenticação
```

### Frontend

```
frontend/
├── src/
│   ├── components/                           # Componentes reutilizáveis
│   │   ├── Header.tsx                        # Cabeçalho da aplicação
│   │   ├── Sidebar.tsx                       # Menu lateral
│   │   ├── ProtectedRoute.tsx                 # Rota protegida (JWT)
│   │   └── ui/                               # Componentes shadcn/ui
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── data-table.tsx
│   │       ├── toast.tsx
│   │       ├── profile-modal.tsx
│   │       └── ...
│   │
│   ├── pages/                                # Páginas da aplicação
│   │   ├── LoginPage.tsx                     # Página de login
│   │   ├── OtpPage.tsx                       # Página de verificação OTP
│   │   ├── dashboard/                        # Dashboard
│   │   │   └── index.tsx
│   │   ├── employees/                        # Funcionários
│   │   │   ├── index.tsx                     # Listagem
│   │   │   ├── create/                       # Criação
│   │   │   ├── edit/                         # Edição
│   │   │   └── hooks/                        # Hooks específicos
│   │   │       └── useEmployees.ts
│   │   ├── departments/                      # Departamentos
│   │   │   ├── index.tsx
│   │   │   ├── create/
│   │   │   ├── edit/
│   │   │   └── hooks/
│   │   │       └── useDepartments.ts
│   │   └── positions/                         # Cargos
│   │       ├── index.tsx
│   │       ├── create/
│   │       ├── edit/
│   │       └── hooks/
│   │           └── usePositions.ts
│   │
│   ├── services/                             # Serviços de API
│   │   ├── api.ts                            # Configuração do Axios
│   │   └── authService.ts                    # Serviços de autenticação e funcionários
│   │
│   ├── hooks/                                # Custom hooks globais
│   │   └── useAuth.ts                        # Hook de autenticação
│   │
│   ├── layouts/                              # Layouts
│   │   └── AdminLayout.tsx                   # Layout principal da aplicação
│   │
│   ├── utils/                                # Utilitários
│   │   ├── validation.ts                    # Validações (CPF, telefone, etc)
│   │   └── masks.ts                         # Máscaras de formatação
│   │
│   ├── config.ts                            # Configurações (rotas, endpoints)
│   ├── App.tsx                              # Componente raiz
│   └── main.tsx                             # Entry point
│
├── test/                                     # Testes do frontend
│   ├── employees/                           # Testes de funcionários
│   ├── departments/                         # Testes de departamentos
│   ├── positions/                           # Testes de cargos
│   ├── dashboard/                           # Testes do dashboard
│   └── setup.ts                             # Configuração dos testes
│
├── Dockerfile                                # Dockerfile de produção
├── Dockerfile.dev                           # Dockerfile de desenvolvimento (hot reload)
├── vite.config.ts                           # Configuração do Vite
└── package.json                             # Dependências e scripts
```

### Raiz do Projeto

```
desafio/
├── backend/                                  # Backend .NET 8
├── frontend/                                 # Frontend React
├── docker-compose.yml                       # Orquestração Docker
└── README.md                                # Este arquivo
```

## 🔌 API Endpoints

### Autenticação

- `POST /api/auth/login` - Login (envia código OTP por email)
- `POST /api/auth/verify-otp` - Verifica código OTP e retorna token JWT
- `POST /api/auth/resend-otp` - Reenvia código OTP

### Funcionários

- `GET /api/employees` - Listar todos os funcionários
- `GET /api/employees/{id}` - Obter funcionário por ID
- `POST /api/employees` - Criar funcionário
- `PUT /api/employees/{id}` - Atualizar funcionário
- `PUT /api/employees/profile` - Atualizar perfil do usuário autenticado
- `DELETE /api/employees/{id}` - Excluir funcionário

### Departamentos

- `GET /api/departments` - Listar departamentos (paginado)
- `GET /api/departments/{id}` - Obter departamento por ID
- `POST /api/departments` - Criar departamento
- `PUT /api/departments/{id}` - Atualizar departamento
- `DELETE /api/departments/{id}` - Excluir departamento

### Cargos

- `GET /api/positions` - Listar cargos (paginado, filtro por departamento)
- `GET /api/positions/{id}` - Obter cargo por ID
- `POST /api/positions` - Criar cargo
- `PUT /api/positions/{id}` - Atualizar cargo
- `DELETE /api/positions/{id}` - Excluir cargo

**Nota:** Todos os endpoints (exceto autenticação) requerem autenticação JWT.

### Documentação Swagger

Acesse http://localhost:3006 para ver a documentação completa da API.

## 👤 Usuários e Permissões

### Cargos

- **Employee (Funcionário)**: Pode gerenciar apenas funcionários com cargo Employee
- **Leader (Líder)**: Pode gerenciar funcionários com cargo Employee e Leader
- **Director (Diretor)**: Pode gerenciar todos os cargos

### Credenciais Padrão

O sistema cria automaticamente um usuário administrador inicial quando o banco de dados é criado pela primeira vez:

- **Email**: `admin@example.com`
- **Senha**: `admin123`
- **Cargo**: Director (acesso total ao sistema)


### Fluxo de Autenticação

1. Faça login com email e senha
2. Um código OTP de 6 dígitos será enviado para seu email (mailhog no docker)
3. Verifique o código OTP na tela de verificação
4. Após verificação, você receberá um token JWT válido por 60 minutos

### Visualizar Emails (MailHog)

Todos os emails enviados pelo sistema (códigos OTP) podem ser visualizados em:
- **Interface Web**: http://localhost:8025
- **SMTP**: localhost:1025

## 📝 Validações

- Funcionário deve ter no mínimo 18 anos
- Documento (CPF/CNPJ) deve ser único
- Email deve ser único
- Pelo menos um telefone é obrigatório
- Usuário só pode criar/editar funcionários de cargo igual ou inferior ao seu
- Senha deve ter no mínimo 6 caracteres

## 🔐 Configuração JWT

A chave JWT está configurada em:
- `backend/EmployeeManagement.API/appsettings.json`
- `docker-compose.yml` (variável de ambiente)

## 🎨 Front-end

### Componentes shadcn/ui Utilizados

- Button
- Input
- Label
- Card
- Dialog
- Sidebar
- Toast
- Select
- Badge

### Estrutura de Rotas

- `/login` - Página de login
- `/otp` - Verificação de código OTP
- `/dashboard` - Dashboard principal
- `/employees` - Listagem e CRUD de funcionários
- `/departments` - Listagem e CRUD de departamentos
- `/positions` - Listagem e CRUD de cargos
- `/profile` - Perfil do usuário (via modal)

## 🧪 Testes

### Backend (xUnit)

Os testes unitários estão localizados em `backend/EmployeeManagement.Tests/` e utilizam:
- **xUnit** como framework de testes
- **Moq** para mock de dependências
- Cobertura de serviços principais (EmployeeService, AuthService)

#### Executar testes do backend

```bash
# Dentro do container da API
docker-compose exec api dotnet test

# Ou localmente (se tiver .NET SDK instalado)
cd backend
dotnet test
```

#### Testes implementados

- ✅ Validação de idade mínima (18 anos)
- ✅ Validação de documento único
- ✅ Validação de email único
- ✅ Validação de permissões (cargos)
- ✅ Autenticação e OTP
- ✅ Criação e atualização de funcionários

### Frontend (Vitest)

Os testes do frontend estão localizados em `frontend/src/test/` e utilizam:
- **Vitest** como framework de testes
- **React Testing Library** para testes de componentes
- **@testing-library/jest-dom** para matchers customizados

#### Executar testes do frontend

```bash
# Dentro do container do frontend
docker-compose exec frontend npm run test

# Ou localmente
cd frontend
npm run test
```

#### Testes implementados

- ✅ Testes de componentes (Button, Input, DataTable, etc)
- ✅ Testes de páginas (Employees, Departments, Positions, Dashboard)
- ✅ Testes de hooks (useEmployees, useAuth)
- ✅ Testes de validações (CPF, telefone, data)

## 🐳 Docker

O projeto utiliza Docker Compose para gerenciar todos os serviços. O hot reload está configurado por padrão no arquivo `docker-compose.yml`:

- **Backend**: Usa `dotnet watch` para recarregar automaticamente ao detectar mudanças
- **Frontend**: Usa `vite dev server` para recarregar automaticamente ao detectar mudanças

**Nota:** O projeto utiliza apenas um arquivo `docker-compose.yml` que já está configurado com hot reload ativo por padrão.

### Volumes

Os volumes estão configurados para:
- Sincronizar código fonte (hot reload)
- Persistir dados do MySQL
- Armazenar logs da API

### Arquivos Docker

- `docker-compose.yml` - Orquestração de todos os serviços (com hot reload)
- `backend/Dockerfile` - Imagem de produção do backend
- `backend/Dockerfile.dev` - Imagem de desenvolvimento (hot reload)
- `frontend/Dockerfile` - Imagem de produção do frontend
- `frontend/Dockerfile.dev` - Imagem de desenvolvimento (hot reload)

## ✅ Requisitos do Desafio

### Requisitos Obrigatórios

- ✅ **.NET 8 REST API** - Implementado com Clean Architecture
- ✅ **CRUD completo** - Funcionários, Departamentos e Cargos
- ✅ **Banco de dados** - MySQL 8.0 em Docker
- ✅ **Front-end React** - React 18 + TypeScript + Vite
- ✅ **Documentação da API** - Swagger/OpenAPI
- ✅ **Testes unitários** - Backend (xUnit) e Frontend (Vitest)
- ✅ **Docker/Containers** - Docker Compose com todos os serviços
- ✅ **Database em Docker** - MySQL containerizado
- ✅ **Padrões de arquitetura** - Clean Architecture (DDD)
- ✅ **Logging** - Serilog com logs estruturados
- ✅ **JWT Authentication** - Autenticação JWT com 2FA (OTP)

### Funcionalidades do Employee

- ✅ **First and last name** (Required) - Implementado
- ✅ **E-mail** (Required e Unique) - Implementado
- ✅ **Doc number** (Unique e Required) - Implementado (CPF/CNPJ)
- ✅ **Phone** (Múltiplos telefones) - Implementado
- ✅ **Manager name** (Manager pode ser employee) - Implementado
- ✅ **Password** (Boas práticas) - Hash com BCrypt
- ✅ **Validação de idade** - Mínimo 18 anos
- ✅ **Sistema de permissões** - Employee, Leader, Director
- ✅ **Campos adicionais** - BirthDate, Department, Position, IsActive

### Funcionalidades Extras Implementadas

- ✅ **Dashboard** com estatísticas
- ✅ **2FA (Two-Factor Authentication)** com código OTP por email
- ✅ **Atualização de perfil** do usuário autenticado
- ✅ **Busca e paginação** em todas as listagens
- ✅ **Interface responsiva** (mobile-first)
- ✅ **Hot reload** para desenvolvimento
- ✅ **MailHog** para testes de email

---

###ScreenShots
Veja abaixo alguns screenshots de algumas telas.

## LOGIN
<img width="1920" height="911" alt="image" src="https://github.com/user-attachments/assets/8f28db02-5398-47b9-a9a9-0da1048df15f" />

## 2FA CODE
<img width="1920" height="911" alt="image" src="https://github.com/user-attachments/assets/ef77699b-1237-4198-b6f0-23b418a9b0b0" />

## E-MAIL DE VERIFICAÇÃO
<img width="1920" height="975" alt="image" src="https://github.com/user-attachments/assets/b6a45e20-f088-48a9-91fd-088e8b387e5a" />

## DASHBOARD
<img width="1920" height="1169" alt="image" src="https://github.com/user-attachments/assets/61973c4a-4550-48b0-a98a-8c355fc35bfa" />

## LISTA DE COLABORADORES
<img width="560" height="340" alt="image" src="https://github.com/user-attachments/assets/481ca734-500c-4abc-990b-ca46273789d2" />


