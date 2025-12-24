FROM node:18

# Instalar dependencias de compilación para módulos nativos
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Configurar npm para compilar módulos nativos desde código fuente
ENV npm_config_build_from_source=true

# Instalar dependencias (usar npm install para permitir compilación desde fuente)
RUN npm install

# Verificar que bcrypt se compiló correctamente, si no, recompilar
RUN node -e "require('bcrypt')" || (rm -rf node_modules/bcrypt && npm install bcrypt@5.1.1 --build-from-source)

# Copiar código fuente (node_modules ya está excluido por .dockerignore)
COPY . .

# Generar cliente Prisma
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]

