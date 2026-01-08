FROM node:18-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages ./packages

RUN pnpm install --frozen-lockfile

COPY apps/api ./apps/api

RUN cd apps/api && pnpm prisma generate
RUN pnpm build --filter=@ai-xandria/api

FROM node:18-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001

CMD ["node", "dist/main.js"]
