import { ShoppingCart, Menu } from 'lucide-react';

interface HeaderProps {
  title?: string;
}

export default function Header({ title = 'Lista Inteligente de Compra' }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-600 p-2 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              {title}
            </h1>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-600 hover:text-primary-600 font-medium">
              Inicio
            </a>
            <a href="#" className="text-gray-600 hover:text-primary-600 font-medium">
              Mis Listas
            </a>
            <a href="#" className="text-gray-600 hover:text-primary-600 font-medium">
              Historial
            </a>
          </nav>

          <div className="md:hidden">
            <button className="text-gray-600 hover:text-primary-600">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}