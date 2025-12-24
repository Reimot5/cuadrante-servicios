import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Persona, Grupo } from '../types';
import toast from 'react-hot-toast';
import PersonaModal from '../components/PersonaModal';

export default function Personas() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [filtroGrupo, setFiltroGrupo] = useState<string>('');
  const [filtroConductor, setFiltroConductor] = useState<string>('');
  
  const queryClient = useQueryClient();

  const { data: personas = [], isLoading } = useQuery({
    queryKey: ['personas', filtroGrupo, filtroConductor],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filtroGrupo) params.append('grupo', filtroGrupo);
      if (filtroConductor) params.append('isConductor', filtroConductor);
      
      const { data } = await api.get(`/personas?${params}`);
      return data as Persona[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/personas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personas'] });
      toast.success('Persona eliminada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al eliminar persona');
    },
  });

  const handleEdit = (persona: Persona) => {
    setSelectedPersona(persona);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar esta persona?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCreate = () => {
    setSelectedPersona(null);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Cargando personas...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Gestión de Personas</h2>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          + Nueva Persona
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filtrar por Grupo
          </label>
          <select
            value={filtroGrupo}
            onChange={(e) => setFiltroGrupo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Todos</option>
            <option value="A">Grupo A</option>
            <option value="B">Grupo B</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filtrar por Conductor
          </label>
          <select
            value={filtroConductor}
            onChange={(e) => setFiltroConductor(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Todos</option>
            <option value="true">Solo Conductores</option>
            <option value="false">No Conductores</option>
          </select>
        </div>

        {(filtroGrupo || filtroConductor) && (
          <div className="flex items-end">
            <button
              onClick={() => {
                setFiltroGrupo('');
                setFiltroConductor('');
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grupo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Conductor
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {personas.map((persona) => (
              <tr key={persona.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {persona.nombre}
                    {persona.isConductor && (
                      <span className="ml-2 text-blue-600">(C)</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      persona.grupo === Grupo.A
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    Grupo {persona.grupo}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {persona.isConductor ? (
                    <span className="text-green-600">✓ Sí</span>
                  ) : (
                    <span className="text-gray-400">✗ No</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(persona)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(persona.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {personas.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay personas registradas
          </div>
        )}
      </div>

      <PersonaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPersona(null);
        }}
        persona={selectedPersona}
      />
    </div>
  );
}

