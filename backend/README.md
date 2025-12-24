# Backend - Cuadrante de Servicios

API REST desarrollada con Node.js, Express, TypeScript y Prisma ORM.

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/           # Configuración centralizada
│   ├── controllers/      # Controladores de rutas
│   ├── middlewares/      # Middlewares (auth, etc.)
│   ├── routes/           # Definición de rutas
│   ├── services/         # Lógica de negocio
│   │   ├── autoAsignadorService.ts    # Auto-asignación de guardias
│   │   ├── reglasService.ts           # Reglas automáticas
│   │   └── validadorService.ts        # Validación de reglas duras
│   ├── types/            # Tipos TypeScript
│   └── index.ts          # Punto de entrada
├── prisma/
│   ├── schema.prisma     # Schema de base de datos
│   └── seed.ts           # Datos de ejemplo
├── package.json
└── tsconfig.json
```

## Instalación

```bash
npm install
```

## Configuración

Crear archivo `.env`:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=tu-secreto-jwt
JWT_EXPIRES_IN=7d
DATABASE_URL="file:./dev.db"
CORS_ORIGIN=http://localhost:5173
```

## Base de Datos

```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Seed de datos
npm run seed
```

## Desarrollo

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`.

## Scripts Disponibles

- `npm run dev` - Modo desarrollo con hot reload
- `npm run build` - Compilar TypeScript
- `npm start` - Iniciar servidor de producción
- `npm run seed` - Cargar datos de ejemplo

## API Documentation

Ver README principal del proyecto para documentación completa de endpoints.

