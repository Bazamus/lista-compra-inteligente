import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Input } from '../../../components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirigir a la página desde donde vino, o a home por defecto
  const from = (location.state as any)?.from?.pathname || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validación básica
    if (!email || !password) {
      setError('Por favor, completa todos los campos')
      setLoading(false)
      return
    }

    const { error: signInError } = await signIn(email, password)

    if (signInError) {
      console.error('Error al iniciar sesión:', signInError)
      setError(
        signInError.message === 'Invalid login credentials'
          ? 'Credenciales inválidas. Verifica tu email y contraseña.'
          : signInError.message
      )
      setLoading(false)
    } else {
      console.log('✅ Login exitoso, esperando carga de perfil...')

      // Esperar un momento para que se cargue el perfil
      await new Promise(resolve => setTimeout(resolve, 500))

      // Redirigir a la página desde donde vino o al dashboard
      console.log('🔄 Redirigiendo a:', from)
      navigate(from, { replace: true })
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Iniciar Sesión</CardTitle>
        <CardDescription>
          Ingresa tus credenciales para acceder a tu cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
            required
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
            required
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <a
              href="/register"
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Regístrate aquí
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
