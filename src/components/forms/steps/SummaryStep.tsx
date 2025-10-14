import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Users, Euro, Clock, Utensils, ShoppingBasket,
  Package, Heart, Sparkles, Edit, ChevronRight, AlertCircle
} from 'lucide-react';
import type { FormStepProps } from '../../../types/form.types';
import { generarListaConIA } from '../../../lib/api';

interface SummaryStepProps extends FormStepProps {
  onSubmit: (resultadoIA?: any) => void;
}

const SummaryStep: React.FC<SummaryStepProps> = ({ data, updateData, onSubmit }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [nombreLista, setNombreLista] = useState(data.nombreLista || '');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Actualizar el nombre de la lista
      updateData({ nombreLista });

      // Preparar datos para la API
      const parametrosGeneracion = {
        numPersonas: data.numPersonas || 2,
        diasDuracion: data.diasDuracion || 7,
        presupuesto: data.presupuesto || 50,
        tipoComidas: data.tipoComidas || { desayuno: [], comida: [], cena: [] },
        alimentosBasicos: data.alimentosBasicos || [],
        productosAdicionales: data.productosAdicionales || [],
        restricciones: data.restricciones || [],
        preferencias: data.preferencias || []
      };

      console.log('📤 Enviando petición a la API...', parametrosGeneracion);

      // Llamar a la API de generación con IA con timeout
      const apiPromise = generarListaConIA(parametrosGeneracion);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: La generación tardó más de 60 segundos')), 60000)
      );
      
      const resultado = await Promise.race([apiPromise, timeoutPromise]);

      console.log('✅ Respuesta de la API:', resultado);

      // Pasar el resultado a onSubmit para que App.tsx lo maneje
      onSubmit(resultado);

    } catch (err: any) {
      console.error('❌ Error generando lista:', err);
      setError(err.message || 'Error al generar la lista. Por favor, inténtalo de nuevo.');
      setIsGenerating(false);
    }
  };

  const formatBudget = () => {
    if (data.presupuestoTipo === 'personalizado') {
      return `${data.presupuesto}€`;
    }
    const budgetRanges = {
      'ajustado': '30-50€/semana',
      'moderado': '50-80€/semana',
      'flexible': '80€+/semana'
    };
    return budgetRanges[data.presupuestoTipo as keyof typeof budgetRanges] || 'No especificado';
  };

  const getTotalMealTypes = () => {
    const { tipoComidas } = data;
    return (tipoComidas?.desayuno?.length || 0) + 
           (tipoComidas?.comida?.length || 0) + 
           (tipoComidas?.cena?.length || 0);
  };

  const getEstimatedProducts = () => {
    const baseProducts = 15; // Base de productos
    const peopleMultiplier = (data.numPersonas || 1) * 2;
    const daysMultiplier = Math.ceil((data.diasDuracion || 7) / 7) * 3;
    const mealsMultiplier = getTotalMealTypes();
    const additionalProducts = (data.alimentosBasicos?.length || 0) + (data.productosAdicionales?.length || 0);
    
    return Math.min(baseProducts + peopleMultiplier + daysMultiplier + mealsMultiplier + additionalProducts, 60);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          ¡Todo listo para generar tu lista!
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Revisa el resumen de tus preferencias antes de continuar
        </p>
      </motion.div>

      {/* Resumen en tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información básica */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800"
        >
          <h3 className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-300 mb-4">
            <Calendar className="w-5 h-5" />
            Información básica
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Duración:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.diasDuracion} día{data.diasDuracion !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Personas:</span>
              <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                <Users className="w-4 h-4" />
                {data.numPersonas}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Presupuesto:</span>
              <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                <Euro className="w-4 h-4" />
                {formatBudget()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Preferencias de comidas */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 border border-green-200 dark:border-green-800"
        >
          <h3 className="flex items-center gap-2 font-semibold text-green-700 dark:text-green-300 mb-4">
            <Utensils className="w-5 h-5" />
            Preferencias de comidas
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Desayuno:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.tipoComidas?.desayuno?.length || 0} tipos
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Comida:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.tipoComidas?.comida?.length || 0} tipos
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Cena:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.tipoComidas?.cena?.length || 0} tipos
              </span>
            </div>
            <div className="pt-2 border-t border-green-200 dark:border-green-700">
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                Total: {getTotalMealTypes()} tipos de alimentos
              </span>
            </div>
          </div>
        </motion.div>

        {/* Productos adicionales */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800"
        >
          <h3 className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-300 mb-4">
            <ShoppingBasket className="w-5 h-5" />
            Productos adicionales
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Básicos:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.alimentosBasicos?.length || 0} productos
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Para el hogar:</span>
              <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                <Package className="w-4 h-4" />
                {data.productosAdicionales?.length || 0} productos
              </span>
            </div>
          </div>
        </motion.div>

        {/* Restricciones y preferencias */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800"
        >
          <h3 className="flex items-center gap-2 font-semibold text-purple-700 dark:text-purple-300 mb-4">
            <Heart className="w-5 h-5" />
            Restricciones y preferencias
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Restricciones:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.restricciones?.length || 0} restricción{(data.restricciones?.length || 0) !== 1 ? 'es' : ''}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Preferencias:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.preferencias?.length || 0} preferencia{(data.preferencias?.length || 0) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Estimación de resultados */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-indigo-50 via-blue-50 to-teal-50 dark:from-indigo-900/20 dark:via-blue-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800"
      >
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Lo que vamos a generar</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ~{getEstimatedProducts()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                productos aproximados
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.diasDuracion}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                días de menús
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {(data.diasDuracion || 7) * 3}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                comidas planificadas
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Nombre de la lista */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Edit className="w-5 h-5" />
          Nombre de tu lista (opcional)
        </h3>
        <input
          type="text"
          value={nombreLista}
          onChange={(e) => setNombreLista(e.target.value)}
          placeholder={`Lista de compra ${data.diasDuracion} días - ${data.numPersonas} persona${data.numPersonas !== 1 ? 's' : ''}`}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Si no especificas un nombre, se generará automáticamente
        </p>
      </motion.div>

      {/* Botón de generar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-center"
      >
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`
            inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg
            transition-all duration-300 transform hover:scale-105
            ${isGenerating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 hover:from-blue-600 hover:via-purple-600 hover:to-green-600 shadow-xl hover:shadow-2xl'
            }
            text-white
          `}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              Generando tu lista mágica...
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              ¡Generar mi lista inteligente!
              <ChevronRight className="w-6 h-6" />
            </>
          )}
        </button>
        
        {!isGenerating && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            ⚡ La IA creará una lista personalizada en segundos
          </p>
        )}
      </motion.div>

      {/* Estimación de tiempo */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
            <Clock className="w-5 h-5 animate-pulse" />
            <span className="font-medium">Procesando tus preferencias...</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Analizando catálogo de productos • Optimizando presupuesto • Creando menús
          </div>
        </motion.div>
      )}

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-3 text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Error al generar la lista</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SummaryStep;
