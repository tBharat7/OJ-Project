# OJ-Project

A microservices-based Online Judge platform with separate frontend, backend, and compiler services.

## Architecture

```
Frontend (React) → Backend API → Compiler Service
                      ↓
                   Database
```

## Services

- **Frontend**: React application (Port 5173)
- **Backend**: Express API server (Port 3000)  
- **Compiler Service**: Code execution service (Port 3001)

## Quick Start

### Development
```bash
# Start all services
docker-compose up

# Or start individually:
cd backend && npm run dev
cd compiler-server && npm run dev
cd frontend && npm run dev
```

### Production
```bash
docker-compose up --build
```

## Service URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Compiler Service: http://localhost:3001