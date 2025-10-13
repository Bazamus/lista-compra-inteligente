import { useEffect, useState } from 'react'
import { AdminLayout } from '../layout/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table'
import { Select } from '../../../components/ui/Select'
import { supabase } from '../../../lib/supabase'
import { Trash2, RefreshCw } from 'lucide-react'

interface Profile {
  id: string
  email: string
  role: 'admin' | 'user'
  created_at: string
}

export default function UsersManagement() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      console.log('🔄 Cargando usuarios desde Supabase...')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('📊 Respuesta de Supabase:', { data, error })

      if (error) {
        console.error('❌ Error de Supabase:', error)
        throw error
      }

      console.log('✅ Usuarios cargados:', data?.length || 0)
      setUsers(data || [])
    } catch (error: any) {
      console.error('❌ Error loading users:', error)
      alert(`Error al cargar usuarios: ${error.message || 'Error desconocido'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      // Actualizar estado local
      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ))

      alert('Rol actualizado correctamente')
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Error al actualizar el rol')
    }
  }

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario ${email}?`)) {
      return
    }

    try {
      // Primero eliminar de profiles (esto también eliminará de auth.users por CASCADE)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error

      // Actualizar estado local
      setUsers(users.filter(user => user.id !== userId))

      alert('Usuario eliminado correctamente')
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error al eliminar el usuario')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600 mt-1">
              Administra los usuarios registrados en la plataforma
            </p>
          </div>
          <button
            onClick={loadUsers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios Registrados ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Cargando usuarios...
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay usuarios registrados
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Fecha de Registro</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value as 'admin' | 'user')
                          }
                          className="w-32"
                        >
                          <option value="user">Usuario</option>
                          <option value="admin">Admin</option>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-600">
                          {new Date(user.created_at).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Eliminar</span>
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
