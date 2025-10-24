import { motion } from 'framer-motion';
import { MealTag } from './MealTag';

interface MenuDay {
  desayuno?: string;
  comida?: string;
  cena?: string;
}

interface DayCardProps {
  dayName: string;
  menu: MenuDay;
  className?: string;
}

export const DayCard = ({ dayName, menu, className = '' }: DayCardProps) => {
  const hasMeals = menu.desayuno || menu.comida || menu.cena;

  if (!hasMeals) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          Sin menú planificado
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20
        rounded-xl p-6 border border-blue-200 dark:border-blue-800
        ${className}
      `}
    >
      {/* Header del día */}
      <div className="mb-4 pb-3 border-b border-blue-200 dark:border-blue-700">
        <h4 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          📅 {dayName}
        </h4>
      </div>

      {/* Comidas del día */}
      <div className="space-y-4">
        {menu.desayuno && (
          <div>
            <MealTag type="desayuno" />
            <p className="mt-2 text-gray-700 dark:text-gray-300 pl-7">
              {menu.desayuno}
            </p>
          </div>
        )}

        {menu.comida && (
          <div>
            <MealTag type="comida" />
            <p className="mt-2 text-gray-700 dark:text-gray-300 pl-7">
              {menu.comida}
            </p>
          </div>
        )}

        {menu.cena && (
          <div>
            <MealTag type="cena" />
            <p className="mt-2 text-gray-700 dark:text-gray-300 pl-7">
              {menu.cena}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

