# 🍽️ Receitas API

> Sistema RESTful para gerenciamento de receitas culinárias — com autenticação JWT, geração de PDFs e cobertura completa de testes.

[![Node.js](https://img.shields.io/badge/Node.js-Modern-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.x-black?style=flat-square&logo=fastify)](https://www.fastify.io/)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-darkblue?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-blue?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=flat-square&logo=docker)](https://www.docker.com/)

---

## 📖 Sobre o Projeto

O **Receitas API** é uma API RESTful completa para gerenciamento de receitas culinárias, desenvolvida com foco em performance, organização e escalabilidade.

O sistema oferece cadastro e autenticação de usuários com JWT, gereciamento de receitas e geração de PDFs prontos para impressão — tudo documentado automaticamente via Swagger.

**Pilares técnicos:**

- Clean Architecture & SOLID
- Repository Pattern & Use Cases
- Testes Unitários e E2E (Vitest)
- Docker para ambiente isolado e reproduzível
- Prisma ORM com MySQL

---

## ✨ Funcionalidades

| Funcionalidade  | Descrição                                 |
| --------------- | ----------------------------------------- |
| 🔐 Autenticação | Cadastro e login de usuários com JWT      |
| 🍽️ Receitas     | CRUD completo com categorias              |
| 📄 PDF          | Geração de PDF para impressão de receitas |
| 📘 Documentação | Swagger gerado automaticamente            |
| 🧪 Testes       | Unitários e E2E com Vitest                |
| 🐳 Docker       | Ambiente isolado com Docker Compose       |

---

## 🚀 Início Rápido

### Pré-requisitos

- [Node.js](https://nodejs.org/)
- [PNPM](https://pnpm.io/)
- [Docker](https://www.docker.com/products/docker-desktop/) _(recomendado)_
- MySQL 8.x _(apenas para execução local sem Docker)_

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/BrunoRobMaia/Receitas-API.git
cd receitas-api

# 2. Instale as dependências
pnpm install

# 3. Configure as variáveis de ambiente
cp .env.local .env
```

---

## 🐳 Opção 1 — Docker (Recomendado)

Antes de subir os containers, configure as credenciais do banco no `docker-compose.yml` e no `.env` (veja [⚙️ Configuração](#️-configuração)).

```bash
# Sobe os containers
pnpm docker:up

# Entre no container
pnpm docker:sh

# Popule as categorias com a seed
pnpm prisma db seed

# Se a migration não foi aplicada automaticamente, entre no container e rode:
pnpm prisma:migrate
```

Para rodar os testes dentro do container:

```bash
pnpm docker:sh
# Dentro do container:
pnpm test
```

---

## 💻 Opção 2 — Execução Local

```bash
# 1. Instale as dependências (caso ainda não tenha feito)
pnpm install

# 2. Configure o .env com suas credenciais (veja ⚙️ Configuração abaixo)

# 3. Execute as migrations
pnpm prisma:migrate

# 4. Gere o Prisma Client
pnpm prisma:generate

# 5. (Opcional) Popule as categorias
pnpm seed

# 6. Inicie o servidor em modo desenvolvimento
pnpm dev
```

---

## 🧪 Testes

```bash
# Unitários e E2E
pnpm test
```

---

## 📘 Documentação da API

Com o servidor rodando, acesse a documentação interativa via Swagger:

```
http://localhost:3000/docs
```

---

## ⚙️ Configuração

### 1. Variáveis de Ambiente (`.env`)

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.local .env
```

#### Aplicação

| Variável     | Descrição                                | Padrão |
| ------------ | ---------------------------------------- | ------ |
| `PORT`       | Porta em que o servidor irá rodar        | `3000` |
| `JWT_SECRET` | Chave secreta para assinar os tokens JWT | —      |

#### Banco de Dados (MySQL)

| Variável       | Descrição                           | Exemplo                                |
| -------------- | ----------------------------------- | -------------------------------------- |
| `DB_HOST`      | Host do banco de dados              | `localhost`                            |
| `DB_PORT`      | Porta do MySQL                      | `3306`                                 |
| `DB_USER`      | Usuário do banco                    | `root`                                 |
| `DB_PASSWORD`  | Senha do banco                      | `senha123`                             |
| `DB_NAME`      | Nome do banco de dados              | `receitas`                             |
| `DATABASE_URL` | String de conexão usada pelo Prisma | `mysql://user:pass@host:3306/receitas` |

> ⚠️ `DATABASE_URL` deve estar sempre consistente com as demais variáveis `DB_*`. O Prisma usa exclusivamente essa string para se conectar.

```dotenv
# Exemplo de .env preenchido
PORT=3000
JWT_SECRET=troque_por_uma_chave_forte_e_aleatoria

DB_HOST=localhost
DB_PORT=3306
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=receitas

DATABASE_URL="mysql://seu_usuario:sua_senha@localhost:3306/receitas"
```

---

### 2. Docker Compose (`docker-compose.yml`)

Ao usar Docker, as credenciais do banco também precisam ser definidas diretamente no `docker-compose.yml`. Localize os campos marcados e substitua pelos seus valores antes de rodar `pnpm docker:up`:

```yaml
services:
  api:
    environment:
      DATABASE_URL: mysql://<SEU_USUARIO>:<SUA_SENHA>@mysql:3306/receitas # ← edite aqui
      DB_USER: <SEU_USUARIO> # ← edite aqui
      DB_PASSWORD: <SUA_SENHA> # ← edite aqui
      JWT_SECRET: ${JWT_SECRET} # lido automaticamente do .env

  mysql:
    environment:
      MYSQL_ROOT_PASSWORD: <SUA_SENHA> # ← edite aqui (deve ser igual à acima)
      MYSQL_DATABASE: receitas

  mysql_test:
    environment:
      MYSQL_ROOT_PASSWORD: <SUA_SENHA> # ← edite aqui
      MYSQL_DATABASE: receitas_test
```

> 💡 **Portas expostas pelos containers:**
>
> | Container             | Porta interna | Porta no host |
> | --------------------- | ------------- | ------------- |
> | `receitas-api`        | `3000`        | `3000`        |
> | `receitas-mysql`      | `3306`        | `3307`        |
> | `receitas-mysql-test` | `3306`        | `3308`        |
>
> O MySQL de produção fica na porta `3307` e o de testes na `3308` para evitar conflito com uma instalação local do MySQL.
