#!/bin/bash

# Script de inicio rápido para Cuadrante de Servicios (Desarrollo Local)
# Este script instala dependencias, configura la base de datos y levanta el sistema
# 
# NOTA: Este script requiere PostgreSQL instalado localmente.
# Para una instalación más sencilla, usa: ./start-docker.sh
#
# Requisitos:
# - Node.js 18+
# - PostgreSQL 15+ instalado y corriendo
# - Base de datos 'cuadrante_dev' (el script intenta crearla automáticamente)

set -e

echo "🚀 Iniciando Cuadrante de Servicios (Desarrollo Local)..."
echo -e "${YELLOW}⚠${NC}  NOTA: Este script requiere PostgreSQL instalado localmente."
echo -e "${YELLOW}⚠${NC}  Para usar Docker (más sencillo): ${BLUE}./start-docker.sh${NC}"
echo ""
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] && [ ! -d "backend" ]; then
    echo "❌ Error: Este script debe ejecutarse desde la raíz del proyecto"
    exit 1
fi

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar Node.js
if ! command_exists node; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18 o superior."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Se requiere Node.js 18 o superior. Versión actual: $(node -v)"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js $(node -v) detectado"

# Verificar npm
if ! command_exists npm; then
    echo "❌ npm no está instalado."
    exit 1
fi

echo -e "${GREEN}✓${NC} npm $(npm -v) detectado"

# Verificar PostgreSQL
if ! command_exists psql; then
    echo -e "${YELLOW}⚠${NC}  PostgreSQL no está instalado."
    echo -e "${YELLOW}⚠${NC}  Opciones:"
    echo -e "    1. Instalar PostgreSQL localmente"
    echo -e "    2. Usar Docker Compose: ${BLUE}./start-docker.sh${NC}"
    echo ""
    read -p "¿Deseas continuar de todas formas? (s/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC} PostgreSQL detectado"
    
    # Verificar si la base de datos existe, si no, crearla
    if ! psql -lqt | cut -d \| -f 1 | grep -qw cuadrante_dev 2>/dev/null; then
        echo -e "${YELLOW}⚠${NC}  Base de datos 'cuadrante_dev' no existe. Creándola..."
        createdb cuadrante_dev 2>/dev/null || {
            echo -e "${YELLOW}⚠${NC}  No se pudo crear la base de datos automáticamente."
            echo -e "${YELLOW}⚠${NC}  Créala manualmente: ${BLUE}createdb cuadrante_dev${NC}"
        }
    else
        echo -e "${GREEN}✓${NC} Base de datos 'cuadrante_dev' existe"
    fi
fi
echo ""

# Backend
echo -e "${BLUE}📦 Instalando dependencias del backend...${NC}"
cd backend

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠${NC}  No existe archivo .env, creando desde .env.example..."
    if [ -f "../.env.example" ]; then
        cp ../.env.example .env
    else
        cat > .env << EOF
PORT=3000
NODE_ENV=development
JWT_SECRET=desarrollo-secreto-cambiar-en-produccion
JWT_EXPIRES_IN=7d
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cuadrante_dev?schema=public"
CORS_ORIGIN=http://localhost:5173
EOF
        echo -e "${YELLOW}⚠${NC}  NOTA: El proyecto requiere PostgreSQL. Asegúrate de tener PostgreSQL instalado y corriendo."
        echo -e "${YELLOW}⚠${NC}  Crea la base de datos: createdb cuadrante_dev"
    fi
    echo -e "${GREEN}✓${NC} Archivo .env creado"
fi

npm install
echo -e "${GREEN}✓${NC} Dependencias del backend instaladas"
echo ""

# Configurar base de datos
echo -e "${BLUE}🗄️  Configurando base de datos...${NC}"
npx prisma generate

# Verificar que PostgreSQL esté disponible
if ! command_exists psql; then
    echo -e "${YELLOW}⚠${NC}  PostgreSQL no está instalado. Instálalo o usa Docker Compose."
    echo -e "${YELLOW}⚠${NC}  Para usar Docker: ./start-docker.sh"
    exit 1
fi

# Aplicar migraciones
echo -e "${BLUE}📝 Aplicando migraciones...${NC}"
npx prisma migrate deploy || npx prisma migrate dev
echo -e "${GREEN}✓${NC} Base de datos configurada"
echo ""

# Seed
echo -e "${BLUE}🌱 Cargando datos de ejemplo...${NC}"
npm run seed
echo -e "${GREEN}✓${NC} Datos de ejemplo cargados"
echo ""

cd ..

# Frontend
echo -e "${BLUE}📦 Instalando dependencias del frontend...${NC}"
cd frontend
npm install
echo -e "${GREEN}✓${NC} Dependencias del frontend instaladas"
echo ""

cd ..

# Mensaje final
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ ¡Instalación completada exitosamente!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Para iniciar el sistema:${NC}"
echo ""
echo -e "  ${YELLOW}Terminal 1 - Backend:${NC}"
echo "    cd backend"
echo "    npm run dev"
echo ""
echo -e "  ${YELLOW}Terminal 2 - Frontend:${NC}"
echo "    cd frontend"
echo "    npm run dev"
echo ""
echo -e "${BLUE}Luego abre tu navegador en:${NC}"
echo "    http://localhost:5173"
echo ""
echo -e "${BLUE}Credenciales por defecto:${NC}"
echo "    Usuario: admin"
echo "    Contraseña: admin123"
echo ""
echo -e "${GREEN}¡Disfruta el sistema! 🎉${NC}"

