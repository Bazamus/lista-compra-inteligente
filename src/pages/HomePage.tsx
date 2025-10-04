import { ArrowRight, Sparkles, Clock, PiggyBank, History } from 'lucide-react';
import Header from '../components/common/Header';
import Button from '../components/common/Button';
import { useListHistory } from '../hooks/useListHistory';

interface HomePageProps {
  onStartForm: () => void;
  onViewHistory?: () => void;
}

export default function HomePage({ onStartForm, onViewHistory }: HomePageProps) {
  const { savedLists } = useListHistory();

  const features = [
    {
      icon: Sparkles,
      title: 'Inteligencia Artificial',
      description: 'Recomendaciones personalizadas basadas en tus preferencias y presupuesto',
    },
    {
      icon: Clock,
      title: 'Ahorra Tiempo',
      description: 'Genera menús y listas de compra automáticamente en segundos',
    },
    {
      icon: PiggyBank,
      title: 'Optimiza tu Presupuesto',
      description: 'Encuentra las mejores opciones dentro de tu presupuesto establecido',
    },
  ];

  const handleStartPlanning = () => {
    onStartForm();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Planifica tu compra de forma
            <span className="text-primary-600 ml-2">inteligente</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Responde unas pocas preguntas y deja que nuestra IA genere menús personalizados
            y listas de compra optimizadas para tu familia y presupuesto.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="primary"
              size="large"
              icon={ArrowRight}
              onClick={handleStartPlanning}
              className="text-lg px-8 py-4"
            >
              Comenzar Planificación
            </Button>

            {savedLists.length > 0 && onViewHistory && (
              <Button
                variant="secondary"
                size="large"
                icon={History}
                onClick={onViewHistory}
                className="text-lg px-8 py-4"
              >
                Mis Listas ({savedLists.length})
              </Button>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="card text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* How it Works Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            ¿Cómo funciona?
          </h3>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Responde Preguntas
              </h4>
              <p className="text-sm text-gray-600">
                Cuéntanos sobre tu familia, preferencias y presupuesto
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                IA Analiza
              </h4>
              <p className="text-sm text-gray-600">
                Nuestra inteligencia artificial procesa tus preferencias
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Genera Menú
              </h4>
              <p className="text-sm text-gray-600">
                Crea menús personalizados y listas de compra optimizadas
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                4
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Listo para Comprar
              </h4>
              <p className="text-sm text-gray-600">
                Exporta o comparte tu lista final de compra
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}