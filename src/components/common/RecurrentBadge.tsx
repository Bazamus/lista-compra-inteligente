import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecurrentBadgeProps {
  frequency?: number; // Número de veces que aparece (opcional)
  size?: 'sm' | 'md';
}

export const RecurrentBadge = ({ frequency, size = 'md' }: RecurrentBadgeProps) => {
  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs gap-1',
      icon: 'w-3 h-3'
    },
    md: {
      container: 'px-2.5 py-1 text-xs gap-1.5',
      icon: 'w-3.5 h-3.5'
    }
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`
        inline-flex items-center
        ${sizeClasses[size].container}
        bg-gradient-to-r from-emerald-500 to-teal-500
        text-white font-bold rounded-full shadow-md
      `}
      title={frequency ? `Comprado ${frequency} veces en tus últimas listas` : 'Producto que compras seguido'}
    >
      <TrendingUp className={sizeClasses[size].icon} />
      <span>Compras seguido</span>
      {frequency && frequency > 3 && (
        <span className="ml-1 bg-white/30 px-1.5 rounded-full">
          {frequency}x
        </span>
      )}
    </motion.div>
  );
};

