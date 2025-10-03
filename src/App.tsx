import { useState } from 'react';
import { AppProvider } from './contexts/AppContext';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import TestAPI from './components/TestAPI';
import ConversationalForm from './components/forms/ConversationalForm';
import type { FormData } from './types/form.types';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'form' | 'results'>('home');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [resultadoIA, setResultadoIA] = useState<any>(null);

  // Para desarrollo: mostrar TestAPI
  const showTestAPI = window.location.search.includes('test=api');

  const handleStartForm = () => {
    setCurrentView('form');
  };

  const handleFormSubmit = (data: FormData, resultado?: any) => {
    console.log('📋 Datos del formulario:', data);
    console.log('🤖 Resultado de IA:', resultado);

    setFormData(data);
    if (resultado) {
      setResultadoIA(resultado);
    }
    setCurrentView('results');
  };

  const handleFormCancel = () => {
    setCurrentView('home');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setFormData(null);
    setResultadoIA(null);
  };

  const renderCurrentView = () => {
    if (showTestAPI) {
      return <TestAPI />;
    }

    switch (currentView) {
      case 'home':
        return <HomePage onStartForm={handleStartForm} />;
      
      case 'form':
        return (
          <ConversationalForm
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            initialData={formData || undefined}
          />
        );
      
      case 'results':
        // Si tenemos resultado de IA, mostrar ResultsPage
        if (resultadoIA) {
          return (
            <ResultsPage
              resultado={resultadoIA}
              onBackToHome={handleBackToHome}
            />
          );
        }

        // Fallback temporal si no hay resultado de IA
        return (
          <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
            <div className="max-w-4xl mx-auto px-4 py-8">
              <div className="text-center space-y-6">
                <div className="text-6xl">🎉</div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  ¡Lista generada exitosamente!
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Tu lista personalizada está lista. Aquí se mostraría el resultado de la IA.
                </p>

                {/* Mostrar datos del formulario */}
                {formData && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-left max-w-2xl mx-auto">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Resumen de tu solicitud:
                    </h3>
                    <pre className="text-sm text-gray-600 dark:text-gray-300 overflow-auto">
                      {JSON.stringify(formData, null, 2)}
                    </pre>
                  </div>
                )}

                <button
                  onClick={handleBackToHome}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return <HomePage onStartForm={handleStartForm} />;
    }
  };

  return (
    <AppProvider>
      <div className="App">
        {renderCurrentView()}
      </div>
    </AppProvider>
  );
}

export default App;