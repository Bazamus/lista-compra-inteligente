import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  // Mostrar loader mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-700">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario, redirigir a login
  if (!user) {
    // Guardar la ruta intentada para redirigir después del login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Si requiere admin y no es admin, mostrar acceso denegado
  if (requireAdmin && profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-red-600 mb-3">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 mb-6">
            No tienes permisos de administrador para acceder a esta página.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Usuario: <span className="font-medium">{user.email}</span>
            </p>
            <p className="text-sm text-gray-500">
              Rol: <span className="font-medium">{profile?.role || 'user'}</span>
            </p>
          </div>
          <div className="mt-6">
            <a
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver al Inicio
            </a>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
