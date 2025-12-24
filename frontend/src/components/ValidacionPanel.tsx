import { ValidacionDia } from '../types';
import { formatDateDisplay } from '../utils/dates';

interface ValidacionPanelProps {
  validaciones: ValidacionDia[];
}

export default function ValidacionPanel({ validaciones }: ValidacionPanelProps) {
  const validacionesInvalidas = validaciones.filter((v) => !v.valido);

  if (validaciones.length === 0) {
    return null;
  }

  const totalValidos = validaciones.filter((v) => v.valido).length;
  const totalInvalidos = validacionesInvalidas.length;

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Validación de Reglas Duras
      </h3>

      <div className="flex gap-6 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-green-600 text-2xl">✓</span>
          <span className="text-sm text-gray-600">
            <strong className="text-green-600">{totalValidos}</strong> días válidos
          </span>
        </div>
        {totalInvalidos > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-red-600 text-2xl">✗</span>
            <span className="text-sm text-gray-600">
              <strong className="text-red-600">{totalInvalidos}</strong> días con errores
            </span>
          </div>
        )}
      </div>

      {validacionesInvalidas.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Días con problemas:</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {validacionesInvalidas.map((val) => (
              <div
                key={val.fecha}
                className="p-3 bg-red-50 border border-red-200 rounded-md"
              >
                <div className="flex items-start gap-2">
                  <span className="text-red-600 font-semibold text-sm">
                    {formatDateDisplay(val.fecha)}
                  </span>
                  <div className="flex-1">
                    <div className="text-xs text-gray-600 mb-1">
                      Guardias: {val.guardias}/4 |
                      Grupo A: {val.tieneGrupoA ? '✓' : '✗'} |
                      Conductor: {val.tieneConductor ? '✓' : '✗'}
                    </div>
                    <ul className="text-xs text-red-700 space-y-1">
                      {val.errores.map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

