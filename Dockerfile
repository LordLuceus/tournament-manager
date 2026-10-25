FROM node:22.23.4-slim AS deps

WORKDIR /app

RUN npm install -g pnpm@11

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

FROM node:22.23.4-slim AS builder

WORKDIR /app

RUN npm install -g pnpm@11

COPY . .
COPY --from=deps /app/node_modules ./node_modules

RUN pnpm build

FROM node:22.23.4-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN npm install -g pnpm@11

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

EXPOSE 3000

CMD ["pnpm", "start"]
