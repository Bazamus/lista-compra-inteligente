import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Header from './components/common/Header';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import HistoryPage from './pages/HistoryPage';
import CatalogPage from './pages/CatalogPage';
import ManualListResults from './pages/ManualListResults';
import TestAPI from './components/TestAPI';
import ConversationalForm from './components/forms/ConversationalForm';
import type { FormData } from './types/form.types';
import type { SavedList } from './hooks/useListHistory';

function AppContent() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'home' | 'ai-form' | 'catalog' | 'results' | 'history'>('home');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [resultadoIA, setResultadoIA] = useState<any>(null);

  // Para desarrollo: mostrar TestAPI
  const showTestAPI = window.location.search.includes('test=api');

  const handleNavigate = (view: string) => {
    switch (view) {
      case 'home':
        navigate('/');
        setCurrentView('home');
        break;
      case 'ai-form':
        navigate('/ai-form');
        setCurrentView('ai-form');
        break;
      case 'catalog':
        navigate('/catalog');
        setCurrentView('catalog');
        break;
      case 'history':
        navigate('/history');
        setCurrentView('history');
        break;
      default:
        navigate('/');
        setCurrentView('home');
    }
  };

  const handleStartForm = () => {
    navigate('/ai-form');
    setCurrentView('ai-form');
  };

  const handleFormSubmit = (data: FormData, resultado?: any) => {
    console.log('📋 Datos del formulario:', data);
    console.log('🤖 Resultado de IA:', resultado);

    setFormData(data);
    if (resultado) {
      setResultadoIA(resultado);
    }
    navigate('/results');
    setCurrentView('results');
  };

  const handleFormCancel = () => {
    navigate('/');
    setCurrentView('home');
  };

  const handleBackToHome = () => {
    navigate('/');
    setCurrentView('home');
    setFormData(null);
    setResultadoIA(null);
  };

  const handleViewHistory = () => {
    navigate('/history');
    setCurrentView('history');
  };

  const handleNavigateToCatalog = () => {
    navigate('/catalog');
    setCurrentView('catalog');
  };

  const handleViewList = (lista: SavedList) => {
    // Convertir SavedList a formato de resultado
    const resultado = {
      lista: {
        dias_duracion: lista.dias,
        num_personas: lista.personas,
        presupuesto_total: lista.presupuesto_estimado,
        nombre_lista: lista.nombre,
      },
      productos: lista.productos,
      menus: lista.menus,
      presupuesto_estimado: lista.presupuesto_estimado,
      recomendaciones: lista.recomendaciones,
    };
    setResultadoIA(resultado);
    navigate('/results');
    setCurrentView('results');
  };

  if (showTestAPI) {
    return <TestAPI />;
  }

  return (
    <>
      <Header
        onNavigate={handleNavigate}
        currentView={currentView}
      />
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              onStartForm={handleStartForm}
              onViewHistory={handleViewHistory}
              onNavigateToCatalog={handleNavigateToCatalog}
            />
          }
        />
        <Route
          path="/ai-form"
          element={
            <ConversationalForm
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              initialData={formData || undefined}
            />
          }
        />
        <Route
          path="/catalog"
          element={<CatalogPage />}
        />
        <Route
          path="/manual-results"
          element={<ManualListResults />}
        />
        <Route
          path="/results"
          element={
            resultadoIA ? (
              <ResultsPage
                resultado={resultadoIA}
                onBackToHome={handleBackToHome}
              />
            ) : (
              <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
                <div className="max-w-4xl mx-auto px-4 py-8 mt-20">
                  <div className="text-center space-y-6">
                    <div className="text-6xl">🎉</div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      ¡Lista generada exitosamente!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                      Tu lista personalizada está lista. Aquí se mostraría el resultado de la IA.
                    </p>
                    <button
                      onClick={handleBackToHome}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                      Volver al inicio
                    </button>
                  </div>
                </div>
              </div>
            )
          }
        />
        <Route
          path="/history"
          element={<HistoryPage onViewList={handleViewList} onBackToHome={handleBackToHome} />}
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <AppContent />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;