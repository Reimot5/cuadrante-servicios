import { useState, useEffect, FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Persona, Grupo } from '../types';
import toast from 'react-hot-toast';

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: Persona | null;
}

export default function PersonaModal({ isOpen, onClose, persona }: PersonaModalProps) {
  const [nombre, setNombre] = useState('');
  const [grupo, setGrupo] = useState<Grupo>(Grupo.A);
  const [isConductor, setIsConductor] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (persona) {
      setNombre(persona.nombre);
      setGrupo(persona.grupo);
      setIsConductor(persona.isConductor);
    } else {
      setNombre('');
      setGrupo(Grupo.A);
      setIsConductor(true);
    }
  }, [persona, isOpen]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (persona) {
        return api.put(`/personas/${persona.id}`, data);
      } else {
        return api.post('/personas', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personas'] });
      toast.success(persona ? 'Persona actualizada' : 'Persona creada');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al guardar persona');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (grupo === Grupo.A && !isConductor) {
      toast.error('El Grupo A solo puede contener conductores');
      return;
    }

    mutation.mutate({ nombre, grupo, isConductor });
  };

  // Efecto para forzar conductor si es Grupo A
  useEffect(() => {
    if (grupo === Grupo.A) {
      setIsConductor(true);
    }
  }, [grupo]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg max-w-md w-full p-6 z-10">
          <h3 className="text-xl font-bold mb-4">
            {persona ? 'Editar Persona' : 'Nueva Persona'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grupo
              </label>
              <select
                value={grupo}
                onChange={(e) => setGrupo(e.target.value as Grupo)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value={Grupo.A}>Grupo A</option>
                <option value={Grupo.B}>Grupo B</option>
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isConductor}
                  onChange={(e) => setIsConductor(e.target.checked)}
                  disabled={grupo === Grupo.A}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Es Conductor
                </span>
              </label>
              {grupo === Grupo.A && (
                <p className="mt-1 text-xs text-gray-500">
                  El Grupo A solo puede contener conductores
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
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
          </form>
        </div>
      </div>
    </div>
  );
}

