FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000 --fetch-timeout=300000 --maxsockets=3
COPY src ./src
COPY migrations ./migrations
USER node
EXPOSE 4200
CMD ["node","src/server.ts"]
