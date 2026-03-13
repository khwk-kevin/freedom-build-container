FROM node:20
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json server.js ./
RUN npm install --omit=dev
EXPOSE 3000
CMD ["node", "server.js"]
