FROM node:20

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./
RUN npm install --include=dev
COPY . .
RUN npx tsc

EXPOSE 3000
CMD ["node", "dist/exec-server.js"]
