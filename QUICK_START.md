# 🚀 Inicio Rápido - Cuadrante de Servicios

Esta guía te ayudará a levantar el sistema en **menos de 5 minutos**.

## Opción 1: Inicio Automático (Recomendado)

### Con Node.js local

```bash
# En la raíz del proyecto
./start.sh
```

Este script automáticamente:
- ✅ Verifica requisitos (Node.js 18+)
- ✅ Instala dependencias de backend y frontend
- ✅ Configura la base de datos PostgreSQL
- ✅ Carga 30 personas de ejemplo
- ✅ Crea usuario admin

**Luego, en dos terminales separadas:**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

**Accede a:** http://localhost:5005:5173

### Con Docker

```bash
# En la raíz del proyecto
./start-docker.sh
```

Este script automáticamente:
- ✅ Verifica Docker y Docker Compose
- ✅ Construye y levanta todos los contenedores
- ✅ Configura PostgreSQL
- ✅ Ejecuta migraciones
- ✅ Carga datos de ejemplo

**Accede a:** http://localhost:5005

---

## Opción 2: Inicio Manual

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Credenciales por Defecto

**Usuario:** `admin`  
**Contraseña:** `admin123`

---

## ¿Qué incluye el sistema?

El seed automáticamente carga:

### Personas (30 total)
- **Grupo A**: 8 personas (todas conductores)
- **Grupo B**: 22 personas (3 conductores, 19 no conductores)

### Asignaciones de Ejemplo
- Licencias (LIC)
- Comisiones (C) con descansos automáticos (X)
- Semanas (S) con descansos automáticos (X)
- Partes de enfermo (PE)

### Reglas Configurables
- Después de Comisión → 2 días bloqueados
- Después de Semana → 2 días bloqueados

---

## Próximos Pasos

1. **Explora el Cuadrante**
   - Vista semanal y mensual
   - Filtros por grupo y conductores
   - Click en celdas para asignar estados

2. **Prueba la Auto-asignación**
   - Botón "Auto-asignar Guardias"
   - Selecciona un rango de fechas
   - El sistema asigna automáticamente 4 guardias/día

3. **Gestiona Personas**
   - Navega a "Personas"
   - Crea, edita o elimina personas
   - Recuerda: Grupo A solo puede tener conductores

4. **Revisa el Audit Log** (Solo Admin)
   - Todas las operaciones quedan registradas
   - Útil para auditoría y trazabilidad

---

## Problemas Comunes

### Puerto 5173 ya en uso
```bash
# En frontend/vite.config.ts cambiar el puerto
server: {
  port: 5174,
}
```

### Error "Cannot find module"
```bash
# Reinstalar dependencias
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
```

### Resetear base de datos
```bash
cd backend
npx prisma migrate reset
npm run seed
```

---

## Documentación Completa

Para más información detallada:
- **README.md** - Documentación completa
- **DEPLOYMENT.md** - Guía de deployment en producción
- **backend/README.md** - Documentación del backend
- **frontend/README.md** - Documentación del frontend

---

**¿Necesitas ayuda?** Abre un issue en el repositorio.

¡Disfruta el sistema! 🎉

