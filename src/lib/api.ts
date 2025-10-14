import { supabase } from './supabase';

// ✅ NUEVO: Función helper para obtener headers de autenticación
export async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  return headers;
}

// ✅ NUEVO: Función para generar lista con IA (con autenticación)
export async function generarListaConIA(params: {
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
}) {
  const headers = await getAuthHeaders();
  
  const response = await fetch('/api/generar-lista', {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al generar lista');
  }
  
  return response.json();
}

// ✅ NUEVO: Función para obtener listas (con autenticación)
export async function obtenerListas(incluirItems: boolean = false) {
  const headers = await getAuthHeaders();
  
  const url = new URL('/api/listas', window.location.origin);
  if (incluirItems) {
    url.searchParams.set('incluir_items', 'true');
  }
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al obtener listas');
  }
  
  return response.json();
}

// ✅ NUEVO: Función para obtener lista específica (con autenticación)
export async function obtenerLista(listaId: string, incluirItems: boolean = false) {
  const headers = await getAuthHeaders();
  
  const url = new URL('/api/listas', window.location.origin);
  url.searchParams.set('lista_id', listaId);
  if (incluirItems) {
    url.searchParams.set('incluir_items', 'true');
  }
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al obtener lista');
  }
  
  return response.json();
}

// ✅ NUEVO: Función para crear lista manual (con autenticación)
export async function crearListaManual(listaData: {
  nombre_lista: string;
  descripcion?: string;
  num_personas: number;
  dias_duracion: number;
  presupuesto_total: number;
  tipo_comidas?: any;
  productos_basicos?: any;
  productos_adicionales?: any;
}) {
  const headers = await getAuthHeaders();
  
  const response = await fetch('/api/listas', {
    method: 'POST',
    headers,
    body: JSON.stringify(listaData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al crear lista');
  }
  
  return response.json();
}

// ✅ NUEVO: Función para actualizar lista (con autenticación)
export async function actualizarLista(listaId: string, updates: any) {
  const headers = await getAuthHeaders();
  
  const url = new URL('/api/listas', window.location.origin);
  url.searchParams.set('lista_id', listaId);
  
  const response = await fetch(url.toString(), {
    method: 'PUT',
    headers,
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al actualizar lista');
  }
  
  return response.json();
}

// ✅ NUEVO: Función para eliminar lista (con autenticación)
export async function eliminarLista(listaId: string) {
  const headers = await getAuthHeaders();
  
  const url = new URL('/api/listas', window.location.origin);
  url.searchParams.set('lista_id', listaId);
  
  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al eliminar lista');
  }
  
  return response.json();
}