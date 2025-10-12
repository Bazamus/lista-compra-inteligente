import { useEffect, useState } from 'react'
import { AdminLayout } from '../layout/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { supabase } from '../../../lib/supabase'
import { TrendingUp, ShoppingCart, Calendar } from 'lucide-react'

interface AnalyticsData {
  totalUsers: number
  totalLists: number
  avgBudget: number
  listsToday: number
  listsThisWeek: number
  listsThisMonth: number
  recentActivity: Array<{
    date: string
    count: number
  }>
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalLists: 0,
    avgBudget: 0,
    listsToday: 0,
    listsThisWeek: 0,
    listsThisMonth: 0,
    recentActivity: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)

      // Total usuarios
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Total listas
      const { count: listsCount } = await supabase
        .from('listas_compra')
        .select('*', { count: 'exact', head: true })

      // Presupuesto promedio
      const { data: budgetData } = await supabase
        .from('listas_compra')
        .select('presupuesto_total')
        .not('presupuesto_total', 'is', null)

      const avgBudget =
        budgetData && budgetData.length > 0
          ? budgetData.reduce((sum, item) => sum + (item.presupuesto_total || 0), 0) /
            budgetData.length
          : 0

      // Listas de hoy
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { count: todayCount } = await supabase
        .from('listas_compra')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())

      // Listas esta semana
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      const { count: weekCount } = await supabase
        .from('listas_compra')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString())

      // Listas este mes
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

      const { count: monthCount } = await supabase
        .from('listas_compra')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneMonthAgo.toISOString())

      setAnalytics({
        totalUsers: usersCount || 0,
        totalLists: listsCount || 0,
        avgBudget: Math.round(avgBudget * 100) / 100,
        listsToday: todayCount || 0,
        listsThisWeek: weekCount || 0,
        listsThisMonth: monthCount || 0,
        recentActivity: [],
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    {
      title: 'Listas Hoy',
      value: analytics.listsToday,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      change: '+0%',
    },
    {
      title: 'Listas (7 días)',
      value: analytics.listsThisWeek,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      change: '+0%',
    },
    {
      title: 'Listas (30 días)',
      value: analytics.listsThisMonth,
      icon: ShoppingCart,
      color: 'from-purple-500 to-purple-600',
      change: '+0%',
    },
    {
      title: 'Presupuesto Promedio',
      value: `${analytics.avgBudget.toFixed(2)}€`,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      change: '+0%',
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">
              Estadísticas y métricas de uso de la plataforma
            </p>
          </div>
          <button
            onClick={loadAnalytics}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Resumen General */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Registrados</span>
                  <span className="font-bold text-gray-900">
                    {analytics.totalUsers}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Usuarios Activos</span>
                  <span className="font-bold text-gray-900">
                    {analytics.totalUsers}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tasa de Conversión</span>
                  <span className="font-bold text-green-600">100%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen de Listas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Creadas</span>
                  <span className="font-bold text-gray-900">
                    {analytics.totalLists}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Este Mes</span>
                  <span className="font-bold text-gray-900">
                    {analytics.listsThisMonth}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Promedio/Usuario</span>
                  <span className="font-bold text-gray-900">
                    {analytics.totalUsers > 0
                      ? (analytics.totalLists / analytics.totalUsers).toFixed(1)
                      : '0'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información adicional */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas Adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium mb-1">
                  Productos en Catálogo
                </p>
                <p className="text-2xl font-bold text-blue-900">4,429</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium mb-1">
                  Presupuesto Total Gestionado
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {(analytics.avgBudget * analytics.totalLists).toFixed(2)}€
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 font-medium mb-1">
                  Ahorro Estimado
                </p>
                <p className="text-2xl font-bold text-purple-900">~15%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
