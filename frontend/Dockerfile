FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

EXPOSE 5173

# Start with explicit configuration
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "5173"]