import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Home, Trash2, Package } from 'lucide-react';
import { useListHistory } from '../hooks/useListHistory';
import ListHistoryCard from '../components/history/ListHistoryCard';
import type { SavedList } from '../hooks/useListHistory';

interface HistoryPageProps {
  onViewList: (lista: SavedList) => void;
  onBackToHome: () => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ onViewList, onBackToHome }) => {
  const { savedLists, deleteList, updateListName, clearAllLists } = useListHistory();
  const [showClearConfirm, setShowClearConfirm] = React.useState(false);

  const handleClearAll = () => {
    clearAllLists();
    setShowClearConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <History className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Mis Listas Guardadas
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {savedLists.length} {savedLists.length === 1 ? 'lista guardada' : 'listas guardadas'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {savedLists.length > 0 && (
                showClearConfirm ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleClearAll}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors text-sm"
                    >
                      Confirmar borrado
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                    title="Borrar todas las listas"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Borrar todas</span>
                  </button>
                )
              )}

              <button
                onClick={onBackToHome}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Volver al inicio</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {savedLists.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No tienes listas guardadas
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Las listas que generes se guardarán automáticamente aquí para que puedas consultarlas cuando quieras.
            </p>
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
            >
              <Home className="w-5 h-5" />
              Crear mi primera lista
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {savedLists.map((lista) => (
                <ListHistoryCard
                  key={lista.id}
                  lista={lista}
                  onView={onViewList}
                  onDelete={deleteList}
                  onUpdateName={updateListName}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
