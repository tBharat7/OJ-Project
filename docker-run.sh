#!/bin/bash

# Build and run the OJ-Project with Docker Compose
echo "Building and starting OJ-Project..."
docker-compose up --build -d

echo "Application is starting..."
echo "Backend will be available at: http://localhost:3000"
echo "MongoDB will be available at: localhost:27017"

# Show logs
docker-compose logs -f