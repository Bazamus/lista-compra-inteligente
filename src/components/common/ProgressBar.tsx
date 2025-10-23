import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface ProgressBarProps {
  completed: number;
  total: number;
  className?: string;
}

export const ProgressBar = ({ completed, total, className = '' }: ProgressBarProps) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = completed === total && total > 0;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Texto de progreso */}
      <div className="flex items-center justify-between text-sm font-medium">
        <span className="text-gray-700 dark:text-gray-300">
          {completed} de {total} productos
        </span>
        <div className="flex items-center gap-2">
          {isComplete && <CheckCircle2 className="w-5 h-5 text-green-500" />}
          <span className={`text-lg font-bold ${
            isComplete 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-blue-600 dark:text-blue-400'
          }`}>
            {percentage}%
          </span>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            isComplete
              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
              : 'bg-gradient-to-r from-blue-500 to-purple-500'
          }`}
        />
        
        {/* Shine effect */}
        {percentage > 0 && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        )}
      </div>

      {/* Mensaje de estado */}
      {isComplete && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm font-medium text-green-600 dark:text-green-400"
        >
          ¡Lista completada! 🎉
        </motion.p>
      )}
    </div>
  );
};

