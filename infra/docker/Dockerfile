# Следует проверить на наличие ошибок
# ---------- 1. BUILD STAGE ----------
FROM node:20 AS builder

WORKDIR /app

# копируем package.json (ускоряет кэш)
COPY package*.json ./
COPY apps/client/package*.json apps/client/
COPY apps/server/package*.json apps/server/

# ставим зависимости
RUN npm install

# копируем весь проект
COPY . .

# билдим фронт и сервер
RUN npm run build --workspace=apps/client
RUN npm run build --workspace=apps/server


# ---------- 2. PRODUCTION STAGE ----------
FROM node:20-alpine

WORKDIR /app

# только прод зависимости
COPY package*.json ./
COPY apps/server/package*.json apps/server/

RUN npm install --omit=dev

# копируем билд
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/client/dist ./apps/client/dist

# порт
EXPOSE 8080

# запуск сервера
CMD ["node", "apps/server/dist/main.js"]