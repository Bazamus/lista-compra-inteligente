import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hnnjfqokgbhnydkfuhxy.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

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
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

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
    // Primero, construimos la query base para contar
    // Necesitamos incluir las relaciones para poder filtrar por ellas
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

    // Aplicar los mismos filtros a la query de conteo
    if (categoria) {
      countQuery = countQuery.eq('subcategorias.categorias.nombre_categoria', categoria);
    }

    if (subcategoria) {
      countQuery = countQuery.eq('subcategorias.nombre_subcategoria', subcategoria);
    }

    if (precio_min) {
      countQuery = countQuery.gte('precio_por_unidad', parseFloat(precio_min as string));
    }

    if (precio_max) {
      countQuery = countQuery.lte('precio_por_unidad', parseFloat(precio_max as string));
    }

    // Ahora construimos la query para obtener los productos
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

    // Aplicar los mismos filtros
    if (categoria) {
      query = query.eq('subcategorias.categorias.nombre_categoria', categoria);
    }

    if (subcategoria) {
      query = query.eq('subcategorias.nombre_subcategoria', subcategoria);
    }

    if (precio_min) {
      query = query.gte('precio_por_unidad', parseFloat(precio_min as string));
    }

    if (precio_max) {
      query = query.lte('precio_por_unidad', parseFloat(precio_max as string));
    }

    // Ordenar siempre por nombre
    query = query.order('nombre_producto', { ascending: true });

    // Si hay búsqueda, necesitamos traer más productos para filtrar en memoria
    let totalCount = 0;
    let productos: any[] = [];

    if (search) {
      // Para búsqueda, traemos hasta 1000 productos y filtramos localmente
      query = query.range(0, 999);
      
      const { data: productosRaw, error } = await query;

      if (error) {
        console.error('Error Supabase:', error);
        return res.status(400).json({ error: error.message });
      }

      productos = productosRaw || [];

      // Filtrar por búsqueda con normalización (sin acentos, case-insensitive)
      const searchNormalized = normalizeText(search as string);
      productos = productos.filter(p =>
        normalizeText(p.nombre_producto).includes(searchNormalized)
      );

      totalCount = productos.length;

      // Aplicar paginación después del filtrado
      const offsetNum = parseInt(offset as string);
      const limitNum = parseInt(limit as string);
      productos = productos.slice(offsetNum, offsetNum + limitNum);

    } else {
      // Sin búsqueda, aplicamos paginación directa en la base de datos
      const offsetNum = parseInt(offset as string);
      const limitNum = parseInt(limit as string);
      
      // Aplicar paginación
      query = query.range(offsetNum, offsetNum + limitNum - 1);

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

    const offsetNum = parseInt(offset as string);
    const limitNum = parseInt(limit as string);

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