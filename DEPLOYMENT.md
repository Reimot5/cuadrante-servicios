# Guía de Deployment - Cuadrante de Servicios

Esta guía cubre el deployment del sistema en diferentes entornos.

## 📋 Tabla de Contenidos

1. [Deployment Local con Docker](#deployment-local-con-docker)
2. [Deployment en VPS](#deployment-en-vps)
3. [Variables de Entorno](#variables-de-entorno)
4. [Migraciones de Base de Datos](#migraciones-de-base-de-datos)
5. [Backup y Restauración](#backup-y-restauración)
6. [Troubleshooting](#troubleshooting)

## Deployment Local con Docker

### Paso 1: Configurar variables de entorno

Copiar `.env.example` y crear `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:

```env
JWT_SECRET=un-secreto-muy-seguro-cambiar-en-produccion
DATABASE_URL="postgresql://cuadrante:cuadrante_password@db:5432/cuadrante_db?schema=public"
```

### Paso 2: Construir y levantar contenedores

```bash
docker compose up --build -d
```

### Paso 3: Ejecutar migraciones y seed

```bash
# Migraciones
docker compose exec backend npx prisma migrate deploy

# Seed (datos de ejemplo)
docker compose exec backend npm run seed
```

### Paso 4: Verificar

Acceder a `http://localhost:5005`

## Deployment en VPS

### Requisitos del Servidor

- Ubuntu 20.04+ / Debian 11+
- Docker instalado (incluye Docker Compose como plugin)
- Nginx (opcional, para reverse proxy)
- Dominio configurado (opcional)

### Paso 1: Clonar el repositorio

```bash
cd /opt
git clone <url-del-repositorio> cuadrante-servicios
cd cuadrante-servicios
```

### Paso 2: Configurar variables de entorno

```bash
cp .env.example .env
nano .env
```

Configurar:
```env
NODE_ENV=production
JWT_SECRET=<generar-secreto-seguro>
DATABASE_URL="postgresql://cuadrante:password_segura@db:5432/cuadrante_db?schema=public"
CORS_ORIGIN=https://tu-dominio.com
```

### Paso 3: Configurar Nginx (Opcional)

Si deseas usar un dominio con SSL:

```bash
sudo nano /etc/nginx/sites-available/cuadrante
```

Contenido:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:5005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Habilitar y reiniciar:
```bash
sudo ln -s /etc/nginx/sites-available/cuadrante /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Paso 4: Configurar SSL con Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

### Paso 5: Levantar con Docker Compose

```bash
docker compose -f docker-compose.yml up -d --build
```

### Paso 6: Ejecutar migraciones

```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run seed
```

### Paso 7: Configurar Auto-inicio

Crear servicio systemd:

```bash
sudo nano /etc/systemd/system/cuadrante.service
```

Contenido:
```ini
[Unit]
Description=Cuadrante de Servicios
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/cuadrante-servicios
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Habilitar:
```bash
sudo systemctl enable cuadrante
sudo systemctl start cuadrante
```

## Variables de Entorno

### Backend (Obligatorias)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del backend | `5000` |
| `NODE_ENV` | Entorno de ejecución | `production` |
| `JWT_SECRET` | Secreto para JWT | `secreto-muy-seguro` |
| `JWT_EXPIRES_IN` | Expiración del token | `7d` |
| `DATABASE_URL` | URL de conexión a BD | Ver ejemplos abajo |
| `CORS_ORIGIN` | Origen permitido para CORS | `https://dominio.com` |

### Ejemplos de DATABASE_URL

**PostgreSQL (desarrollo local):**
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cuadrante_dev?schema=public"
```

**PostgreSQL (producción):**
```
DATABASE_URL="postgresql://usuario:password@localhost:5432/cuadrante_db?schema=public"
```

**PostgreSQL en Docker:**
```
DATABASE_URL="postgresql://cuadrante:password@db:5432/cuadrante_db?schema=public"
```

## Migraciones de Base de Datos

### Crear nueva migración

En desarrollo:
```bash
cd backend
npx prisma migrate dev --name nombre_de_la_migracion
```

### Aplicar migraciones en producción

```bash
# Local
cd backend
npx prisma migrate deploy

# Docker
docker compose exec backend npx prisma migrate deploy
```

### Resetear base de datos (⚠️ CUIDADO - Solo desarrollo)

```bash
npx prisma migrate reset
```

### Ver estado de migraciones

```bash
npx prisma migrate status
```

## Backup y Restauración

### Backup de PostgreSQL

```bash
# Backup
docker compose exec db pg_dump -U cuadrante cuadrante_db > backup_$(date +%Y%m%d).sql

# Restaurar
docker compose exec -T db psql -U cuadrante cuadrante_db < backup_20241224.sql
```

### Backup de PostgreSQL (local)

```bash
# Si usas PostgreSQL local (no Docker)
pg_dump -U postgres cuadrante_dev > backup/cuadrante_dev_$(date +%Y%m%d).sql
```

## Troubleshooting

### Error: "JWT Secret not configured"

Asegúrate de tener `JWT_SECRET` en tu archivo `.env`:
```bash
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
```

### Error: "Database connection failed"

1. Verificar que PostgreSQL esté corriendo:
```bash
docker compose ps
```

2. Verificar logs:
```bash
docker compose logs db
```

3. Verificar `DATABASE_URL` en `.env`

### Error: "Port 5000 already in use"

Cambiar puerto en `.env`:
```env
PORT=5001
```

Y actualizar docker-compose.yml:
```yaml
ports:
  - "5001:5001"
```

### Limpiar y reconstruir contenedores

```bash
docker compose down -v
docker compose up --build -d
```

### Ver logs en tiempo real

```bash
# Todos los servicios
docker compose logs -f

# Solo backend
docker compose logs -f backend

# Solo frontend
docker compose logs -f frontend
```

### Acceder a contenedor

```bash
docker compose exec backend sh
docker compose exec frontend sh
docker compose exec db psql -U cuadrante cuadrante_db
```

## Monitoreo

### Healthcheck

El backend expone un endpoint de health check:

```bash
curl http://localhost:5000/api/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "timestamp": "2024-12-24T..."
}
```

### Logs de Aplicación

Los logs se almacenan en:
- Backend: stdout (Docker logs)
- Nginx: `/var/log/nginx/`

### Métricas

Puedes agregar herramientas como:
- **Prometheus** + **Grafana** para métricas
- **Sentry** para error tracking
- **PM2** para gestión de procesos Node.js

## Actualizaciones

### Actualizar código

```bash
cd /opt/cuadrante-servicios
git pull
docker compose down
docker compose up --build -d
docker compose exec backend npx prisma migrate deploy
```

### Actualizar dependencias

```bash
# Backend
cd backend
npm update
npm audit fix

# Frontend
cd frontend
npm update
npm audit fix
```

## Seguridad

### Checklist de Seguridad para Producción

- [ ] Cambiar `JWT_SECRET` por uno seguro
- [ ] Configurar CORS correctamente
- [ ] Usar HTTPS (SSL/TLS)
- [ ] Cambiar contraseñas por defecto
- [ ] Configurar firewall (UFW)
- [ ] Mantener Docker y dependencias actualizadas
- [ ] Implementar rate limiting
- [ ] Configurar backups automáticos
- [ ] Monitoreo y alertas configurados

---

Para más información, consulta el README principal del proyecto.

