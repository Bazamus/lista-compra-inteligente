import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'

export function DemoBanner() {
  const navigate = useNavigate()

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          {/* Icono y mensaje */}
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0 mt-0.5">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-yellow-800">
                Modo Demo Activo
              </p>
              <p className="text-xs text-yellow-700 mt-0.5">
                Tus listas se guardan temporalmente. Regístrate para acceso permanente desde cualquier dispositivo.
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-yellow-700 bg-white border border-yellow-300 rounded-lg hover:bg-yellow-50 transition-colors"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => navigate('/register')}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all shadow-sm hover:shadow-md"
            >
              Registrarse Gratis
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

