import { useState, FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { Persona, Estado } from '../types';
import { ESTADO_LABELS } from '../utils/constants';
import toast from 'react-hot-toast';

interface AsignacionRangoModalProps {
  isOpen: boolean;
  onClose: () => void;
  personas: Persona[];
}

export default function AsignacionRangoModal({
  isOpen,
  onClose,
  personas,
}: AsignacionRangoModalProps) {
  const [personaId, setPersonaId] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [estado, setEstado] = useState<Estado | ''>('');
  const [nota, setNota] = useState('');

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post('/asignaciones/rango', data);
    },
    onSuccess: (response) => {
      toast.success(`${response.data.length} asignaciones creadas exitosamente`);
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al crear asignaciones');
    },
  });

  const resetForm = () => {
    setPersonaId('');
    setFechaInicio('');
    setFechaFin('');
    setEstado('');
    setNota('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!personaId || !fechaInicio || !fechaFin || !estado) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      toast.error('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    mutation.mutate({
      personaId,
      fechaInicio,
      fechaFin,
      estado,
      nota,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>

        <div className="relative bg-white rounded-lg max-w-md w-full p-6 z-10">
          <h3 className="text-xl font-bold mb-4">Asignar Estado por Rango</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Persona
              </label>
              <select
                value={personaId}
                onChange={(e) => setPersonaId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar persona...</option>
                {personas.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.nombre} - Grupo {persona.grupo}
                    {persona.isConductor ? ' (C)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

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
                rows={2}
                placeholder="Motivo de la asignación..."
              />
            </div>

            {fechaInicio && fechaFin && (
              <div className="p-3 bg-blue-50 rounded text-sm text-gray-700">
                <strong>Vista previa:</strong> Se asignará el estado a todos los días desde{' '}
                {fechaInicio} hasta {fechaFin}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {mutation.isPending ? 'Asignando...' : 'Aplicar a Rango'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

