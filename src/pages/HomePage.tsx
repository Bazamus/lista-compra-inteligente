import { ArrowRight, Sparkles, Clock, PiggyBank, History, ShoppingCart, Package } from 'lucide-react';
import { useListHistory } from '../hooks/useListHistory';

interface HomePageProps {
  onStartForm: () => void;
  onViewHistory?: () => void;
  onNavigateToCatalog?: () => void;
}

export default function HomePage({ onStartForm, onViewHistory, onNavigateToCatalog }: HomePageProps) {
  const { savedLists } = useListHistory();

  const features = [
    {
      icon: Sparkles,
      title: 'Inteligencia Artificial',
      description: 'Recomendaciones personalizadas basadas en tus preferencias y presupuesto',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Clock,
      title: 'Ahorra Tiempo',
      description: 'Genera menús y listas de compra automáticamente en segundos',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: PiggyBank,
      title: 'Optimiza tu Presupuesto',
      description: 'Encuentra las mejores opciones dentro de tu presupuesto establecido',
      color: 'from-purple-500 to-purple-600',
    },
  ];

  const steps = [
    { number: 1, title: 'Responde Preguntas', desc: 'Cuéntanos sobre tu familia, preferencias y presupuesto' },
    { number: 2, title: 'IA Analiza', desc: 'Nuestra inteligencia artificial procesa tus preferencias' },
    { number: 3, title: 'Genera Menús', desc: 'Crea menús personalizados y lista de compra optimizada' },
    { number: 4, title: 'Listo para Comprar', desc: 'Descarga tu lista o compra directamente' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section - 2 Columnas en Desktop */}
      <section className="container mx-auto px-4 pt-16 md:pt-24 pb-12 md:pb-16">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Columna Izquierda - Contenido */}
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-3 md:space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Planifica tu compra de forma{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  inteligente
                </span>
              </h1>
              <p className="text-base md:text-xl text-gray-600 dark:text-gray-300">
                Responde unas pocas preguntas y deja que nuestra IA genere menús personalizados
                y listas de compra optimizadas para tu familia y presupuesto.
              </p>
            </div>

            {/* Botones CTA Mejorados */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <button
                onClick={onStartForm}
                className="group relative inline-flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-base md:text-lg">Generar con IA</span>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onNavigateToCatalog}
                className="group inline-flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 text-gray-900 dark:text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Package className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-base md:text-lg">Explorar Catálogo</span>
              </button>
            </div>

            {/* Botón Historial */}
            {savedLists.length > 0 && onViewHistory && (
              <button
                onClick={onViewHistory}
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                <History className="w-5 h-5" />
                <span>Ver mis {savedLists.length} {savedLists.length === 1 ? 'lista guardada' : 'listas guardadas'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Columna Derecha - Visual */}
          <div className="hidden lg:block relative">
            <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 shadow-2xl">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 bg-white/20 rounded-lg h-4"></div>
                </div>
                <div className="space-y-2">
                  <div className="bg-white/20 rounded-lg h-3 w-3/4"></div>
                  <div className="bg-white/20 rounded-lg h-3 w-1/2"></div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <div className="bg-white/20 rounded-lg h-20"></div>
                  <div className="bg-white/20 rounded-lg h-20"></div>
                </div>
              </div>

              {/* Elementos decorativos */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full blur-2xl opacity-50"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-pink-400 rounded-full blur-2xl opacity-50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Grid Mejorado */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
            >
              {/* Gradiente de fondo al hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`}></div>

              <div className="relative">
                <div className={`w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-lg transform group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works Section - Diseño Horizontal */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-8 lg:p-12 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white text-center mb-8 md:mb-12">
            ¿Cómo funciona?
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center group">
                {/* Línea conectora */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 opacity-30"></div>
                )}

                {/* Número del paso */}
                <div className="relative inline-flex items-center justify-center w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full text-white font-bold text-xl md:text-3xl mx-auto mb-3 md:mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  {step.number}
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-full transition-opacity"></div>
                </div>

                <h3 className="font-bold text-sm md:text-lg text-gray-900 dark:text-white mb-1 md:mb-2">
                  {step.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Final */}
          <div className="text-center mt-8 md:mt-12">
            <button
              onClick={onStartForm}
              className="inline-flex items-center gap-2 md:gap-3 px-8 md:px-10 py-4 md:py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-base md:text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
            >
              <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
              <span>Comenzar ahora</span>
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-3 gap-4 md:gap-8 text-center">
          <div className="space-y-1 md:space-y-2">
            <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              4,429
            </div>
            <div className="text-xs md:text-base text-gray-600 dark:text-gray-400 font-medium">
              Productos disponibles
            </div>
          </div>
          <div className="space-y-1 md:space-y-2">
            <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              IA
            </div>
            <div className="text-xs md:text-base text-gray-600 dark:text-gray-400 font-medium">
              Recomendaciones inteligentes
            </div>
          </div>
          <div className="space-y-1 md:space-y-2">
            <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              24/7
            </div>
            <div className="text-xs md:text-base text-gray-600 dark:text-gray-400 font-medium">
              Disponible cuando quieras
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
