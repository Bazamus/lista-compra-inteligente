import { motion } from 'framer-motion';
import { Plus, Minus, Trash2 } from 'lucide-react';

interface QuantityControlsProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const QuantityControls = ({
  quantity,
  onIncrement,
  onDecrement,
  onRemove,
  min = 1,
  max = 99,
  size = 'md',
  className = ''
}: QuantityControlsProps) => {
  
  const sizeClasses = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-11 h-11 text-lg'
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20
  };

  const buttonClass = `
    ${sizeClasses[size]}
    flex items-center justify-center
    rounded-lg font-semibold
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-1
    disabled:opacity-40 disabled:cursor-not-allowed
  `;

  const canDecrement = quantity > min;
  const canIncrement = quantity < max;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Botón Decrementar o Eliminar */}
      {quantity === min ? (
        <motion.button
          onClick={onRemove}
          className={`
            ${buttonClass}
            bg-red-100 dark:bg-red-900/30
            text-red-600 dark:text-red-400
            hover:bg-red-200 dark:hover:bg-red-900/50
            focus:ring-red-500
          `}
          whileTap={{ scale: 0.9 }}
          title="Eliminar producto"
          aria-label="Eliminar producto"
        >
          <Trash2 size={iconSizes[size]} />
        </motion.button>
      ) : (
        <motion.button
          onClick={onDecrement}
          disabled={!canDecrement}
          className={`
            ${buttonClass}
            bg-gray-100 dark:bg-gray-700
            text-gray-700 dark:text-gray-300
            hover:bg-gray-200 dark:hover:bg-gray-600
            focus:ring-gray-500
          `}
          whileTap={{ scale: canDecrement ? 0.9 : 1 }}
          title="Reducir cantidad"
          aria-label="Reducir cantidad"
        >
          <Minus size={iconSizes[size]} />
        </motion.button>
      )}

      {/* Display de Cantidad */}
      <motion.div
        key={quantity}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        className={`
          ${size === 'sm' ? 'min-w-[2.5rem]' : size === 'md' ? 'min-w-[3rem]' : 'min-w-[3.5rem]'}
          flex items-center justify-center
          px-3 py-1
          bg-blue-50 dark:bg-blue-900/20
          border-2 border-blue-200 dark:border-blue-800
          rounded-lg
          font-bold
          ${size === 'sm' ? 'text-base' : size === 'md' ? 'text-lg' : 'text-xl'}
          text-blue-700 dark:text-blue-300
        `}
      >
        {quantity}
      </motion.div>

      {/* Botón Incrementar */}
      <motion.button
        onClick={onIncrement}
        disabled={!canIncrement}
        className={`
          ${buttonClass}
          bg-green-100 dark:bg-green-900/30
          text-green-600 dark:text-green-400
          hover:bg-green-200 dark:hover:bg-green-900/50
          focus:ring-green-500
        `}
        whileTap={{ scale: canIncrement ? 0.9 : 1 }}
        title="Aumentar cantidad"
        aria-label="Aumentar cantidad"
      >
        <Plus size={iconSizes[size]} />
      </motion.button>
    </div>
  );
};

