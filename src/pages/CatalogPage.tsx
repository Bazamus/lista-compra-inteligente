import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/catalog/ProductCard';
import ProductFilters from '../components/catalog/ProductFilters';
import CartWidget from '../components/catalog/CartWidget';
import CartModal from '../components/catalog/CartModal';
import ProductDetailModal from '../components/catalog/ProductDetailModal';
import { useCart } from '../hooks/useCart';
import { useProducts } from '../hooks/useProducts';
import type { CartProduct, ProductFilters as IProductFilters } from '../types/cart.types';

const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    addProduct,
    updateQuantity,
    removeProduct,
    incrementQuantity,
    decrementQuantity,
    getProductQuantity,
  } = useCart();

  const {
    products,
    categories,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    fetchProducts,
    changePage,
  } = useProducts();

  const [filters, setFilters] = useState<IProductFilters>({});
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CartProduct | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Cargar productos iniciales
  useEffect(() => {
    fetchProducts({}, 1);
  }, []);

  const handleFiltersChange = (newFilters: IProductFilters) => {
    setFilters(newFilters);
    fetchProducts(newFilters, 1);
  };

  const handleSearch = (searchTerm: string) => {
    const newFilters = { ...filters, searchTerm };
    setFilters(newFilters);
    fetchProducts(newFilters, 1);
  };

  const handleShowDetail = (product: CartProduct) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const handleGenerateList = (listName: string) => {
    // Navegar a la página de resultados con la lista manual
    navigate('/manual-results', {
      state: {
        listName,
        cart,
      },
    });
    setIsCartModalOpen(false);
  };

  const handlePageChange = (page: number) => {
    changePage(page, filters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Catálogo de Productos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explora {totalItems.toLocaleString()} productos de Mercadona y crea tu lista personalizada
          </p>
        </div>

        {/* Layout: Sidebar Filters (Desktop) + Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar con filtros - Sticky en Desktop */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <ProductFilters
                categories={categories}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onSearch={handleSearch}
              />
            </div>
          </aside>

          {/* Área principal de contenido */}
          <main className="flex-1 min-w-0">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Cargando productos...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Intenta ajustar los filtros de búsqueda
                </p>
              </div>
            )}

            {/* Productos Grid */}
            {!loading && !error && products.length > 0 && (
              <>
                {/* Info bar de resultados */}
                <div className="mb-6 flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    Mostrando <span className="font-semibold text-gray-900 dark:text-white">{products.length}</span> productos
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Página {currentPage} de {totalPages}
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPage}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mb-8"
                  >
                    {products.map((product) => (
                      <ProductCard
                        key={product.id_producto}
                        product={product}
                        quantity={getProductQuantity(product.id_producto)}
                        onAddToCart={addProduct}
                        onIncrement={incrementQuantity}
                        onDecrement={decrementQuantity}
                        onShowDetail={handleShowDetail}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>

                {/* Paginación mejorada */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pb-4">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-semibold"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span className="hidden sm:inline">Anterior</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl font-bold transition-all shadow-sm ${
                              currentPage === pageNum
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110'
                                : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-500'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-semibold"
                    >
                      <span className="hidden sm:inline">Siguiente</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Info de paginación */}
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Mostrando {(currentPage - 1) * 24 + 1} - {Math.min(currentPage * 24, totalItems)} de{' '}
                  {totalItems.toLocaleString()} productos
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Cart Widget */}
      <CartWidget
        totalItems={cart.totalItems}
        totalPrice={cart.totalPrice}
        onViewCart={() => setIsCartModalOpen(true)}
      />

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveProduct={removeProduct}
        onGenerateList={handleGenerateList}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        currentQuantity={selectedProduct ? getProductQuantity(selectedProduct.id_producto) : 0}
        onAddToCart={addProduct}
        onUpdateQuantity={updateQuantity}
      />
    </div>
  );
};

export default CatalogPage;
