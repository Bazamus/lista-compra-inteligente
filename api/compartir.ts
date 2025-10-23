import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hnnjfqokgbhnydkfuhxy.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// ================================================================
// HELPERS
// ================================================================

/**
 * Extrae el user_id del token JWT en el header Authorization
 */
async function getUserIdFromRequest(req: VercelRequest): Promise<string | null> {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Error obteniendo usuario del token:', error);
      return null;
    }
    
    return user.id;
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
}

/**
 * Genera un token criptográfico seguro de 64 caracteres
 * Usa crypto.randomBytes para máxima seguridad
 */
function generateShareToken(): string {
  return crypto.randomBytes(32).toString('base64url').substring(0, 64);
}

// ================================================================
// RATE LIMITING (básico)
// ================================================================

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(userId);
  
  if (!limit || now > limit.resetAt) {
    // Reset o primera vez
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60000 }); // 1 minuto
    return true;
  }
  
  if (limit.count >= 5) {
    // Límite: 5 shares por minuto
    return false;
  }
  
  limit.count++;
  return true;
}

// ================================================================
// HANDLER PRINCIPAL
// ================================================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  // Manejar preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir POST y DELETE
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Autenticación requerida
    const userId = await getUserIdFromRequest(req);
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado',
        message: 'Debes iniciar sesión para compartir listas'
      });
    }

    // Rate limiting
    if (!checkRateLimit(userId)) {
      return res.status(429).json({ 
        error: 'Demasiadas solicitudes',
        message: 'Máximo 5 enlaces por minuto. Intenta de nuevo en unos segundos.'
      });
    }

    if (req.method === 'POST') {
      return await handleCreateShare(req, res, userId);
    } else if (req.method === 'DELETE') {
      return await handleDeleteShare(req, res, userId);
    }

  } catch (error) {
    console.error('Error en API compartir:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo procesar la solicitud'
    });
  }
}

// ================================================================
// CREAR SHARE
// ================================================================

async function handleCreateShare(
  req: VercelRequest, 
  res: VercelResponse, 
  userId: string
) {
  const { lista_id, expiration_hours = 48 } = req.body;

  // Validar parámetros
  if (!lista_id) {
    return res.status(400).json({ 
      error: 'Parámetros inválidos',
      message: 'lista_id es requerido'
    });
  }

  if (typeof expiration_hours !== 'number' || expiration_hours < 0) {
    return res.status(400).json({ 
      error: 'Parámetros inválidos',
      message: 'expiration_hours debe ser un número positivo'
    });
  }

  try {
    // 1. Validar que la lista existe y pertenece al usuario
    console.log('🔍 Validando lista:', lista_id, 'para usuario:', userId);
    
    const { data: lista, error: listaError } = await supabase
      .from('listas_compra')
      .select('id_lista, nombre_lista, user_id')
      .eq('id_lista', lista_id)
      .eq('user_id', userId)
      .single();

    if (listaError || !lista) {
      console.error('❌ Error validando lista:', listaError);
      return res.status(404).json({ 
        error: 'Lista no encontrada',
        message: 'No tienes permisos para compartir esta lista o no existe'
      });
    }

    console.log('✅ Lista validada:', lista.nombre_lista);

    // 2. Generar token único (reintentar si hay colisión, muy improbable)
    let shareToken = generateShareToken();
    let retries = 0;
    
    while (retries < 3) {
      const { data: existing } = await supabase
        .from('list_shares')
        .select('id')
        .eq('share_token', shareToken)
        .single();
      
      if (!existing) break; // Token único encontrado
      
      shareToken = generateShareToken();
      retries++;
    }

    if (retries >= 3) {
      throw new Error('No se pudo generar token único');
    }

    // 3. Calcular fecha de expiración
    const expiresAt = expiration_hours > 0
      ? new Date(Date.now() + expiration_hours * 60 * 60 * 1000).toISOString()
      : null;

    console.log('📅 Expiración configurada:', expiresAt || 'Sin expiración');

    // 4. Crear registro de share
    const { data: share, error: shareError } = await supabase
      .from('list_shares')
      .insert({
        lista_id,
        share_token: shareToken,
        created_by: userId,
        expires_at: expiresAt,
        is_active: true,
        visit_count: 0
      })
      .select()
      .single();

    if (shareError) {
      console.error('❌ Error creando share:', shareError);
      throw new Error('Error al crear enlace compartido');
    }

    console.log('✅ Share creado:', share.id);

    // 5. Generar URL pública
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : req.headers.host 
        ? `https://${req.headers.host}`
        : 'https://www.listagpt.com';
    
    const shareUrl = `${baseUrl}/shared/${shareToken}`;

    console.log('🔗 URL generada:', shareUrl);

    // 6. Respuesta exitosa
    return res.status(201).json({
      success: true,
      share_id: share.id,
      share_url: shareUrl,
      share_token: shareToken,
      expires_at: expiresAt,
      message: 'Enlace creado correctamente'
    });

  } catch (error: any) {
    console.error('❌ Error en handleCreateShare:', error);
    return res.status(500).json({ 
      error: 'Error al crear enlace',
      message: error.message || 'Error desconocido'
    });
  }
}

// ================================================================
// ELIMINAR SHARE
// ================================================================

async function handleDeleteShare(
  req: VercelRequest, 
  res: VercelResponse, 
  userId: string
) {
  const { share_id } = req.query;

  if (!share_id || typeof share_id !== 'string') {
    return res.status(400).json({ 
      error: 'Parámetros inválidos',
      message: 'share_id es requerido'
    });
  }

  try {
    // Eliminar share (RLS valida que sea del usuario)
    const { error } = await supabase
      .from('list_shares')
      .delete()
      .eq('id', share_id)
      .eq('created_by', userId);

    if (error) {
      console.error('❌ Error eliminando share:', error);
      return res.status(400).json({ 
        error: 'Error al eliminar enlace',
        message: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Enlace eliminado correctamente'
    });

  } catch (error: any) {
    console.error('❌ Error en handleDeleteShare:', error);
    return res.status(500).json({ 
      error: 'Error al eliminar enlace',
      message: error.message || 'Error desconocido'
    });
  }
}

