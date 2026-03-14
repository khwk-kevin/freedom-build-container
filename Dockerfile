FROM node:20
RUN apt-get update && apt-get install -y git sudo && rm -rf /var/lib/apt/lists/*
RUN npm install -g @anthropic-ai/claude-code@latest

# Create non-root builder user for Claude Code (refuses to run as root)
RUN useradd -m -s /bin/bash builder && \
    mkdir -p /workspace/builds && \
    chown -R builder:builder /workspace

WORKDIR /app
COPY package.json server.js ./
RUN npm install --omit=dev
EXPOSE 3000
CMD ["node", "server.js"]
