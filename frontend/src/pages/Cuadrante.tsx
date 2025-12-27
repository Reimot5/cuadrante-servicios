import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Persona, Asignacion, Estado } from '../types';
import { getMonthRange, getDaysInRange, formatDate, formatDateHeader, formatMonthYear } from '../utils/dates';
import { ESTADO_COLORS, ESTADO_LABELS } from '../utils/constants';
import AsignacionModal from '../components/AsignacionModal';
import AsignacionRangoModal from '../components/AsignacionRangoModal';
import AutoAsignarModal from '../components/AutoAsignarModal';
import Leyenda from '../components/Leyenda';
import ValidacionPanel from '../components/ValidacionPanel';

export default function Cuadrante() {
  const [fechaReferencia, setFechaReferencia] = useState(new Date());
  const [filtroGrupo, setFiltroGrupo] = useState<string>('');
  const [soloConductores, setSoloConductores] = useState(false);

  const [modalAsignacion, setModalAsignacion] = useState<{
    isOpen: boolean;
    personaId?: string;
    fecha?: string;
    asignacion?: Asignacion;
  }>({ isOpen: false });

  const [modalRango, setModalRango] = useState(false);
  const [modalAutoAsignar, setModalAutoAsignar] = useState(false);

  // Calcular rango de fechas
  const rango = getMonthRange(fechaReferencia);

  const dias = getDaysInRange(rango.start, rango.end);

  // Obtener personas
  const { data: personas = [] } = useQuery({
    queryKey: ['personas'],
    queryFn: async () => {
      const { data } = await api.get('/personas');
      return data as Persona[];
    },
  });

  // Obtener asignaciones del rango
  const { data: asignaciones = [], refetch: refetchAsignaciones } = useQuery({
    queryKey: ['asignaciones', formatDate(rango.start), formatDate(rango.end)],
    queryFn: async () => {
      const fechaInicioStr = formatDate(rango.start);
      const fechaFinStr = formatDate(rango.end);
      const { data } = await api.get(
        `/asignaciones?fechaInicio=${fechaInicioStr}&fechaFin=${fechaFinStr}`
      );
      return data as Asignacion[];
    },
  });

  // Obtener validaciones
  const { data: validaciones = [] } = useQuery({
    queryKey: ['validaciones', formatDate(rango.start), formatDate(rango.end)],
    queryFn: async () => {
      const { data } = await api.get(
        `/asignaciones/validar?fechaInicio=${formatDate(rango.start)}&fechaFin=${formatDate(rango.end)}`
      );
      return data;
    },
  });

  // Filtrar personas
  let personasFiltradas = personas;
  if (filtroGrupo) {
    personasFiltradas = personasFiltradas.filter((p) => p.grupo === filtroGrupo);
  }
  if (soloConductores) {
    personasFiltradas = personasFiltradas.filter((p) => p.isConductor);
  }
  
  // Ordenar por grupo (A primero, luego B)
  personasFiltradas = [...personasFiltradas].sort((a, b) => {
    if (a.grupo === 'A' && b.grupo === 'B') return -1;
    if (a.grupo === 'B' && b.grupo === 'A') return 1;
    return 0;
  });

  // Helper para obtener asignación
  const getAsignacion = (personaId: string, fecha: Date): Asignacion | undefined => {
    const fechaStr = formatDate(fecha);
    return asignaciones.find(
      (a) => a.personaId === personaId && formatDate(a.fecha) === fechaStr
    );
  };

  // Calcular total de guardias por día
  const getTotalGuardiasPorDia = (fecha: Date): number => {
    const fechaStr = formatDate(fecha);
    return asignaciones.filter(
      (a) => formatDate(a.fecha) === fechaStr && a.estado === Estado.G
    ).length;
  };

  // Calcular conteo de estados por persona
  const getConteoEstadoPorPersona = (personaId: string, estado: Estado): number => {
    return asignaciones.filter(
      (a) => a.personaId === personaId && a.estado === estado
    ).length;
  };

  const handleCeldaClick = (personaId: string, fecha: Date) => {
    const asignacion = getAsignacion(personaId, fecha);
    setModalAsignacion({
      isOpen: true,
      personaId,
      fecha: formatDate(fecha),
      asignacion,
    });
  };

  const avanzarPeriodo = () => {
    const nuevaFecha = new Date(fechaReferencia);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
    setFechaReferencia(nuevaFecha);
  };

  const retrocederPeriodo = () => {
    const nuevaFecha = new Date(fechaReferencia);
    nuevaFecha.setMonth(nuevaFecha.getMonth() - 1);
    setFechaReferencia(nuevaFecha);
  };

  const volverHoy = () => {
    setFechaReferencia(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Controles superiores */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            {formatMonthYear(fechaReferencia)}
          </h2>
        </div>
        <div className="flex flex-wrap gap-4 items-center justify-between">

          <div className="flex gap-2 items-center">
            <button
              onClick={retrocederPeriodo}
              className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              ← Anterior
            </button>
            <button
              onClick={volverHoy}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Hoy
            </button>
            <button
              onClick={avanzarPeriodo}
              className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Siguiente →
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setModalRango(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Cambios por NEJ
            </button>
            <button
              onClick={() => setModalAutoAsignar(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Auto-asignar Guardias
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="mt-4 flex gap-4 items-center">
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Grupo:</label>
            <select
              value={filtroGrupo}
              onChange={(e) => setFiltroGrupo(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="">Todos</option>
              <option value="A">Grupo A</option>
              <option value="B">Grupo B</option>
            </select>
          </div>

          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={soloConductores}
              onChange={(e) => setSoloConductores(e.target.checked)}
              className="mr-2 rounded"
            />
            Solo Conductores
          </label>

          {(filtroGrupo || soloConductores) && (
            <button
              onClick={() => {
                setFiltroGrupo('');
                setSoloConductores(false);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Leyenda */}
      <Leyenda />

      {/* Grilla */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b-2 sticky left-0 bg-gray-50 z-10">
                Persona
              </th>
              {dias.map((dia) => (
                <th
                  key={dia.toISOString()}
                  className="px-1 py-2 text-center text-xs font-medium text-gray-700 border-b-2 min-w-[50px]"
                >
                  {formatDateHeader(dia)}
                </th>
              ))}
              {/* Columnas de conteo de estados */}
              {Object.values(Estado).map((estado) => (
                <th
                  key={estado}
                  className="px-2 py-2 text-center text-xs font-medium text-gray-700 border-b-2 bg-gray-100 min-w-[45px]"
                  title={ESTADO_LABELS[estado]}
                >
                  {estado}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {personasFiltradas.map((persona, index) => {
              // Detectar si es la primera persona del Grupo B (después del Grupo A)
              const esPrimeraDelGrupoB = 
                persona.grupo === 'B' && 
                index > 0 && 
                personasFiltradas[index - 1].grupo === 'A';
              
              return (
              <tr 
                key={persona.id} 
                className={`hover:bg-gray-50 ${esPrimeraDelGrupoB ? 'border-t-4 border-gray-400' : ''}`}
              >
                <td className="px-4 py-2 text-sm font-medium text-gray-900 border-b sticky left-0 bg-white z-10 truncate">
                  {persona.nombre}
                  {persona.isConductor && (
                    <span className="ml-1 text-blue-600">(C)</span>
                  )}
                </td>
                {dias.map((dia) => {
                  const asignacion = getAsignacion(persona.id, dia);
                  return (
                    <td
                      key={`${persona.id}-${dia.toISOString()}`}
                      className="px-0.5 py-0.5 border-b border-r text-center cursor-pointer hover:bg-gray-100 w-[50px]"
                      onClick={() => handleCeldaClick(persona.id, dia)}
                      title={
                        asignacion
                          ? `${ESTADO_LABELS[asignacion.estado]} (${asignacion.origen})\n${asignacion.nota || ''}`
                          : 'Libre - Click para asignar'
                      }
                    >
                      {asignacion ? (
                        <div
                          className={`px-1 py-0.5 rounded text-[10px] font-semibold border ${
                            ESTADO_COLORS[asignacion.estado]
                          }`}
                        >
                          {asignacion.estado}
                        </div>
                      ) : (
                        <div className="px-1 py-0.5 text-gray-300 text-[10px]">-</div>
                      )}
                    </td>
                  );
                })}
                {/* Columnas de conteo de estados por persona */}
                {Object.values(Estado).map((estado) => {
                  const conteo = getConteoEstadoPorPersona(persona.id, estado);
                  return (
                    <td
                      key={`${persona.id}-${estado}`}
                      className="px-2 py-2 border-b border-r text-center bg-gray-50 font-semibold text-xs"
                    >
                      {conteo > 0 ? (
                        <span className={`px-2 py-1 rounded ${ESTADO_COLORS[estado]}`}>
                          {conteo}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                  );
                })}
              </tr>
              );
            })}
            {/* Fila de totales por día */}
            <tr className="bg-blue-50 font-bold">
              <td className="px-4 py-2 text-sm text-gray-900 border-b-2 border-t-2 sticky left-0 bg-blue-50 z-10">
                Total Guardias
              </td>
              {dias.map((dia) => {
                const total = getTotalGuardiasPorDia(dia);
                return (
                  <td
                    key={`total-${dia.toISOString()}`}
                    className="px-0.5 py-1 border-b-2 border-t-2 border-r text-center bg-blue-50 font-bold text-xs"
                  >
                    <span className={`px-2 py-1 rounded ${
                      total === 4 
                        ? 'bg-green-200 text-green-800' 
                        : total < 4 
                        ? 'bg-yellow-200 text-yellow-800' 
                        : 'bg-red-200 text-red-800'
                    }`}>
                      {total}
                    </span>
                  </td>
                );
              })}
              {/* Celdas vacías para alinear con columnas de conteo */}
              {Object.values(Estado).map((estado) => (
                <td
                  key={`total-${estado}`}
                  className="px-2 py-2 border-b-2 border-t-2 bg-blue-50"
                ></td>
              ))}
            </tr>
          </tbody>
        </table>

        {personasFiltradas.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay personas que coincidan con los filtros
          </div>
        )}
      </div>

      {/* Panel de validaciones */}
      <ValidacionPanel validaciones={validaciones} />

      {/* Modales */}
      {modalAsignacion.isOpen && (
        <AsignacionModal
          isOpen={modalAsignacion.isOpen}
          onClose={() => {
            setModalAsignacion({ isOpen: false });
            refetchAsignaciones();
          }}
          personaId={modalAsignacion.personaId!}
          fecha={modalAsignacion.fecha!}
          asignacion={modalAsignacion.asignacion}
        />
      )}

      <AsignacionRangoModal
        isOpen={modalRango}
        onClose={() => {
          setModalRango(false);
          refetchAsignaciones();
        }}
        personas={personas}
      />

      <AutoAsignarModal
        isOpen={modalAutoAsignar}
        onClose={() => {
          setModalAutoAsignar(false);
          refetchAsignaciones();
        }}
        fechaInicio={formatDate(rango.start)}
        fechaFin={formatDate(rango.end)}
      />
    </div>
  );
}

