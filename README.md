# Cuadrante de Servicios - Sistema de Gestión

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)
![React](https://img.shields.io/badge/React-18.2-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)

Sistema completo para la gestión de cuadrantes de servicios con auto-asignación inteligente de guardias, reglas configurables y validaciones en tiempo real.

## 📋 Características Principales

- ✅ Gestión completa de personas (Grupo A y B, conductores/no conductores)
- ✅ Cuadrante visual interactivo (vistas semanal y mensual)
- ✅ Auto-asignación inteligente de guardias con balanceo de carga
- ✅ Reglas duras configurables (4 guardias/día, mínimo 1 Grupo A, mínimo 1 conductor)
- ✅ Descansos automáticos después de Comisiones y Semanas
- ✅ Asignación manual por día o rango de fechas
- ✅ Sistema de permutas entre personas
- ✅ Validación en tiempo real de reglas
- ✅ Audit log completo de todas las operaciones
- ✅ Autenticación JWT con roles
- ✅ Interfaz moderna y responsive con Tailwind CSS

## 🚀 Stack Tecnológico

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** con **PostgreSQL**
- **JWT** para autenticación
- **bcrypt** para hashing de passwords

### Frontend
- **React 18** + **TypeScript**
- **Vite** como bundler
- **Tailwind CSS** para estilos
- **React Query (TanStack Query)** para manejo de estado del servidor
- **React Router** para navegación
- **date-fns** para manejo de fechas

### DevOps
- **Docker** y **Docker Compose**
- **Nginx** para servir el frontend en producción

## 📦 Instalación y Configuración

### Requisitos Previos

- Node.js 18+ 
- npm o yarn
- PostgreSQL 15+ (o usar Docker Compose que incluye PostgreSQL)
- Docker y Docker Compose (recomendado para desarrollo y producción)

### Opción 1: Docker Compose (Recomendado) 🐳

Esta es la forma más sencilla y recomendada para desarrollo y producción:

```bash
./start-docker.sh
```

Esto levantará:
- PostgreSQL en puerto 5432 (solo dentro de Docker)
- Backend en puerto 5000
- Frontend en puerto 5005

Accede a `http://localhost:5005`

### Opción 2: Instalación Local (Requiere PostgreSQL)

**Nota:** Esta opción requiere PostgreSQL instalado localmente. Si prefieres no instalar PostgreSQL, usa la Opción 1 (Docker Compose).

#### Opción 2a: Script Automático

```bash
./start.sh
```

Este script automáticamente:
- Verifica Node.js y PostgreSQL
- Crea la base de datos si no existe
- Instala dependencias
- Configura la base de datos
- Carga datos de ejemplo

#### Opción 2b: Instalación Manual

#### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd cuadrante-servicios
```

#### 2. Instalar PostgreSQL

Asegúrate de tener PostgreSQL 15+ instalado y corriendo.

#### 3. Crear base de datos

```bash
createdb cuadrante_dev
```

#### 4. Configurar variables de entorno

```bash
cp backend/.env.example backend/.env
```

Editar `backend/.env` y configurar `DATABASE_URL`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cuadrante_dev?schema=public"
```

#### 5. Instalar dependencias y configurar

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
```

**Credenciales por defecto:**
- Usuario: `admin`
- Contraseña: `admin123`

#### 6. Frontend

```bash
cd ../frontend
npm install
```

#### 7. Iniciar el servidor de desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
El backend estará disponible en `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
El frontend estará disponible en `http://localhost:5173`

#### 7. Acceder a la aplicación

Abre tu navegador en `http://localhost:5173` e inicia sesión con las credenciales por defecto.

## 🐳 Deployment con Docker

### Desarrollo y Producción

El mismo comando funciona para ambos entornos:

```bash
./start-docker.sh
```

O manualmente:

```bash
docker compose up --build -d
```

Esto levantará:
- PostgreSQL (solo accesible dentro de Docker)
- Backend en puerto 5000
- Frontend en puerto 5005

Accede a `http://localhost:5005`

### Producción en VPS

1. Clonar el repositorio en el VPS

2. Configurar variables de entorno (opcional, el script crea una por defecto):
```bash
# Editar backend/.env si necesitas cambiar valores
nano backend/.env
```

3. Ejecutar el script de inicio:
```bash
./start-docker.sh
```

El script automáticamente:
- Construye los contenedores
- Configura PostgreSQL
- Ejecuta migraciones
- Carga datos de ejemplo

4. El sistema estará disponible en `http://tu-ip:5005` o configurar un dominio con Nginx

## 📚 Uso del Sistema

### Gestión de Personas

1. Navega a **Personas**
2. Crea, edita o elimina personas
3. Importante: El Grupo A solo puede contener conductores

**Datos de ejemplo:**
- 8 personas en Grupo A (todas conductores)
- 22 personas en Grupo B (3 conductores, 19 no conductores)

### Cuadrante

#### Vistas
- **Semanal**: Muestra 7 días (lunes a domingo)
- **Mensual**: Muestra todos los días del mes

#### Filtros
- Por Grupo (A/B)
- Solo conductores
- Por estado

#### Asignación Manual
- **Click en una celda**: Asignar estado individual
- **Botón "Asignar por Rango"**: Asignar el mismo estado a múltiples días para una persona

#### Estados Disponibles
- **G (Verde)**: Guardia
- **LIC (Celeste)**: Licencia
- **C (Naranja)**: Comisión
- **PE (Rojo)**: Parte Enfermo
- **X (Gris)**: Bloqueado
- **S (Amarillo)**: Semana

### Auto-asignación de Guardias

1. Click en **"Auto-asignar Guardias"**
2. Selecciona el rango de fechas
3. Click en **"Ejecutar Auto-asignación"**

**Algoritmo de Auto-asignación:**
1. Respeta estados manuales (nunca los sobrescribe)
2. Asigna exactamente 4 guardias por día
3. Asegura al menos 1 persona del Grupo A
4. Asegura al menos 1 conductor
5. Prioriza conductores del Grupo A
6. Balancea la carga entre todas las personas disponibles
7. Solo asigna a celdas vacías

### Reglas Automáticas

**Configuradas por defecto:**
- Después de una **Comisión (C)**: 2 días bloqueados (X) automáticos
- Después de una **Semana (S)**: 2 días bloqueados (X) automáticos

Estas asignaciones automáticas tienen origen `auto` y pueden ser sobrescritas manualmente.

### Validación de Reglas Duras

El sistema valida en tiempo real:
- ✓ Exactamente 4 guardias por día
- ✓ Al menos 1 persona del Grupo A en guardia
- ✓ Al menos 1 conductor en guardia

Los días inválidos se muestran en el panel de validación con errores específicos.

### Audit Log (Solo Admin)

Todas las operaciones quedan registradas:
- Creación/modificación de personas
- Asignaciones manuales
- Auto-asignaciones
- Permutas
- Publicación de períodos

## 🛠️ Comandos Útiles

### Backend

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar producción
npm start

# Regenerar datos demo
npm run seed

# Prisma Studio (GUI para la BD)
npx prisma studio

# Crear nueva migración
npx prisma migrate dev --name nombre_migracion
```

### Frontend

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro (solo admin)
- `GET /api/auth/me` - Usuario actual

### Personas
- `GET /api/personas` - Listar personas
- `GET /api/personas/:id` - Obtener persona
- `POST /api/personas` - Crear persona
- `PUT /api/personas/:id` - Actualizar persona
- `DELETE /api/personas/:id` - Eliminar persona

### Asignaciones
- `GET /api/asignaciones` - Listar asignaciones (con filtros)
- `POST /api/asignaciones` - Crear/actualizar asignación
- `POST /api/asignaciones/rango` - Asignar por rango
- `DELETE /api/asignaciones/:id` - Eliminar asignación
- `POST /api/asignaciones/auto-asignar` - Auto-asignar guardias
- `GET /api/asignaciones/validar` - Validar día o rango
- `POST /api/asignaciones/permuta` - Permutar asignaciones

### Períodos
- `GET /api/periodos` - Listar períodos
- `POST /api/periodos` - Crear período (solo admin)
- `PUT /api/periodos/:id/publicar` - Publicar período (solo admin)

### Audit Log
- `GET /api/audit-log` - Obtener logs (solo admin)

## 🔒 Seguridad

- Autenticación JWT con expiración configurable
- Passwords hasheados con bcrypt
- Validación de permisos en backend
- CORS configurado
- Validación de datos con tipos TypeScript
- Solo admins pueden editar fechas pasadas

## 🗄️ Modelo de Datos

```prisma
model Persona {
  id          String
  nombre      String
  grupo       Grupo (A | B)
  isConductor Boolean
  asignaciones Asignacion[]
}

model Asignacion {
  id        String
  fecha     DateTime
  personaId String
  persona   Persona
  estado    Estado (G | LIC | C | PE | X | S)
  origen    Origen (manual | auto)
  nota      String?
}

model ReglaConfigurable {
  estadoTrigger   Estado
  diasDescanso    Int
  estadoDescanso  Estado
  prioridad       Int
  activa          Boolean
  descripcion     String
}
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la licencia ISC.

## 👥 Soporte

Para preguntas o problemas, por favor abre un issue en el repositorio.

---

**Desarrollado con ❤️ usando React, TypeScript, Node.js y Prisma**

