import { useState } from 'react';
import { ShoppingCart, Menu, X, Home, Sparkles, Package, History, User, LogOut, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  onNavigate?: (view: 'home' | 'ai-form' | 'catalog' | 'history') => void;
  currentView?: string;
}

export default function Header({
  title = 'Lista Inteligente',
  onNavigate,
  currentView = 'home'
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'ai-form', label: 'Generar con IA', icon: Sparkles },
    { id: 'catalog', label: 'Explorar Productos', icon: Package },
    { id: 'history', label: 'Historial', icon: History },
  ];

  const handleNavClick = (viewId: string) => {
    if (onNavigate) {
      onNavigate(viewId as any);
    }
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    navigate('/');
  };

  const getInitials = (email: string) => {
    return email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14 lg:h-16">
          {/* Logo y título */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
              {title}
            </h1>
          </button>

          {/* Navegación Desktop - Horizontal SIN hamburguesa */}
          <div className="hidden lg:flex items-center space-x-2">
            <nav className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Área de autenticación */}
            <div className="ml-4 flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-4">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                      {getInitials(user?.email || '')}
                    </div>
                    <span className="text-sm">{user?.email?.split('@')[0]}</span>
                  </button>

                  {/* Dropdown menu */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user?.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Rol: {profile?.role || 'user'}
                          </p>
                        </div>

                        {profile?.role === 'admin' && (
                          <button
                            onClick={() => {
                              navigate('/admin/dashboard');
                              setUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Settings className="h-4 w-4" />
                            <span>Panel Admin</span>
                          </button>
                        )}

                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 rounded-xl font-medium text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="px-4 py-2 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all"
                  >
                    Registrarse
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Navegación Tablet - Pills horizontales */}
          <div className="hidden md:flex lg:hidden items-center gap-2">
            <nav className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </nav>

            {/* Auth buttons tablet */}
            {isAuthenticated ? (
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              >
                <User className="h-5 w-5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  <User className="h-5 w-5" />
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-medium"
                >
                  Registro
                </button>
              </>
            )}
          </div>

          {/* Botón menú SOLO móvil */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Menú"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil - SOLO en móvil */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            <nav className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Separador */}
              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

              {/* Auth buttons mobile */}
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user?.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Rol: {profile?.role || 'user'}
                    </p>
                  </div>

                  {profile?.role === 'admin' && (
                    <button
                      onClick={() => {
                        navigate('/admin/dashboard');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                    >
                      <Settings className="h-5 w-5" />
                      <span>Panel Admin</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    <User className="h-5 w-5" />
                    <span>Iniciar Sesión</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/register');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition-all"
                  >
                    <User className="h-5 w-5" />
                    <span>Registrarse</span>
                  </button>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
