# ---- Build stage ----
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine

WORKDIR /app

# Needed for HEALTHCHECK
RUN apk add --no-cache wget

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

ENV HEALTH_PORT=3000
EXPOSE 8080 3000

HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
    CMD wget -qO- http://127.0.0.1:$HEALTH_PORT/health | grep -q '"ok":true' || exit 1

CMD ["node", "dist/index.js"]
