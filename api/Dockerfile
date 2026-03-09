FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache curl
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=15s CMD curl -f http://localhost:8080/health || exit 1
CMD ["node", "server.js"]