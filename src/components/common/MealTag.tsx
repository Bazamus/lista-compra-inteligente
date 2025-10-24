interface MealTagProps {
  type: 'desayuno' | 'comida' | 'cena';
  className?: string;
}

const mealConfig = {
  desayuno: {
    icon: '🍞',
    label: 'Desayuno',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    textColor: 'text-pink-700 dark:text-pink-300',
    borderColor: 'border-pink-300 dark:border-pink-700'
  },
  comida: {
    icon: '🍽️',
    label: 'Comida',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    textColor: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-300 dark:border-amber-700'
  },
  cena: {
    icon: '🌙',
    label: 'Cena',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-300 dark:border-purple-700'
  }
};

export const MealTag = ({ type, className = '' }: MealTagProps) => {
  const config = mealConfig[type];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span 
        className={`
          inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
          border ${config.bgColor} ${config.textColor} ${config.borderColor}
        `}
      >
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    </div>
  );
};

