import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Lock, Sparkles } from 'lucide-react'

interface PremiumGateProps {
  children: ReactNode
  feature: string
}

export function PremiumGate({ children, feature }: PremiumGateProps) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Si está autenticado, mostrar contenido sin restricciones
  if (isAuthenticated) {
    return <>{children}</>
  }

  // Si NO está autenticado, mostrar overlay premium
  return (
    <div className="relative">
      {/* Contenido con blur */}
      <div className="filter blur-sm pointer-events-none select-none">
        {children}
      </div>

      {/* Overlay Premium */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
              {/* Icono */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>

              {/* Título */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Feature Premium
              </h3>

              {/* Descripción */}
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                <span className="font-semibold text-gray-900 dark:text-white">{feature}</span> está disponible solo para usuarios registrados
              </p>

              {/* Beneficios */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2 text-left">
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Al registrarte obtendrás:
                    </p>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                      <li>✓ Listas ilimitadas guardadas en la nube</li>
                      <li>✓ Acceso desde cualquier dispositivo</li>
                      <li>✓ Exportación a PDF y Excel</li>
                      <li>✓ Historial completo de compras</li>
                      <li>✓ Compartir listas con otros usuarios</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/register')}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Registrarse Gratis
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Ya tengo cuenta
                </button>
              </div>

              {/* Nota */}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                El registro es 100% gratuito y solo toma 30 segundos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

