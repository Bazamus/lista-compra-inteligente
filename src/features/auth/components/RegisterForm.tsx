import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Input } from '../../../components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card'

export function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validación básica
    if (!email || !password || !confirmPassword) {
      setError('Por favor, completa todos los campos')
      setLoading(false)
      return
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Por favor, ingresa un email válido')
      setLoading(false)
      return
    }

    // Validar contraseñas coinciden
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    const { error: signUpError } = await signUp(email, password)

    if (signUpError) {
      console.error('Error al registrarse:', signUpError)
      setError(
        signUpError.message === 'User already registered'
          ? 'Este email ya está registrado'
          : signUpError.message
      )
      setLoading(false)
    } else {
      setSuccess(true)
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="py-10">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-green-600 mb-2">
              ¡Registro Exitoso!
            </h3>
            <p className="text-gray-600 mb-4">
              Tu cuenta ha sido creada correctamente.
            </p>
            <p className="text-sm text-gray-500">
              Redirigiendo a iniciar sesión...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Crear Cuenta</CardTitle>
        <CardDescription>
          Regístrate para guardar tus listas y acceder desde cualquier dispositivo
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
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="new-password"
            required
          />

          <Input
            label="Confirmar Contraseña"
            type="password"
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            autoComplete="new-password"
            required
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              Al registrarte, podrás:
            </p>
            <ul className="text-xs text-blue-700 mt-1 space-y-1 list-disc list-inside">
              <li>Guardar tus listas permanentemente</li>
              <li>Acceder desde cualquier dispositivo</li>
              <li>Exportar a PDF/Excel</li>
              <li>Ver tu historial completo</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Inicia sesión aquí
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
