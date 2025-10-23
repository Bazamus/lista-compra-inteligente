import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export const FavoriteButton = ({
  isFavorite,
  onToggle,
  size = 'md',
  className = '',
  disabled = false
}: FavoriteButtonProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2'
  };

  return (
    <motion.button
      onClick={(e) => {
        e.stopPropagation(); // Evitar propagación al card padre
        onToggle();
      }}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.1 }}
      whileTap={{ scale: disabled ? 1 : 0.9 }}
      className={`
        ${buttonSizeClasses[size]}
        rounded-full
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-yellow-400
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isFavorite 
          ? 'bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50' 
          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
        }
        ${className}
      `}
      title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
    >
      <motion.div
        animate={{
          scale: isFavorite ? [1, 1.3, 1] : 1,
          rotate: isFavorite ? [0, 15, -15, 0] : 0
        }}
        transition={{
          duration: 0.5,
          ease: 'easeInOut'
        }}
      >
        <Star
          className={`
            ${sizeClasses[size]}
            transition-colors duration-200
            ${isFavorite 
              ? 'fill-yellow-400 stroke-yellow-500 dark:fill-yellow-500 dark:stroke-yellow-600' 
              : 'fill-none stroke-gray-500 dark:stroke-gray-400'
            }
          `}
        />
      </motion.div>
    </motion.button>
  );
};

