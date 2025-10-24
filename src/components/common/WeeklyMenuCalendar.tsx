import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Calendar, Utensils } from 'lucide-react';
import { DayCard } from './DayCard';

interface MenuDay {
  desayuno?: string;
  comida?: string;
  cena?: string;
}

interface WeeklyMenuCalendarProps {
  menus: Record<string, MenuDay>;
  className?: string;
}

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const WeeklyMenuCalendar = ({ menus, className = '' }: WeeklyMenuCalendarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Convertir menus de "dia_1", "dia_2" a nombres de días
  const menusByDayName = Object.keys(menus).reduce((acc, key) => {
    const dayNumber = parseInt(key.replace('dia_', ''));
    if (!isNaN(dayNumber) && dayNumber >= 1 && dayNumber <= 7) {
      const dayName = DIAS_SEMANA[dayNumber - 1];
      acc[dayName] = menus[key];
    }
    return acc;
  }, {} as Record<string, MenuDay>);

  const hasMenus = Object.keys(menusByDayName).length > 0;

  if (!hasMenus) {
    return null; // No mostrar si no hay menús
  }

  const totalMeals = Object.values(menusByDayName).reduce((count, day) => {
    return count + 
      (day.desayuno ? 1 : 0) + 
      (day.comida ? 1 : 0) + 
      (day.cena ? 1 : 0);
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    >
      {/* Header expandible/colapsable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-blue-500" />
          <div className="text-left">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              Menú Semanal
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {totalMeals} comidas planificadas
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Contenido expandible */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200 dark:border-gray-700"
          >
            {/* Vista compacta: Grid de días */}
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {DIAS_SEMANA.map((dia) => {
                  const menu = menusByDayName[dia];
                  const hasMenu = menu && (menu.desayuno || menu.comida || menu.cena);
                  const isSelected = selectedDay === dia;

                  return (
                    <button
                      key={dia}
                      onClick={() => setSelectedDay(isSelected ? null : dia)}
                      className={`
                        relative p-3 rounded-lg border-2 transition-all
                        ${hasMenu 
                          ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                        }
                        ${isSelected 
                          ? 'ring-2 ring-blue-500 scale-105' 
                          : 'hover:scale-102'
                        }
                      `}
                    >
                      <div className="text-center">
                        <p className={`text-xs font-semibold mb-1 ${
                          hasMenu 
                            ? 'text-blue-700 dark:text-blue-300' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {dia.slice(0, 3).toUpperCase()}
                        </p>
                        {hasMenu && (
                          <div className="flex justify-center gap-1">
                            {menu.desayuno && <span className="text-xs">🍞</span>}
                            {menu.comida && <span className="text-xs">🍽️</span>}
                            {menu.cena && <span className="text-xs">🌙</span>}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Detalle del día seleccionado */}
              <AnimatePresence mode="wait">
                {selectedDay && menusByDayName[selectedDay] && (
                  <motion.div
                    key={selectedDay}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="mt-6"
                  >
                    <DayCard
                      dayName={selectedDay}
                      menu={menusByDayName[selectedDay]}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {!selectedDay && (
                <div className="mt-6 text-center">
                  <Utensils className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Haz clic en un día para ver el menú
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

