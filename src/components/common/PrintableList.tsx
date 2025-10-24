import { forwardRef } from 'react';

interface PrintableListProps {
  lista: {
    nombre_lista?: string;
    num_personas?: number;
    dias_duracion?: number;
    presupuesto_total?: number;
  };
  productos: Array<{
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    categoria: string;
    nota?: string;
  }>;
  menus?: Record<string, any>;
  includeMenus?: boolean;
  includePrices?: boolean;
}

/**
 * Componente optimizado para impresión
 * - Layout limpio sin colores pesados
 * - Checkboxes para marcar productos
 * - Agrupado por categorías
 * - Footer con total
 */
export const PrintableList = forwardRef<HTMLDivElement, PrintableListProps>(
  ({ lista, productos, menus, includeMenus = true, includePrices = true }, ref) => {
    // Agrupar productos por categoría
    const groupedProducts = productos.reduce((acc, producto) => {
      const categoria = producto.categoria || 'Sin categoría';
      if (!acc[categoria]) {
        acc[categoria] = [];
      }
      acc[categoria].push(producto);
      return acc;
    }, {} as Record<string, typeof productos>);

    const total = productos.reduce(
      (sum, p) => sum + p.cantidad * p.precio_unitario,
      0
    );

    return (
      <div ref={ref} className="p-8 bg-white">
        {/* Header */}
        <div className="mb-8 pb-4 border-b-2 border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {lista.nombre_lista || 'Lista de Compra'}
            </h1>
            <div className="text-right">
              <p className="text-sm text-gray-600">ListaGPT</p>
              <p className="text-xs text-gray-500">
                {new Date().toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>

          <div className="flex gap-6 text-sm text-gray-700">
            {lista.num_personas && (
              <div>
                <span className="font-semibold">Personas:</span> {lista.num_personas}
              </div>
            )}
            {lista.dias_duracion && (
              <div>
                <span className="font-semibold">Duración:</span> {lista.dias_duracion} días
              </div>
            )}
            {includePrices && (
              <div>
                <span className="font-semibold">Presupuesto:</span> {total.toFixed(2)}€
              </div>
            )}
          </div>
        </div>

        {/* Productos agrupados por categoría */}
        <div className="space-y-6 mb-8">
          {Object.entries(groupedProducts).map(([categoria, items]) => (
            <div key={categoria} className="break-inside-avoid">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">
                {categoria} ({items.length})
              </h2>
              <div className="space-y-2">
                {items.map((producto, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 py-2 border-b border-gray-100"
                  >
                    {/* Checkbox para imprimir */}
                    <div className="w-5 h-5 border-2 border-gray-400 rounded flex-shrink-0" />
                    
                    {/* Nombre, cantidad y nota */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {producto.nombre}
                      </p>
                      <p className="text-xs text-gray-600">
                        Cantidad: {producto.cantidad}
                      </p>
                      {producto.nota && (
                        <p className="text-xs text-blue-700 italic mt-1">
                          📝 {producto.nota}
                        </p>
                      )}
                    </div>

                    {/* Precio */}
                    {includePrices && (
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {(producto.cantidad * producto.precio_unitario).toFixed(2)}€
                        </p>
                        <p className="text-xs text-gray-500">
                          {producto.precio_unitario.toFixed(2)}€/ud
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Menús (opcional) */}
        {includeMenus && menus && Object.keys(menus).length > 0 && (
          <div className="mt-8 pt-6 border-t-2 border-gray-800 break-inside-avoid">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Menú Semanal</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(menus).map(([dia, menu]: [string, any]) => (
                <div key={dia} className="text-sm">
                  <p className="font-semibold text-gray-800 mb-1">
                    {dia.replace('dia_', 'Día ')}
                  </p>
                  {menu.comida && (
                    <p className="text-gray-600">
                      <span className="font-medium">Comida:</span> {menu.comida}
                    </p>
                  )}
                  {menu.cena && (
                    <p className="text-gray-600">
                      <span className="font-medium">Cena:</span> {menu.cena}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer con total */}
        {includePrices && (
          <div className="mt-8 pt-6 border-t-2 border-gray-800">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Total de productos: {productos.length}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total estimado:</p>
                <p className="text-2xl font-bold text-gray-900">{total.toFixed(2)}€</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
          <p>Lista generada con ListaGPT - www.listagpt.com</p>
        </div>
      </div>
    );
  }
);

PrintableList.displayName = 'PrintableList';

