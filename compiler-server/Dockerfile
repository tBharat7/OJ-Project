FROM node:20-alpine

# Install compilers
RUN apk add --no-cache g++ clang openjdk11

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Create temp directory
RUN mkdir -p temp

EXPOSE 3001

CMD ["npm", "start"]