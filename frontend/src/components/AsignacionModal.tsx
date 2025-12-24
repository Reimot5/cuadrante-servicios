import { useState, useEffect, FormEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Asignacion, Estado, Persona } from '../types';
import { ESTADO_LABELS } from '../utils/constants';
import toast from 'react-hot-toast';

interface AsignacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  personaId: string;
  fecha: string;
  asignacion?: Asignacion;
}

export default function AsignacionModal({
  isOpen,
  onClose,
  personaId,
  fecha,
  asignacion,
}: AsignacionModalProps) {
  const [estado, setEstado] = useState<Estado | ''>('');
  const [nota, setNota] = useState('');

  const { data: persona } = useQuery({
    queryKey: ['persona', personaId],
    queryFn: async () => {
      const { data } = await api.get(`/personas/${personaId}`);
      return data as Persona;
    },
    enabled: isOpen,
  });

  useEffect(() => {
    if (asignacion) {
      setEstado(asignacion.estado);
      setNota(asignacion.nota || '');
    } else {
      setEstado('');
      setNota('');
    }
  }, [asignacion, isOpen]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post('/asignaciones', data);
    },
    onSuccess: () => {
      toast.success('Asignación guardada exitosamente');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al guardar asignación');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (asignacion) {
        return api.delete(`/asignaciones/${asignacion.id}`);
      }
    },
    onSuccess: () => {
      toast.success('Asignación eliminada');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al eliminar asignación');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!estado) {
      toast.error('Debe seleccionar un estado');
      return;
    }

    mutation.mutate({
      fecha,
      personaId,
      estado,
      nota,
    });
  };

  const handleDelete = () => {
    if (confirm('¿Está seguro de eliminar esta asignación?')) {
      deleteMutation.mutate();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>

        <div className="relative bg-white rounded-lg max-w-md w-full p-6 z-10">
          <h3 className="text-xl font-bold mb-4">
            {asignacion ? 'Editar Asignación' : 'Nueva Asignación'}
          </h3>

          <div className="mb-4 p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              <strong>Persona:</strong> {persona?.nombre}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Fecha:</strong> {fecha}
            </p>
            {asignacion && (
              <p className="text-xs text-gray-500 mt-1">
                Origen: {asignacion.origen}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as Estado)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar estado...</option>
                {Object.values(Estado).map((est) => (
                  <option key={est} value={est}>
                    {est} - {ESTADO_LABELS[est]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nota (opcional)
              </label>
              <textarea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Agregar una nota..."
              />
            </div>

            <div className="flex justify-between mt-6">
              <div>
                {asignacion && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Eliminar
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {mutation.isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

