FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache curl
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
ENV PORT=3000
ENV CHOKIDAR_USEPOLLING=true
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=60s CMD curl -f http://localhost:3000 || exit 1
CMD ["npm", "start"]