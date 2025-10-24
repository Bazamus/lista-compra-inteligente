// Tipos para el sistema de carrito de compra manual

export interface CartProduct {
  id_producto: number;
  nombre_producto: string;
  precio_por_unidad: number;
  unidad_medida: string;
  cantidad_unidad_medida: number;
  formato_venta: string;
  precio_formato_venta: number;
  imagen_url?: string;
  url_enlace?: string;
  nombre_categoria: string;
  nombre_subcategoria: string;
}

export interface CartItem {
  product: CartProduct;
  quantity: number; // Cantidad de unidades (ej: 2 botellas)
  nota?: string; // Nota opcional del usuario (ej: "comprar ecológico", "sin lactosa")
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface ProductFilters {
  categoriaId?: number;
  subcategoriaId?: number;
  precioMin?: number;
  precioMax?: number;
  searchTerm?: string;
  ordenarPor?: 'precio_asc' | 'precio_desc' | 'nombre_asc' | 'nombre_desc';
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ProductsResponse {
  products: CartProduct[];
  pagination: PaginationInfo;
}

export interface Category {
  id_categoria: number;
  nombre_categoria: string;
  subcategorias?: Subcategory[];
}

export interface Subcategory {
  id_subcategoria: number;
  id_categoria: number;
  nombre_subcategoria: string;
}
