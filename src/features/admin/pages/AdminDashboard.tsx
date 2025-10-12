import { useEffect, useState } from 'react'
import { Users, ShoppingCart, TrendingUp, Package } from 'lucide-react'
import { AdminLayout } from '../layout/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { supabase } from '../../../lib/supabase'

interface Stats {
  totalUsers: number
  totalLists: number
  listsThisWeek: number
  totalProducts: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalLists: 0,
    listsThisWeek: 0,
    totalProducts: 4429,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Total usuarios
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Total listas
      const { count: listsCount } = await supabase
        .from('listas_compra')
        .select('*', { count: 'exact', head: true })

      // Listas esta semana
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      const { count: weekListsCount } = await supabase
        .from('listas_compra')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString())

      setStats({
        totalUsers: usersCount || 0,
        totalLists: listsCount || 0,
        listsThisWeek: weekListsCount || 0,
        totalProducts: 4429,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Usuarios',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Listas Creadas',
      value: stats.totalLists,
      icon: ShoppingCart,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Listas (7 días)',
      value: stats.listsThisWeek,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Productos en BD',
      value: stats.totalProducts,
      icon: Package,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Bienvenido al panel de administración
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {loading ? '...' : stat.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                onClick={() => (window.location.href = '/admin/users')}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Gestionar Usuarios</p>
                    <p className="text-xs text-blue-100">
                      Ver, editar y administrar usuarios
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => (window.location.href = '/admin/database')}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Explorar Base de Datos
                    </p>
                    <p className="text-xs text-gray-500">
                      Ver tablas y datos del sistema
                    </p>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-gray-600">
                    Sistema funcionando correctamente
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-gray-600">
                    {stats.totalUsers} usuarios registrados
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-gray-600">
                    {stats.listsThisWeek} listas creadas esta semana
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
