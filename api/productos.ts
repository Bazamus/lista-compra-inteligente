import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hnnjfqokgbhnydkfuhxy.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ NUEVO: Función helper para extraer user_id del token
async function getUserIdFromRequest(req: VercelRequest): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return null;
    }
    return user.id;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

// Función para normalizar texto: eliminar acentos y convertir a minúsculas
function normalizeText(text: string): string {
  return text
    .normalize('NFD') // Descomponer caracteres con acentos
    .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos
    .toLowerCase() // Convertir a minúsculas
    .trim();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method, query } = req;

    switch (method) {
      case 'GET':
        return await handleGetProductos(req, res);
      default:
        res.setHeader('Allow', ['GET']);
        res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Error en API productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function handleGetProductos(req: VercelRequest, res: VercelResponse) {
  const {
    categoria,
    subcategoria,
    search,
    limit = '24',
    offset = '0',
    precio_min,
    precio_max
  } = req.query;

  try {
    // NUEVA LÓGICA: Cuando hay búsqueda, se prioriza sobre los filtros de categoría
    // Los otros filtros (precio) se aplican como refinamiento opcional

    let totalCount = 0;
    let productos: any[] = [];
    const offsetNum = parseInt(offset as string);
    const limitNum = parseInt(limit as string);

    if (search) {
      // MODO BÚSQUEDA: Buscar en TODOS los productos activos
      let query = supabase
        .from('productos')
        .select(`
          id_producto,
          nombre_producto,
          formato_venta,
          precio_formato_venta,
          unidad_medida,
          precio_por_unidad,
          cantidad_unidad_medida,
          url_enlace,
          imagen_url,
          subcategorias!inner(
            id_subcategoria,
            nombre_subcategoria,
            categorias!inner(
              id_categoria,
              nombre_categoria
            )
          )
        `)
        .eq('activo', true)
        .order('nombre_producto', { ascending: true })
        .range(0, 999); // Traemos hasta 1000 productos para búsqueda

      const { data: productosRaw, error } = await query;

      if (error) {
        console.error('Error Supabase:', error);
        return res.status(400).json({ error: error.message });
      }

      productos = productosRaw || [];

      // 1. Filtrar por búsqueda con normalización (sin acentos, case-insensitive)
      const searchNormalized = normalizeText(search as string);
      productos = productos.filter(p =>
        normalizeText(p.nombre_producto).includes(searchNormalized)
      );

      // 2. Aplicar filtros adicionales DESPUÉS de la búsqueda (opcional)
      if (categoria) {
        productos = productos.filter(p =>
          p.subcategorias?.categorias?.nombre_categoria === categoria
        );
      }

      if (subcategoria) {
        productos = productos.filter(p =>
          p.subcategorias?.nombre_subcategoria === subcategoria
        );
      }

      if (precio_min) {
        const precioMinNum = parseFloat(precio_min as string);
        productos = productos.filter(p => p.precio_por_unidad >= precioMinNum);
      }

      if (precio_max) {
        const precioMaxNum = parseFloat(precio_max as string);
        productos = productos.filter(p => p.precio_por_unidad <= precioMaxNum);
      }

      totalCount = productos.length;

      // 3. Aplicar paginación después del filtrado
      productos = productos.slice(offsetNum, offsetNum + limitNum);

    } else {
      // MODO SIN BÚSQUEDA: Aplicar filtros tradicionales con queries de BD

      // Query para contar
      let countQuery = supabase
        .from('productos')
        .select(`
          id_producto,
          subcategorias!inner(
            id_subcategoria,
            categorias!inner(
              id_categoria
            )
          )
        `, { count: 'exact', head: false })
        .eq('activo', true);

      // Query para obtener productos
      let query = supabase
        .from('productos')
        .select(`
          id_producto,
          nombre_producto,
          formato_venta,
          precio_formato_venta,
          unidad_medida,
          precio_por_unidad,
          cantidad_unidad_medida,
          url_enlace,
          imagen_url,
          subcategorias!inner(
            id_subcategoria,
            nombre_subcategoria,
            categorias!inner(
              id_categoria,
              nombre_categoria
            )
          )
        `)
        .eq('activo', true);

      // Aplicar filtros a ambas queries
      if (categoria) {
        query = query.eq('subcategorias.categorias.nombre_categoria', categoria);
        countQuery = countQuery.eq('subcategorias.categorias.nombre_categoria', categoria);
      }

      if (subcategoria) {
        query = query.eq('subcategorias.nombre_subcategoria', subcategoria);
        countQuery = countQuery.eq('subcategorias.nombre_subcategoria', subcategoria);
      }

      if (precio_min) {
        const precioMinNum = parseFloat(precio_min as string);
        query = query.gte('precio_por_unidad', precioMinNum);
        countQuery = countQuery.gte('precio_por_unidad', precioMinNum);
      }

      if (precio_max) {
        const precioMaxNum = parseFloat(precio_max as string);
        query = query.lte('precio_por_unidad', precioMaxNum);
        countQuery = countQuery.lte('precio_por_unidad', precioMaxNum);
      }

      // Ordenar y paginar
      query = query
        .order('nombre_producto', { ascending: true })
        .range(offsetNum, offsetNum + limitNum - 1);

      // Ejecutar ambas queries en paralelo
      const [{ data: productosRaw, error: productsError }, { count, error: countError }] = await Promise.all([
        query,
        countQuery
      ]);

      if (productsError) {
        console.error('Error Supabase productos:', productsError);
        return res.status(400).json({ error: productsError.message });
      }

      if (countError) {
        console.error('Error Supabase count:', countError);
        return res.status(400).json({ error: countError.message });
      }

      productos = productosRaw || [];
      totalCount = count || 0;
    }

    res.status(200).json({
      productos: productos,
      pagination: {
        total: totalCount,
        offset: offsetNum,
        limit: limitNum,
        hasNext: (offsetNum + limitNum) < totalCount
      }
    });

  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
}