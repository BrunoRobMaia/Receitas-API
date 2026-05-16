FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate

RUN pnpm build

FROM node:20-alpine AS runner

WORKDIR /app
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY vitest.config.ts ./

COPY --from=builder /app/node_modules ./node_modules/

COPY --from=builder /app/dist ./dist/
COPY --from=builder /app/src ./src

EXPOSE 3000
CMD ["sh", "-c", "pnpm start"]