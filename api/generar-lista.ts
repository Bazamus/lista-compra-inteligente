import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Configuración de servicios
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hnnjfqokgbhnydkfuhxy.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const openaiKey = process.env.VITE_OPENAI_API_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({
  apiKey: openaiKey,
});

interface RequestParams {
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
  nombreLista?: string; // ✅ NUEVO: Nombre personalizado de la lista
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // ✅ NUEVO: Extraer user_id del token de autorización
    const authHeader = req.headers.authorization;
    let userId: string | null = null;

    console.log('🔐 API generar-lista: Auth header recibido:', {
      hasAuthHeader: !!authHeader,
      authHeaderLength: authHeader?.length || 0,
      startsWithBearer: authHeader?.startsWith('Bearer ') || false
    });

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('🔐 API generar-lista: Token extraído, longitud:', token.length);
      
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        console.log('🔐 API generar-lista: Resultado getUser:', {
          hasUser: !!user,
          userId: user?.id,
          hasError: !!authError,
          errorMessage: authError?.message
        });
        
        if (!authError && user) {
          userId = user.id;
          console.log('🔐 Usuario autenticado:', userId);
        } else {
          console.warn('⚠️ Error en getUser:', authError);
        }
      } catch (error) {
        console.warn('⚠️ Token inválido o no autenticado:', error);
      }
    } else {
      console.log('ℹ️ Request sin autenticación (modo Demo)');
    }

    const params: RequestParams = req.body;

    // Validar parámetros requeridos
    if (!params.numPersonas || !params.diasDuracion || !params.presupuesto) {
      return res.status(400).json({
        error: 'Parámetros requeridos: numPersonas, diasDuracion, presupuesto'
      });
    }

    // Verificar configuración de OpenAI
    if (!openaiKey) {
      console.error('⚠️ VITE_OPENAI_API_KEY no está configurada');
      return res.status(500).json({ error: 'OpenAI API key no configurada. Configura VITE_OPENAI_API_KEY en las variables de entorno de Vercel.' });
    }

    console.log('✅ Parámetros recibidos:', params);

    // 1. Obtener productos disponibles de la base de datos
    console.log('📦 Consultando productos en Supabase...');
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select(`
        id_producto,
        nombre_producto,
        formato_venta,
        precio_formato_venta,
        unidad_medida,
        precio_por_unidad,
        cantidad_unidad_medida,
        subcategorias!inner(
          nombre_subcategoria,
          categorias!inner(
            nombre_categoria
          )
        )
      `)
      .eq('activo', true)
      .order('precio_por_unidad', { ascending: true });

    if (productosError) {
      console.error('❌ Error obteniendo productos:', productosError);
      return res.status(500).json({
        error: 'Error al obtener productos de la base de datos',
        detalle: productosError.message
      });
    }

    console.log(`✅ ${productos?.length || 0} productos obtenidos`);

    // 2. Generar prompt para OpenAI
    console.log('📝 Generando prompt para OpenAI...');
    const prompt = crearPromptGeneracionLista(params, productos || []);

    // 3. Llamar a OpenAI para generar la lista
    console.log('🤖 Llamando a OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres un experto en planificación de menús y listas de compra. Tu tarea es crear una lista de compra inteligente y un menú semanal basado en las preferencias del usuario y el catálogo de productos de Mercadona disponible.

INSTRUCCIONES:
1. Responde SOLO en formato JSON válido
2. Incluye productos que existan en el catálogo proporcionado
3. Respeta el presupuesto indicado
4. Optimiza las cantidades según el número de personas y días
5. Prioriza productos básicos y esenciales
6. Incluye variedad en los menús
7. Considera las restricciones alimentarias

IMPORTANTE SOBRE PRECIOS:
- Usa "precio_formato" para cálculos de presupuesto (es el precio del formato de venta: bandeja, bolsa, etc.)
- "cantidad" representa el número de formatos (ejemplo: 2 bolsas = cantidad 2)
- "cantidad_formato" indica cuánto hay en cada formato (ejemplo: 0.495 kg por bandeja)
- Para planificar menús, considera "cantidad_formato" para saber cuánto producto real hay`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    console.log('✅ Respuesta recibida de OpenAI');

    const respuestaIA = completion.choices[0]?.message?.content;

    if (!respuestaIA) {
      console.error('❌ No se obtuvo contenido de OpenAI');
      return res.status(500).json({ error: 'No se pudo generar la respuesta de IA' });
    }

    // 4. Procesar respuesta de OpenAI
    console.log('📊 Parseando respuesta JSON...');
    let listaGenerada;
    try {
      // Extraer JSON del markdown si está envuelto en ```json
      let jsonString = respuestaIA;
      if (jsonString.includes('```json')) {
        const jsonMatch = jsonString.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonString = jsonMatch[1].trim();
        }
      }
      
      listaGenerada = JSON.parse(jsonString);
    } catch (parseError: any) {
      console.error('❌ Error parseando respuesta de IA:', parseError);
      console.error('Respuesta recibida:', respuestaIA);
      return res.status(500).json({
        error: 'Error procesando respuesta de IA',
        detalle: parseError.message
      });
    }

    // 5. Guardar lista en base de datos
    console.log('💾 Guardando lista en base de datos...');
    
    // ✅ NUEVO: Preparar data_json con toda la información generada
    const nombreLista = params.nombreLista?.trim() || `Lista para ${params.numPersonas} personas - ${params.diasDuracion} días`;
    
    const dataJson = {
      lista: {
        nombre_lista: nombreLista,
        num_personas: params.numPersonas,
        dias_duracion: params.diasDuracion,
        presupuesto_total: params.presupuesto,
      },
      productos: listaGenerada.productos || [],
      menus: listaGenerada.menus || {},
      presupuesto_estimado: listaGenerada.presupuesto_estimado || 0,
      recomendaciones: listaGenerada.recomendaciones || [],
      tipo: 'IA' as const,
    };

    const { data: listaGuardada, error: guardarError } = await supabase
      .from('listas_compra')
      .insert({
        nombre_lista: nombreLista, // ✅ NUEVO: Usar nombre personalizado
        descripcion: 'Lista generada automáticamente con IA',
        num_personas: params.numPersonas,
        dias_duracion: params.diasDuracion,
        presupuesto_total: params.presupuesto,
        presupuesto_usado: listaGenerada.presupuesto_estimado || 0,
        tipo_comidas: params.tipoComidas,
        productos_basicos: params.alimentosBasicos,
        productos_adicionales: params.productosAdicionales,
        completada: false,
        user_id: userId, // ✅ NUEVO: Asociar al usuario autenticado (null si es Demo)
        data_json: dataJson, // ✅ NUEVO: Guardar datos completos en JSONB
      })
      .select()
      .single();

    if (guardarError) {
      console.error('❌ Error guardando lista:', guardarError);
      return res.status(500).json({
        error: 'Error al guardar la lista',
        detalle: guardarError.message
      });
    }

    console.log('✅ Lista guardada con ID:', listaGuardada?.id_lista);

    // 6. Guardar items de la lista
    if (listaGenerada.productos && listaGuardada) {
      const items = listaGenerada.productos.map((item: any) => ({
        id_lista: listaGuardada.id_lista,
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.cantidad * item.precio_unitario,
        comprado: false
      }));

      const { error: itemsError } = await supabase
        .from('items_lista')
        .insert(items);

      if (itemsError) {
        console.error('Error guardando items:', itemsError);
      }
    }

    // 7. Responder con la lista generada
    res.status(200).json({
      success: true,
      lista: {
        ...listaGuardada,
        // ✅ NUEVO: Asegurar que data_json esté incluido en la respuesta
        data_json: dataJson,
      },
      productos: listaGenerada.productos || [],
      menus: listaGenerada.menus || {},
      presupuesto_estimado: listaGenerada.presupuesto_estimado || 0,
      recomendaciones: listaGenerada.recomendaciones || [],
      tipo: 'IA' as const,
    });

  } catch (error: any) {
    console.error('❌ Error en generación de lista:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      detalle: error.message || String(error),
      tipo: error.name || 'Error desconocido'
    });
  }
}

function crearPromptGeneracionLista(params: RequestParams, productos: any[]): string {
  // Crear resumen de productos por categorías
  const categorias = productos.reduce((acc: any, producto) => {
    const categoria = producto.subcategorias.categorias.nombre_categoria;
    const subcategoria = producto.subcategorias.nombre_subcategoria;

    if (!acc[categoria]) acc[categoria] = {};
    if (!acc[categoria][subcategoria]) acc[categoria][subcategoria] = [];

    acc[categoria][subcategoria].push({
      id: producto.id_producto,
      nombre: producto.nombre_producto,
      precio_formato: producto.precio_formato_venta,
      cantidad_formato: producto.cantidad_unidad_medida,
      unidad: producto.unidad_medida,
      formato: producto.formato_venta
    });

    return acc;
  }, {});

  return `
GENERAR LISTA DE COMPRA Y MENÚ

PARÁMETROS DEL USUARIO:
- Personas: ${params.numPersonas}
- Duración: ${params.diasDuracion} días
- Presupuesto: €${params.presupuesto}
- Desayunos preferidos: ${params.tipoComidas.desayuno.join(', ')}
- Comidas preferidas: ${params.tipoComidas.comida.join(', ')}
- Cenas preferidas: ${params.tipoComidas.cena.join(', ')}
- Alimentos básicos: ${params.alimentosBasicos.join(', ')}
- Productos adicionales: ${params.productosAdicionales.join(', ')}
${params.restricciones ? `- Restricciones: ${params.restricciones.join(', ')}` : ''}

CATÁLOGO DE PRODUCTOS DISPONIBLES:
${JSON.stringify(categorias, null, 2)}

RESPONDE EN ESTE FORMATO JSON:
{
  "productos": [
    {
      "id_producto": number,
      "nombre": "string",
      "cantidad": number (número de formatos: bolsas, bandejas, etc.),
      "precio_unitario": number (usa "precio_formato" del catálogo),
      "categoria": "string",
      "esencial": boolean
    }
  ],
  "menus": {
    "dia_1": {
      "desayuno": "descripción",
      "comida": "descripción",
      "cena": "descripción"
    }
  },
  "presupuesto_estimado": number (suma de cantidad × precio_unitario de todos los productos),
  "recomendaciones": [
    "string con consejos"
  ]
}

CÁLCULO DE PRESUPUESTO:
- precio_unitario en respuesta = precio_formato del catálogo
- presupuesto_estimado = suma de (cantidad × precio_unitario) para todos los productos
- Ejemplo: 2 bolsas de panecillos a 1.14€ = cantidad: 2, precio_unitario: 1.14, subtotal: 2.28€

OPTIMIZA para el presupuesto y las preferencias indicadas.`;
}