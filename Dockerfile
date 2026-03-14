FROM node:20
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
RUN npm install -g @anthropic-ai/claude-code@latest
RUN mkdir -p /workspace/builds
WORKDIR /app
COPY package.json server.js ./
RUN npm install --omit=dev
EXPOSE 3000
CMD ["node", "server.js"]
