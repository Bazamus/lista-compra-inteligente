import { useState } from 'react'
import { AdminLayout } from '../layout/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Select } from '../../../components/ui/Select'
import { Database, Table as TableIcon, RefreshCw } from 'lucide-react'

const TABLES = [
  { value: 'profiles', label: 'Perfiles de Usuario' },
  { value: 'listas_compra', label: 'Listas de Compra' },
  { value: 'items_lista', label: 'Items de Listas' },
  { value: 'productos', label: 'Productos' },
  { value: 'categorias', label: 'Categorías' },
  { value: 'subcategorias', label: 'Subcategorías' },
]

export default function DatabaseManagement() {
  const [selectedTable, setSelectedTable] = useState('profiles')

  const tableInfo = {
    profiles: {
      description: 'Perfiles de usuarios registrados',
      columns: ['id', 'email', 'role', 'full_name', 'created_at'],
      totalRecords: '1',
    },
    listas_compra: {
      description: 'Listas de compra generadas por usuarios',
      columns: ['id_lista', 'nombre_lista', 'user_id', 'presupuesto_total', 'created_at'],
      totalRecords: '20',
    },
    items_lista: {
      description: 'Productos incluidos en cada lista',
      columns: ['id_item', 'id_lista', 'id_producto', 'cantidad', 'precio_unitario'],
      totalRecords: '~200',
    },
    productos: {
      description: 'Catálogo completo de productos de Mercadona',
      columns: ['id_producto', 'nombre', 'precio', 'categoria', 'subcategoria'],
      totalRecords: '4,429',
    },
    categorias: {
      description: 'Categorías principales de productos',
      columns: ['id_categoria', 'nombre', 'descripcion'],
      totalRecords: '~20',
    },
    subcategorias: {
      description: 'Subcategorías de productos',
      columns: ['id_subcategoria', 'id_categoria', 'nombre'],
      totalRecords: '~100',
    },
  }

  const currentTable = tableInfo[selectedTable as keyof typeof tableInfo]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Explorador de Base de Datos
          </h1>
          <p className="text-gray-600 mt-1">
            Visualiza las tablas y estructura de la base de datos
          </p>
        </div>

        {/* Selector de tabla */}
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <Select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              label="Seleccionar Tabla"
            >
              {TABLES.map((table) => (
                <option key={table.value} value={table.value}>
                  {table.label}
                </option>
              ))}
            </Select>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mt-6">
            <RefreshCw className="h-4 w-4" />
            <span>Actualizar</span>
          </button>
        </div>

        {/* Información de la tabla */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Database className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Tabla</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">{selectedTable}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TableIcon className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Total Registros</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {currentTable.totalRecords}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TableIcon className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Columnas</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {currentTable.columns.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detalles de la tabla */}
        <Card>
          <CardHeader>
            <CardTitle>Estructura de la Tabla: {selectedTable}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{currentTable.description}</p>

            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 mb-2">Columnas:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {currentTable.columns.map((column, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <code className="text-sm font-mono text-gray-900">{column}</code>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Para ver y editar los datos de las tablas, accede
                directamente al{' '}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium hover:text-blue-900"
                >
                  Dashboard de Supabase
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Acciones rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones de Base de Datos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="https://supabase.com/dashboard/project/hnnjfqokgbhnydkfuhxy/editor"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all text-center font-medium"
            >
              Abrir Table Editor en Supabase
            </a>
            <a
              href="https://supabase.com/dashboard/project/hnnjfqokgbhnydkfuhxy/sql"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-center font-medium text-gray-900"
            >
              Abrir SQL Editor en Supabase
            </a>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
