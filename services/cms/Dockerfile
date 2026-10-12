FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund
COPY src ./src
COPY migrations ./migrations
COPY catalog.json ./catalog.json
USER node
EXPOSE 4200
CMD ["node","src/server.ts"]
