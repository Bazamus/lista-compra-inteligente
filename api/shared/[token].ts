import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hnnjfqokgbhnydkfuhxy.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// ================================================================
// HANDLER PRINCIPAL
// ================================================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { token } = req.query;

    // Validar token
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ 
        error: 'Token inválido',
        message: 'El enlace no es válido'
      });
    }

    console.log('🔍 Buscando share con token:', token.substring(0, 10) + '...');

    // 1. Buscar share activo
    const { data: share, error: shareError } = await supabase
      .from('list_shares')
      .select('*')
      .eq('share_token', token)
      .eq('is_active', true)
      .single();

    if (shareError || !share) {
      console.error('❌ Share no encontrado:', shareError);
      return res.status(404).json({ 
        error: 'Enlace no encontrado',
        message: 'El enlace que buscas no existe o ha sido desactivado'
      });
    }

    console.log('✅ Share encontrado:', share.id);

    // 2. Verificar expiración
    if (share.expires_at) {
      const expirationDate = new Date(share.expires_at);
      const now = new Date();

      if (expirationDate < now) {
        console.warn('⏰ Share expirado:', share.id);
        return res.status(410).json({ 
          error: 'Enlace expirado',
          message: 'Este enlace ha caducado',
          expired_at: share.expires_at
        });
      }
    }

    // 3. Obtener datos completos de la lista
    console.log('📦 Obteniendo datos de lista:', share.lista_id);

    const { data: lista, error: listaError } = await supabase
      .from('listas_compra')
      .select(`
        id_lista,
        nombre_lista,
        num_personas,
        dias_duracion,
        presupuesto_total,
        data_json,
        created_at
      `)
      .eq('id_lista', share.lista_id)
      .single();

    if (listaError || !lista) {
      console.error('❌ Lista no encontrada:', listaError);
      return res.status(404).json({ 
        error: 'Lista no encontrada',
        message: 'La lista asociada a este enlace no existe'
      });
    }

    console.log('✅ Lista obtenida:', lista.nombre_lista);

    // 4. Incrementar contador de visitas (fire and forget)
    // No esperar respuesta para no bloquear
    supabase.rpc('increment_share_visits', { 
      token_param: token 
    }).then(({ error }) => {
      if (error) {
        console.warn('⚠️ Error incrementando visitas:', error);
      } else {
        console.log('📊 Visita registrada para share:', share.id);
      }
    });

    // 5. Preparar respuesta con datos de la lista
    const response = {
      success: true,
      lista: {
        nombre: lista.nombre_lista,
        personas: lista.num_personas,
        dias: lista.dias_duracion,
        presupuesto: lista.presupuesto_total,
        // Extraer datos del JSON si existen
        productos: lista.data_json?.productos || [],
        menus: lista.data_json?.menus || {},
        recomendaciones: lista.data_json?.recomendaciones || [],
        tipo: lista.data_json?.tipo || 'Manual',
        fecha_creacion: lista.created_at
      },
      share_info: {
        visit_count: share.visit_count + 1, // +1 porque ya se está contando esta visita
        expires_at: share.expires_at,
        created_at: share.created_at
      }
    };

    console.log('✅ Respuesta preparada con', response.lista.productos.length, 'productos');

    // 6. Respuesta exitosa
    return res.status(200).json(response);

  } catch (error: any) {
    console.error('❌ Error en API shared:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo cargar la lista compartida'
    });
  }
}

