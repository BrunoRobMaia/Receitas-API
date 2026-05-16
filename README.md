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

O sistema oferece cadastro e autenticação de usuários com JWT, gerenciamento de categorias e receitas, e geração de PDFs prontos para impressão — tudo documentado automaticamente via Swagger.

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

```bash
# Sobe os containers
pnpm docker:up

# Se a migration não foi aplicada automaticamente
pnpm docker:sh

# Depois rode o comando
pnpm prisma:migrate

# Popula as categorias iniciais
pnpm prisma db seed
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

# 2. Configure o .env com suas credenciais
# Exemplo:
# DATABASE_URL="mysql://root:password@localhost:3306/receitas"
# JWT_SECRET="sua_chave_secreta" (crie uma chave)

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

## ⚙️ Variáveis de Ambiente

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.local .env
```
