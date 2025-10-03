import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hnnjfqokgbhnydkfuhxy.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
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
    limit = '50',
    offset = '0',
    precio_min,
    precio_max
  } = req.query;

  try {
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

    // Filtros
    if (categoria) {
      query = query.eq('subcategorias.categorias.nombre_categoria', categoria);
    }

    if (subcategoria) {
      query = query.eq('subcategorias.nombre_subcategoria', subcategoria);
    }

    if (search) {
      query = query.ilike('nombre_producto', `%${search}%`);
    }

    if (precio_min) {
      query = query.gte('precio_por_unidad', parseFloat(precio_min as string));
    }

    if (precio_max) {
      query = query.lte('precio_por_unidad', parseFloat(precio_max as string));
    }

    // Paginación y ordenamiento
    query = query
      .order('nombre_producto', { ascending: true })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    const { data: productos, error, count } = await query;

    if (error) {
      console.error('Error Supabase:', error);
      return res.status(400).json({ error: error.message });
    }

    // Contar total para paginación
    const { count: totalCount } = await supabase
      .from('productos')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true);

    res.status(200).json({
      productos: productos || [],
      pagination: {
        total: totalCount || 0,
        offset: parseInt(offset as string),
        limit: parseInt(limit as string),
        hasNext: (parseInt(offset as string) + parseInt(limit as string)) < (totalCount || 0)
      }
    });

  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
}