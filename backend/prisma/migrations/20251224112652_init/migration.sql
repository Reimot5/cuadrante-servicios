-- CreateTable
CREATE TABLE "Persona" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "grupo" TEXT NOT NULL,
    "isConductor" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asignacion" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "personaId" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "origen" TEXT NOT NULL,
    "nota" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asignacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReglaConfigurable" (
    "id" TEXT NOT NULL,
    "estadoTrigger" TEXT NOT NULL,
    "diasDescanso" INTEGER NOT NULL,
    "estadoDescanso" TEXT NOT NULL,
    "prioridad" INTEGER NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "ReglaConfigurable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Periodo" (
    "id" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Periodo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "detalle" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asignacion_fecha_personaId_key" ON "Asignacion"("fecha", "personaId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Asignacion" ADD CONSTRAINT "Asignacion_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;
