import { Estado } from '../types';
import { ESTADO_COLORS, ESTADO_LABELS } from '../utils/constants';

export default function Leyenda() {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Leyenda de Estados</h3>
      <div className="flex flex-wrap gap-4">
        {Object.values(Estado).map((estado) => (
          <div key={estado} className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded text-xs font-semibold border ${ESTADO_COLORS[estado]}`}>
              {estado}
            </div>
            <span className="text-sm text-gray-600">{ESTADO_LABELS[estado]}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded text-xs text-gray-400 bg-white border border-gray-200">
            -
          </div>
          <span className="text-sm text-gray-600">Libre</span>
        </div>
      </div>
    </div>
  );
}

