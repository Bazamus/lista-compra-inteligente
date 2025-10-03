// Configuración de API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Interfaces para tipos de datos
export interface Producto {
  id_producto: number;
  nombre_producto: string;
  formato_venta: string;
  precio_formato_venta: number;
  unidad_medida: string;
  precio_por_unidad: number;
  cantidad_unidad_medida: number;
  url_enlace: string;
  imagen_url: string;
  subcategorias: {
    id_subcategoria: number;
    nombre_subcategoria: string;
    categorias: {
      id_categoria: number;
      nombre_categoria: string;
    };
  };
}

export interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
  descripcion?: string;
  total_productos?: number;
  subcategorias?: Subcategoria[];
}

export interface Subcategoria {
  id_subcategoria: number;
  nombre_subcategoria: string;
  categorias: {
    id_categoria: number;
    nombre_categoria: string;
  };
}

export interface ListaCompra {
  id_lista: string;
  nombre_lista: string;
  descripcion?: string;
  num_personas: number;
  dias_duracion: number;
  presupuesto_total: number;
  presupuesto_usado: number;
  tipo_comidas: {
    desayuno: string[];
    comida: string[];
    cena: string[];
  };
  productos_basicos: string[];
  productos_adicionales: string[];
  completada: boolean;
  created_at: string;
  updated_at: string;
}

export interface ItemLista {
  id_item: string;
  id_lista: string;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  comprado: boolean;
  productos?: Producto;
}

export interface ParametrosGeneracion {
  numPersonas: number;
  diasDuracion: number;
  presupuesto: number;
  tipoComidas: {
    desayuno: string[];
    comida: string[];
    cena: string[];
  };
  alimentosBasicos: string[];
  productosAdicionales: string[];
  restricciones?: string[];
  preferencias?: string[];
}

// Función helper para hacer requests
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en API request (${endpoint}):`, error);
    throw error;
  }
}

// API de Productos
export const productosApi = {
  // Obtener productos con filtros
  obtener: async (filtros: {
    categoria?: string;
    subcategoria?: string;
    search?: string;
    precio_min?: number;
    precio_max?: number;
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    productos: Producto[];
    pagination: {
      total: number;
      offset: number;
      limit: number;
      hasNext: boolean;
    };
  }> => {
    const searchParams = new URLSearchParams();

    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return apiRequest(`/productos${queryString ? `?${queryString}` : ''}`);
  },

  // Buscar productos
  buscar: async (termino: string, limit = 20): Promise<Producto[]> => {
    const response = await productosApi.obtener({ search: termino, limit });
    return response.productos;
  },
};

// API de Categorías
export const categoriasApi = {
  // Obtener todas las categorías
  obtenerTodas: async (): Promise<{ categorias: Categoria[] }> => {
    return apiRequest('/categorias');
  },

  // Obtener subcategorías de una categoría
  obtenerSubcategorias: async (categoriaId: number): Promise<{ subcategorias: Subcategoria[] }> => {
    return apiRequest(`/categorias?categoria_id=${categoriaId}`);
  },
};

// API de Listas de Compra
export const listasApi = {
  // Obtener todas las listas
  obtenerTodas: async (): Promise<{ listas: ListaCompra[] }> => {
    return apiRequest('/listas');
  },

  // Obtener lista específica
  obtenerPorId: async (listaId: string, incluirItems = false): Promise<{
    lista: ListaCompra;
    items?: ItemLista[];
  }> => {
    return apiRequest(`/listas?lista_id=${listaId}&incluir_items=${incluirItems}`);
  },

  // Crear nueva lista
  crear: async (datos: Partial<ListaCompra>): Promise<{ lista: ListaCompra }> => {
    return apiRequest('/listas', {
      method: 'POST',
      body: JSON.stringify(datos),
    });
  },

  // Actualizar lista
  actualizar: async (listaId: string, datos: Partial<ListaCompra>): Promise<{ lista: ListaCompra }> => {
    return apiRequest(`/listas?lista_id=${listaId}`, {
      method: 'PUT',
      body: JSON.stringify(datos),
    });
  },

  // Eliminar lista
  eliminar: async (listaId: string): Promise<{ message: string }> => {
    return apiRequest(`/listas?lista_id=${listaId}`, {
      method: 'DELETE',
    });
  },

  // Generar lista con IA
  generarConIA: async (parametros: ParametrosGeneracion): Promise<{
    success: boolean;
    lista: ListaCompra;
    productos: ItemLista[];
    menus: Record<string, any>;
    presupuesto_estimado: number;
    recomendaciones: string[];
  }> => {
    return apiRequest('/generar-lista', {
      method: 'POST',
      body: JSON.stringify(parametros),
    });
  },
};

// Exportar todo junto
export const api = {
  productos: productosApi,
  categorias: categoriasApi,
  listas: listasApi,
};