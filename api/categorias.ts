import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hnnjfqokgbhnydkfuhxy.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { categoria_id } = req.query;

    if (categoria_id) {
      // Obtener subcategorías de una categoría específica
      const { data: subcategorias, error } = await supabase
        .from('subcategorias')
        .select(`
          id_subcategoria,
          nombre_subcategoria,
          categorias!inner(
            id_categoria,
            nombre_categoria
          )
        `)
        .eq('id_categoria', categoria_id);

      if (error) {
        console.error('Error Supabase subcategorías:', error);
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({
        subcategorias: subcategorias || []
      });
    } else {
      // Obtener todas las categorías con conteo de productos
      const { data: categorias, error } = await supabase
        .from('categorias')
        .select(`
          id_categoria,
          nombre_categoria,
          descripcion,
          subcategorias(
            id_subcategoria,
            nombre_subcategoria,
            productos(count)
          )
        `)
        .order('nombre_categoria', { ascending: true });

      if (error) {
        console.error('Error Supabase categorías:', error);
        return res.status(400).json({ error: error.message });
      }

      // Procesar datos para incluir conteo de productos por categoría
      const categoriasConConteo = categorias?.map(categoria => ({
        ...categoria,
        total_productos: categoria.subcategorias?.reduce((total, sub) => {
          return total + (sub.productos?.[0]?.count || 0);
        }, 0) || 0
      })) || [];

      return res.status(200).json({
        categorias: categoriasConConteo
      });
    }

  } catch (error) {
    console.error('Error en API categorías:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}