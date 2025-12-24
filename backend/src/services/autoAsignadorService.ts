import { PrismaClient } from "@prisma/client";
import { Estado, Origen, Grupo, ResultadoAutoAsignacion } from "../types";
import { validarDia } from "./validadorService";

const prisma = new PrismaClient();

interface ContadorGuardias {
  [personaId: string]: number;
}

export const autoAsignarGuardias = async (
  fechaInicio: Date,
  fechaFin: Date
): Promise<ResultadoAutoAsignacion> => {
  const resultado: ResultadoAutoAsignacion = {
    diasProcesados: 0,
    guardiasAsignadas: 0,
    errores: [],
    exito: true,
  };

  // Obtener todas las personas
  const personas = await prisma.persona.findMany({
    include: { asignaciones: true },
  });

  // Contador de guardias por persona para balancear
  // Inicializar con guardias existentes en el rango
  const contadorGuardias: ContadorGuardias = {};
  personas.forEach((p) => {
    contadorGuardias[p.id] = 0;
  });

  // Contar guardias existentes en el rango para balance inicial
  const asignacionesExistentes = await prisma.asignacion.findMany({
    where: {
      fecha: {
        gte: fechaInicio,
        lte: fechaFin,
      },
      estado: Estado.G,
    },
  });

  asignacionesExistentes.forEach((a) => {
    if (contadorGuardias[a.personaId] !== undefined) {
      contadorGuardias[a.personaId]++;
    }
  });

  // Normalizar fechas parseando desde string YYYY-MM-DD para evitar problemas de zona horaria
  const parsearFecha = (fecha: Date | string): Date => {
    const fechaStr =
      typeof fecha === "string" ? fecha : fecha.toISOString().split("T")[0];
    const [year, month, day] = fechaStr.split("-").map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  };

  const fechaInicioNormalizada = parsearFecha(fechaInicio);
  const fechaFinNormalizada = parsearFecha(fechaFin);

  // Iterar por cada día en el rango (incluyendo el último día)
  const fechaActual = new Date(fechaInicioNormalizada);

  // Comparar usando timestamps normalizados
  while (fechaActual.getTime() <= fechaFinNormalizada.getTime()) {
    try {
      await asignarGuardiasDia(
        fechaActual,
        personas,
        contadorGuardias,
        resultado
      );
      resultado.diasProcesados++;
    } catch (error: any) {
      resultado.errores.push({
        fecha: fechaActual.toISOString().split("T")[0],
        mensaje: error.message || "Error al asignar guardias",
      });
      resultado.exito = false;
    }

    // Avanzar al siguiente día
    fechaActual.setDate(fechaActual.getDate() + 1);
  }

  return resultado;
};

const asignarGuardiasDia = async (
  fecha: Date,
  todasLasPersonas: any[],
  contadorGuardias: ContadorGuardias,
  resultado: ResultadoAutoAsignacion
): Promise<void> => {
  const fechaSinHora = new Date(fecha);
  fechaSinHora.setHours(0, 0, 0, 0);

  // Obtener asignaciones existentes para este día
  const asignacionesExistentes = await prisma.asignacion.findMany({
    where: { fecha: fechaSinHora },
    include: { persona: true },
  });

  // Contar guardias ya asignadas
  const guardiasExistentes = asignacionesExistentes.filter(
    (a) => a.estado === Estado.G
  );

  const guardiasNecesarias = 4 - guardiasExistentes.length;

  if (guardiasNecesarias <= 0) {
    // Ya tiene las 4 guardias
    return;
  }

  // Identificar personas NO disponibles
  const personasNoDisponibles = new Set(
    asignacionesExistentes.map((a) => a.personaId)
  );

  // Filtrar personas disponibles (sin asignación para este día)
  const personasDisponibles = todasLasPersonas.filter(
    (p) => !personasNoDisponibles.has(p.id)
  );

  if (personasDisponibles.length < guardiasNecesarias) {
    throw new Error(
      `No hay suficientes personas disponibles (necesarias: ${guardiasNecesarias}, disponibles: ${personasDisponibles.length})`
    );
  }

  // Verificar que hay al menos 1 conductor disponible
  const conductores = personasDisponibles.filter((p) => p.isConductor);
  const tieneConductorEnGuardia = guardiasExistentes.some(
    (g) => g.persona.isConductor
  );

  if (!tieneConductorEnGuardia && conductores.length === 0) {
    throw new Error("No hay conductores disponibles para asignar");
  }

  // Seleccionar candidatos priorizando balance entre todas las personas
  const candidatos = seleccionarCandidatos(
    personasDisponibles,
    guardiasNecesarias,
    contadorGuardias,
    tieneConductorEnGuardia
  );

  // Crear asignaciones
  for (const persona of candidatos) {
    await prisma.asignacion.create({
      data: {
        fecha: fechaSinHora,
        personaId: persona.id,
        estado: Estado.G,
        origen: Origen.auto,
        nota: "Asignación automática",
      },
    });

    contadorGuardias[persona.id]++;
    resultado.guardiasAsignadas++;
  }
};

const seleccionarCandidatos = (
  personasDisponibles: any[],
  cantidad: number,
  contadorGuardias: ContadorGuardias,
  yaTieneConductor: boolean
): any[] => {
  const candidatos: any[] = [];
  let personasRestantes = [...personasDisponibles];

  // 1. Si no tiene conductor, asegurar uno (el que tiene menos guardias, de cualquier grupo)
  if (!yaTieneConductor) {
    const conductores = personasRestantes
      .filter((p) => p.isConductor)
      .sort((a, b) => contadorGuardias[a.id] - contadorGuardias[b.id]);

    if (conductores.length > 0) {
      candidatos.push(conductores[0]);
      personasRestantes = personasRestantes.filter(
        (p) => p.id !== conductores[0].id
      );
    }
  }

  // 2. Completar las guardias restantes priorizando balance estricto entre todas las personas
  const restantes = cantidad - candidatos.length;

  if (restantes > 0) {
    // Ordenar estrictamente por balance (menos guardias primero)
    // Esto asegura que se distribuyan equitativamente entre todas las personas
    const ordenados = personasRestantes
      .sort((a, b) => {
        // Prioridad absoluta: balance de guardias
        const diferencia = contadorGuardias[a.id] - contadorGuardias[b.id];

        if (diferencia !== 0) {
          return diferencia; // Menos guardias primero
        }

        // Si tienen las mismas guardias, mantener orden consistente
        return a.id.localeCompare(b.id);
      })
      .slice(0, restantes);

    candidatos.push(...ordenados);
  }

  return candidatos;
};
