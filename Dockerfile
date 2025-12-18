FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache wget

COPY package*.json ./
RUN npm ci --omit=dev

COPY dist ./dist

ENV HEALTH_PORT=9090
EXPOSE 9090 3030

HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
    CMD wget -qO- http://127.0.0.1:$HEALTH_PORT/health | grep -q '"ok":true' || exit 1

CMD ["node", "dist/index.js"]
