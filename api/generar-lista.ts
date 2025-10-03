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
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
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
7. Considera las restricciones alimentarias`
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
    const { data: listaGuardada, error: guardarError } = await supabase
      .from('listas_compra')
      .insert({
        nombre_lista: `Lista para ${params.numPersonas} personas - ${params.diasDuracion} días`,
        descripcion: 'Lista generada automáticamente con IA',
        num_personas: params.numPersonas,
        dias_duracion: params.diasDuracion,
        presupuesto_total: params.presupuesto,
        presupuesto_usado: listaGenerada.presupuesto_estimado || 0,
        tipo_comidas: params.tipoComidas,
        productos_basicos: params.alimentosBasicos,
        productos_adicionales: params.productosAdicionales,
        completada: false
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
      lista: listaGuardada,
      productos: listaGenerada.productos || [],
      menus: listaGenerada.menus || {},
      presupuesto_estimado: listaGenerada.presupuesto_estimado || 0,
      recomendaciones: listaGenerada.recomendaciones || []
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
      precio: producto.precio_por_unidad,
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
      "cantidad": number,
      "precio_unitario": number,
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
  "presupuesto_estimado": number,
  "recomendaciones": [
    "string con consejos"
  ]
}

OPTIMIZA para el presupuesto y las preferencias indicadas.`;
}