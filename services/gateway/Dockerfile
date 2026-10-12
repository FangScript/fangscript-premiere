FROM node:24-alpine
WORKDIR /app
COPY server.mjs package.json ./
USER node
EXPOSE 4100
CMD ["node","server.mjs"]
