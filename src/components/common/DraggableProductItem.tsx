import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, CheckCircle, Circle } from 'lucide-react';
import { QuantityControls } from './QuantityControls';

interface DraggableProductItemProps {
  producto: {
    id_producto: number;
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    categoria: string;
    esencial: boolean;
  };
  isChecked: boolean;
  onToggle: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export const DraggableProductItem = ({
  producto,
  isChecked,
  onToggle,
  onIncrement,
  onDecrement,
  onRemove
}: DraggableProductItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: producto.id_producto });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50
        rounded-xl transition-all group
        ${isDragging ? 'z-50 shadow-2xl ring-2 ring-blue-500' : ''}
      `}
    >
      {/* Layout responsive: columna en móvil, fila en desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Fila superior: Drag + Checkbox + Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="Arrastrar para reordenar"
          >
            <GripVertical className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>

          {/* Checkbox */}
          <div 
            className="flex-shrink-0 cursor-pointer"
            onClick={onToggle}
          >
            {isChecked ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <Circle className="w-6 h-6 text-gray-300 dark:text-gray-600 group-hover:text-gray-400" />
            )}
          </div>

          {/* Info del Producto */}
          <div 
            className="flex-1 min-w-0 cursor-pointer"
            onClick={onToggle}
          >
            <p className={`font-medium text-sm sm:text-base ${
              isChecked
                ? 'line-through text-gray-400 dark:text-gray-500'
                : 'text-gray-900 dark:text-white'
            }`}>
              {producto.nombre}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {producto.precio_unitario.toFixed(2)}€/ud
              </p>
              {producto.esencial && (
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded-full">
                  Esencial
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Fila inferior/derecha: Controles + Precio */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pl-11 sm:pl-0" onClick={(e) => e.stopPropagation()}>
          <QuantityControls
            quantity={producto.cantidad}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            onRemove={onRemove}
            size="sm"
          />
          <div className="text-right min-w-[4rem]">
            <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
              {(producto.cantidad * producto.precio_unitario).toFixed(2)}€
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

