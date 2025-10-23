import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Calendar, Users, Euro, Trash2, Eye, Edit3, Check, X, Sparkles, Package, Copy, Search
} from 'lucide-react';
import type { SavedList } from '../../hooks/useListHistory';

interface ListHistoryCardProps {
  lista: SavedList;
  onView: (lista: SavedList) => void;
  onDelete: (listId: string) => void;
  onUpdateName: (listId: string, newName: string) => void;
  onDuplicate?: (lista: SavedList) => void;
  onQuickPreview?: (lista: SavedList) => void;
}

const ListHistoryCard: React.FC<ListHistoryCardProps> = ({
  lista,
  onView,
  onDelete,
  onUpdateName,
  onDuplicate,
  onQuickPreview
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(lista.nombre);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveName = () => {
    if (newName.trim() && newName !== lista.nombre) {
      onUpdateName(lista.id, newName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setNewName(lista.nombre);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(lista.id);
    setShowDeleteConfirm(false);
  };

  const totalProductos = lista.productos.length;
  const fecha = new Date(lista.fecha);
  const fechaFormateada = fecha.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Determinar tipo de lista y colores del badge
  const tipoLista = lista.tipo || (Object.keys(lista.menus || {}).length > 0 ? 'IA' : 'Manual');
  const badgeConfig = tipoLista === 'IA'
    ? {
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        icon: Sparkles,
        label: 'IA'
      }
    : {
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: Package,
        label: 'Manual'
      };

  const BadgeIcon = badgeConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6 relative overflow-hidden"
    >
      {/* Badge tipo de lista */}
      <div className="absolute top-4 right-4">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${badgeConfig.color}`}>
          <BadgeIcon className="w-3.5 h-3.5" />
          <span>{badgeConfig.label}</span>
        </div>
      </div>

      {/* Header con nombre editable */}
      <div className="mb-4 pr-20">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 px-3 py-2 border-2 border-blue-500 rounded-lg focus:outline-none focus:border-blue-600"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') handleCancelEdit();
              }}
            />
            <button
              onClick={handleSaveName}
              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              title="Guardar"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              title="Cancelar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex-1">
              {lista.nombre}
            </h3>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Editar nombre"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          <Calendar className="w-4 h-4 inline mr-1" />
          {fechaFormateada}
        </p>
      </div>

      {/* Información resumida */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <ShoppingCart className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Productos</p>
            <p className="font-semibold">{totalProductos}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Users className="w-5 h-5 text-green-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Personas</p>
            <p className="font-semibold">{lista.personas}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Calendar className="w-5 h-5 text-purple-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Días</p>
            <p className="font-semibold">{lista.dias}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Euro className="w-5 h-5 text-orange-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Presupuesto</p>
            <p className="font-semibold">{lista.presupuesto_estimado.toFixed(2)}€</p>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="space-y-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {/* Fila 1: Botones principales */}
        <div className="flex gap-2">
          <button
            onClick={() => onView(lista)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
          >
            <Eye className="w-4 h-4" />
            Ver lista
          </button>

          {showDeleteConfirm ? (
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors text-sm"
              >
                Confirmar
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors text-sm"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
              title="Eliminar lista"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Fila 2: Acciones rápidas */}
        <div className="flex gap-2">
          {onQuickPreview && (
            <button
              onClick={() => onQuickPreview(lista)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors text-sm"
              title="Vista previa rápida"
            >
              <Search className="w-4 h-4" />
              Vista previa
            </button>
          )}
          
          {onDuplicate && (
            <button
              onClick={() => onDuplicate(lista)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors text-sm"
              title="Duplicar lista"
            >
              <Copy className="w-4 h-4" />
              Duplicar
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ListHistoryCard;
