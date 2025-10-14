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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method, query } = req;

    switch (method) {
      case 'GET':
        return await handleGetListas(req, res);
      case 'POST':
        return await handleCreateLista(req, res);
      case 'PUT':
        return await handleUpdateLista(req, res);
      case 'DELETE':
        return await handleDeleteLista(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Error en API listas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Obtener listas de compra
async function handleGetListas(req: VercelRequest, res: VercelResponse) {
  const { lista_id, incluir_items = 'false' } = req.query;
  const userId = await getUserIdFromRequest(req);

  try {
    if (lista_id) {
      // Obtener lista específica
      let query = supabase
        .from('listas_compra')
        .select('*')
        .eq('id_lista', lista_id);

      // ✅ NUEVO: Filtrar por user_id si está autenticado
      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        // Si no está autenticado, solo mostrar listas sin user_id (Demo)
        query = query.is('user_id', null);
      }

      const { data: lista, error } = await query.single();

      if (error) {
        console.error('Error obteniendo lista:', error);
        return res.status(400).json({ error: error.message });
      }

      if (!lista) {
        return res.status(404).json({ error: 'Lista no encontrada' });
      }

      // Obtener items si se solicita
      let items = [];
      if (incluir_items === 'true') {
        const { data: itemsData, error: itemsError } = await supabase
          .from('items_lista')
          .select(`
            *,
            productos!inner(
              nombre_producto,
              formato_venta,
              unidad_medida,
              imagen_url,
              subcategorias!inner(
                nombre_subcategoria,
                categorias!inner(
                  nombre_categoria
                )
              )
            )
          `)
          .eq('id_lista', lista_id);

        if (!itemsError) {
          items = itemsData || [];
        }
      }

      res.status(200).json({
        lista,
        items: incluir_items === 'true' ? items : undefined
      });

    } else {
      // Obtener todas las listas
      let query = supabase
        .from('listas_compra')
        .select('*')
        .order('created_at', { ascending: false });

      // ✅ NUEVO: Filtrar por user_id si está autenticado
      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        // Si no está autenticado, solo mostrar listas sin user_id (Demo)
        query = query.is('user_id', null);
      }

      const { data: listas, error } = await query;

      if (error) {
        console.error('Error obteniendo listas:', error);
        return res.status(400).json({ error: error.message });
      }

      res.status(200).json({
        listas: listas || []
      });
    }

  } catch (error) {
    console.error('Error en handleGetListas:', error);
    res.status(500).json({ error: 'Error al obtener listas' });
  }
}

// Crear nueva lista
async function handleCreateLista(req: VercelRequest, res: VercelResponse) {
  const userId = await getUserIdFromRequest(req);
  const {
    nombre_lista,
    descripcion,
    num_personas,
    dias_duracion,
    presupuesto_total,
    tipo_comidas,
    productos_basicos,
    productos_adicionales
  } = req.body;

  try {
    const { data: lista, error } = await supabase
      .from('listas_compra')
      .insert({
        nombre_lista,
        descripcion,
        num_personas,
        dias_duracion,
        presupuesto_total,
        tipo_comidas,
        productos_basicos,
        productos_adicionales,
        presupuesto_usado: 0,
        completada: false,
        user_id: userId, // ✅ NUEVO: Asociar al usuario autenticado
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando lista:', error);
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ lista });

  } catch (error) {
    console.error('Error en handleCreateLista:', error);
    res.status(500).json({ error: 'Error al crear lista' });
  }
}

// Actualizar lista
async function handleUpdateLista(req: VercelRequest, res: VercelResponse) {
  const { lista_id } = req.query;
  const userId = await getUserIdFromRequest(req);
  const updates = req.body;

  if (!lista_id) {
    return res.status(400).json({ error: 'ID de lista requerido' });
  }

  try {
    let query = supabase
      .from('listas_compra')
      .update(updates)
      .eq('id_lista', lista_id);

    // ✅ NUEVO: Validar que sea del usuario autenticado
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      // Si no está autenticado, solo permitir actualizar listas sin user_id (Demo)
      query = query.is('user_id', null);
    }

    const { data: lista, error } = await query
      .select()
      .single();

    if (error) {
      console.error('Error actualizando lista:', error);
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ lista });

  } catch (error) {
    console.error('Error en handleUpdateLista:', error);
    res.status(500).json({ error: 'Error al actualizar lista' });
  }
}

// Eliminar lista
async function handleDeleteLista(req: VercelRequest, res: VercelResponse) {
  const { lista_id } = req.query;
  const userId = await getUserIdFromRequest(req);

  if (!lista_id) {
    return res.status(400).json({ error: 'ID de lista requerido' });
  }

  try {
    let query = supabase
      .from('listas_compra')
      .delete()
      .eq('id_lista', lista_id);

    // ✅ NUEVO: Solo permitir borrar propias listas
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      // Si no está autenticado, solo permitir borrar listas sin user_id (Demo)
      query = query.is('user_id', null);
    }

    const { error } = await query;

    if (error) {
      console.error('Error eliminando lista:', error);
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Lista eliminada correctamente' });

  } catch (error) {
    console.error('Error en handleDeleteLista:', error);
    res.status(500).json({ error: 'Error al eliminar lista' });
  }
}