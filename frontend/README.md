# Frontend - Cuadrante de Servicios

Interfaz de usuario desarrollada con React, TypeScript, Tailwind CSS y React Query.

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/       # Componentes reutilizables
│   │   ├── Layout.tsx
│   │   ├── PersonaModal.tsx
│   │   ├── AsignacionModal.tsx
│   │   ├── AsignacionRangoModal.tsx
│   │   ├── AutoAsignarModal.tsx
│   │   ├── Leyenda.tsx
│   │   └── ValidacionPanel.tsx
│   ├── contexts/         # Contextos de React
│   │   └── AuthContext.tsx
│   ├── pages/            # Páginas principales
│   │   ├── Login.tsx
│   │   ├── Cuadrante.tsx
│   │   ├── Personas.tsx
│   │   └── AuditLogPage.tsx
│   ├── services/         # Servicios API
│   │   └── api.ts
│   ├── types/            # Tipos TypeScript
│   │   └── index.ts
│   ├── utils/            # Utilidades
│   │   ├── constants.ts
│   │   └── dates.ts
│   ├── App.tsx           # Componente principal
│   ├── main.tsx          # Punto de entrada
│   └── index.css         # Estilos globales
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## Build para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`.

## Scripts Disponibles

- `npm run dev` - Servidor de desarrollo con hot reload
- `npm run build` - Build de producción
- `npm run preview` - Preview del build de producción

## Características Principales

### Autenticación
- Login con JWT
- Persistencia de sesión en localStorage
- Rutas protegidas
- Interceptor de axios para agregar token automáticamente

### Cuadrante
- Vista semanal y mensual
- Navegación entre períodos
- Filtros por grupo y conductor
- Asignación manual por celda
- Asignación por rango de fechas
- Auto-asignación inteligente
- Validación en tiempo real

### Gestión de Personas
- CRUD completo
- Validación de reglas de negocio
- Filtros avanzados

### UI/UX
- Diseño responsive
- Tooltips informativos
- Feedback visual con toasts
- Loading states
- Optimistic updates con React Query

