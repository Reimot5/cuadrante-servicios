import { useState, FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { ResultadoAutoAsignacion } from '../types';
import toast from 'react-hot-toast';

interface AutoAsignarModalProps {
  isOpen: boolean;
  onClose: () => void;
  fechaInicio?: string;
  fechaFin?: string;
}

export default function AutoAsignarModal({
  isOpen,
  onClose,
  fechaInicio: fechaInicioProp,
  fechaFin: fechaFinProp,
}: AutoAsignarModalProps) {
  const [fechaInicio, setFechaInicio] = useState(fechaInicioProp || '');
  const [fechaFin, setFechaFin] = useState(fechaFinProp || '');
  const [resultado, setResultado] = useState<ResultadoAutoAsignacion | null>(null);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: response } = await api.post('/asignaciones/auto-asignar', data);
      return response as ResultadoAutoAsignacion;
    },
    onSuccess: (data) => {
      setResultado(data);
      if (data.exito) {
        toast.success('Auto-asignación completada exitosamente');
      } else {
        toast.error('Auto-asignación completada con algunos errores');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error en auto-asignación');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!fechaInicio || !fechaFin) {
      toast.error('Las fechas son obligatorias');
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      toast.error('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    setResultado(null);
    mutation.mutate({ fechaInicio, fechaFin });
  };

  const handleClose = () => {
    setResultado(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={handleClose}></div>

        <div className="relative bg-white rounded-lg max-w-2xl w-full p-6 z-10 max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">Auto-asignación de Guardias</h3>

          <div className="mb-4 p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
            <p className="font-medium mb-2">¿Cómo funciona?</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Asigna automáticamente 4 guardias por día</li>
              <li>Asegura al menos 1 persona del Grupo A</li>
              <li>Asegura al menos 1 conductor</li>
              <li>Prioriza conductores del Grupo A</li>
              <li>Balancea la carga de guardias entre todas las personas</li>
              <li>Respeta estados manuales existentes</li>
              <li>Solo asigna a días vacíos</li>
            </ul>
          </div>

          {!resultado ? (
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  {mutation.isPending ? 'Procesando...' : 'Ejecutar Auto-asignación'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {resultado.diasProcesados}
                  </div>
                  <div className="text-sm text-gray-600">Días procesados</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {resultado.guardiasAsignadas}
                  </div>
                  <div className="text-sm text-gray-600">Guardias asignadas</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {resultado.errores.length}
                  </div>
                  <div className="text-sm text-gray-600">Errores</div>
                </div>
              </div>

              {resultado.errores.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-800 mb-2">Errores encontrados:</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {resultado.errores.map((error, idx) => (
                      <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded">
                        <div className="font-medium text-red-800">{error.fecha}</div>
                        <div className="text-sm text-red-600">{error.mensaje}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

