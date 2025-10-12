import { RegisterForm } from '../features/auth/components/RegisterForm'

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Logo o título de la app */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Crear Cuenta
          </h1>
          <p className="text-gray-600">
            Únete a Lista de Compra Inteligente
          </p>
        </div>

        <RegisterForm />

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
