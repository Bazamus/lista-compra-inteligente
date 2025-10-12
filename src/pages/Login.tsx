import { LoginForm } from '../features/auth/components/LoginForm'

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo o título de la app */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Lista de Compra Inteligente
          </h1>
          <p className="text-gray-600">
            Planifica tus compras con ayuda de IA
          </p>
        </div>

        <LoginForm />

        {/* Link para volver sin autenticación */}
        <div className="text-center">
          <a
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Continuar sin cuenta (modo demo)
          </a>
        </div>
      </div>
    </div>
  )
}
