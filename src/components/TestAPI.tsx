import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Producto, Categoria } from '../lib/api';

const TestAPI: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar categorías al montar el componente
  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.categorias.obtenerTodas();
      setCategorias(response.categorias);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const searchProductos = async () => {
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const response = await api.productos.obtener({
        search: searchTerm,
        limit: 10
      });
      setProductos(response.productos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const loadProductosByCategoria = async (categoria: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.productos.obtener({
        categoria: categoria,
        limit: 10
      });
      setProductos(response.productos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test de API Backend</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          Cargando...
        </div>
      )}

      {/* Test de Categorías */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Categorías Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categorias.map((categoria) => (
            <div
              key={categoria.id_categoria}
              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => loadProductosByCategoria(categoria.nombre_categoria)}
            >
              <h3 className="font-medium">{categoria.nombre_categoria}</h3>
              {categoria.total_productos && (
                <p className="text-sm text-gray-600">
                  {categoria.total_productos} productos
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Test de Búsqueda */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Búsqueda de Productos</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar productos..."
            className="flex-1 px-3 py-2 border rounded-md"
            onKeyPress={(e) => e.key === 'Enter' && searchProductos()}
          />
          <button
            onClick={searchProductos}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Resultados de Productos */}
      {productos.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Productos Encontrados ({productos.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productos.map((producto) => (
              <div key={producto.id_producto} className="border rounded-lg p-4">
                <div className="flex gap-4">
                  {producto.imagen_url && (
                    <img
                      src={producto.imagen_url}
                      alt={producto.nombre_producto}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{producto.nombre_producto}</h3>
                    <p className="text-xs text-gray-600">
                      {producto.subcategorias.categorias.nombre_categoria} → {producto.subcategorias.nombre_subcategoria}
                    </p>
                    <p className="text-sm font-semibold text-green-600">
                      €{producto.precio_por_unidad} / {producto.unidad_medida}
                    </p>
                    <p className="text-xs text-gray-500">
                      {producto.formato_venta} - €{producto.precio_formato_venta}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado de conexión */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Estado de la API:</h3>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`}></div>
          <span className="text-sm">
            {error ? 'Error de conexión' : 'Conectado correctamente'}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          URL API: {import.meta.env.VITE_API_BASE_URL || '/api'}
        </p>
      </div>
    </div>
  );
};

export default TestAPI;