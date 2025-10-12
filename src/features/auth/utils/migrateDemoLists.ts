import { supabase } from '../../../lib/supabase'
import type { SavedList } from '../../../hooks/useListHistory'

interface DemoSession {
  id: string
  created_at: string
  lists: SavedList[]
}

export async function migrateDemoLists(userId: string): Promise<{
  success: boolean
  migratedCount: number
  error?: string
}> {
  try {
    const sessionStr = localStorage.getItem('demo_session')
    if (!sessionStr) {
      return { success: true, migratedCount: 0 }
    }

    const session: DemoSession = JSON.parse(sessionStr)
    
    if (!session.lists || session.lists.length === 0) {
      // Limpiar sesión demo vacía
      localStorage.removeItem('demo_session')
      return { success: true, migratedCount: 0 }
    }

    // Migrar cada lista a la BD
    let migratedCount = 0
    
    for (const list of session.lists) {
      try {
        // Preparar datos de la lista para insertar
        const listaData = {
          nombre_lista: list.nombre || 'Lista sin nombre',
          descripcion: list.resultado?.lista?.descripcion || null,
          num_personas: list.resultado?.lista?.num_personas || 1,
          dias_duracion: list.resultado?.lista?.dias_duracion || 7,
          presupuesto_total: list.resultado?.presupuesto_estimado || 0,
          presupuesto_usado: list.resultado?.presupuesto_estimado || 0,
          tipo_comidas: list.resultado?.lista?.tipo_comidas || null,
          productos_basicos: list.resultado?.lista?.productos_basicos || null,
          productos_adicionales: list.resultado?.lista?.productos_adicionales || null,
          completada: false,
          fecha_compra: null,
          notas: null,
          user_id: userId, // Vincular con el usuario
        }

        // Insertar lista en BD
        const { data: listaInsertada, error: listaError } = await supabase
          .from('listas_compra')
          .insert(listaData)
          .select()
          .single()

        if (listaError) {
          console.error('Error inserting list:', listaError)
          continue
        }

        // Si la lista tiene productos, insertarlos también
        if (list.resultado?.productos && list.resultado.productos.length > 0) {
          const itemsData = list.resultado.productos.map((producto: any) => ({
            id_lista: listaInsertada.id_lista,
            id_producto: producto.id_producto,
            cantidad: producto.cantidad,
            precio_unitario: producto.precio_unitario,
            comprado: false,
            notas: null,
          }))

          const { error: itemsError } = await supabase
            .from('items_lista')
            .insert(itemsData)

          if (itemsError) {
            console.error('Error inserting items:', itemsError)
          }
        }

        migratedCount++
      } catch (error) {
        console.error('Error migrating individual list:', error)
      }
    }

    // Limpiar sesión demo después de migración exitosa
    if (migratedCount > 0) {
      localStorage.removeItem('demo_session')
    }

    return { success: true, migratedCount }
  } catch (error) {
    console.error('Error migrating demo lists:', error)
    return {
      success: false,
      migratedCount: 0,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

export function showMigrationDialog(listsCount: number): Promise<boolean> {
  return new Promise((resolve) => {
    const confirmed = window.confirm(
      `Tienes ${listsCount} lista${listsCount !== 1 ? 's' : ''} guardada${listsCount !== 1 ? 's' : ''} en modo Demo.\n\n` +
      `¿Quieres guardarlas permanentemente en tu cuenta?\n\n` +
      `Si aceptas, tus listas se migrarán a la nube y podrás acceder a ellas desde cualquier dispositivo.`
    )
    resolve(confirmed)
  })
}

