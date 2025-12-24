#!/bin/bash

# Script para iniciar con Docker
# Este script levanta todo el sistema con Docker Compose

set -e

echo "🐳 Iniciando Cuadrante de Servicios con Docker..."
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar Docker
if ! command -v docker >/dev/null 2>&1; then
    echo "❌ Docker no está instalado. Por favor instala Docker."
    exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose."
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker $(docker -v | cut -d' ' -f3 | cut -d',' -f1) detectado"
echo -e "${GREEN}✓${NC} Docker Compose $(docker compose version | cut -d' ' -f4) detectado"
echo ""

# Crear .env si no existe
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠${NC}  Creando archivo .env..."
    cat > backend/.env << EOF
PORT=5000
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d
DATABASE_URL="postgresql://cuadrante:cuadrante_password@db:5432/cuadrante_db?schema=public"
CORS_ORIGIN=http://localhost:5005
EOF
    echo -e "${GREEN}✓${NC} Archivo .env creado"
fi

# Construir y levantar contenedores
echo -e "${BLUE}🏗️  Construyendo contenedores...${NC}"
docker compose up --build -d

echo ""
echo -e "${BLUE}⏳ Esperando a que los servicios estén listos...${NC}"
sleep 10

# Ejecutar migraciones
echo -e "${BLUE}🗄️  Ejecutando migraciones de base de datos...${NC}"
docker compose exec -T backend npx prisma migrate deploy

# Seed
echo -e "${BLUE}🌱 Cargando datos de ejemplo...${NC}"
docker compose exec -T backend npm run seed

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ ¡Sistema levantado exitosamente!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}El sistema está disponible en:${NC}"
echo "    http://localhost:5005"
echo ""
echo -e "${BLUE}Credenciales por defecto:${NC}"
echo "    Usuario: admin"
echo "    Contraseña: admin123"
echo ""
echo -e "${BLUE}Para ver logs:${NC}"
echo "    docker compose logs -f"
echo ""
echo -e "${BLUE}Para detener:${NC}"
echo "    docker compose down"
echo ""
echo -e "${GREEN}¡Disfruta el sistema! 🎉${NC}"

