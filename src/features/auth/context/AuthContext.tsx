import { createContext, useContext, useState, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../../../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

// Cache de perfil en localStorage
const PROFILE_CACHE_KEY = 'profile_cache'
const PROFILE_CACHE_TTL = 5 * 60 * 1000 // 5 minutos

interface ProfileCache {
  profile: Profile
  timestamp: number
  userId: string
}

const getProfileFromCache = (userId: string): Profile | null => {
  try {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY)
    if (!cached) return null

    const cacheData: ProfileCache = JSON.parse(cached)
    const now = Date.now()

    // Verificar que sea del mismo usuario y no haya expirado
    if (cacheData.userId === userId && (now - cacheData.timestamp) < PROFILE_CACHE_TTL) {
      console.log('✅ Profile cargado desde cache (válido por', Math.round((PROFILE_CACHE_TTL - (now - cacheData.timestamp)) / 1000), 'segundos)')
      return cacheData.profile
    }

    // Cache expirado o de otro usuario
    localStorage.removeItem(PROFILE_CACHE_KEY)
    return null
  } catch (error) {
    console.error('Error al leer cache de perfil:', error)
    return null
  }
}

const saveProfileToCache = (profile: Profile, userId: string): void => {
  try {
    const cacheData: ProfileCache = {
      profile,
      timestamp: Date.now(),
      userId
    }
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cacheData))
    console.log('💾 Profile guardado en cache')
  } catch (error) {
    console.error('Error al guardar cache de perfil:', error)
  }
}

const clearProfileCache = (): void => {
  localStorage.removeItem(PROFILE_CACHE_KEY)
  console.log('🗑️ Cache de perfil limpiado')
}

// Interfaz para el perfil de usuario
interface Profile {
  id: string
  email: string
  role: 'admin' | 'user'
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

// Interfaz del contexto
interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  authError: Error | null
  isAdmin: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signUp: (email: string, password: string) => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  refetchProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<Error | null>(null)
  
  // Control para evitar llamadas múltiples simultáneas
  const fetchingProfile = useRef(false)
  const lastFetchedUserId = useRef<string | null>(null)

  useEffect(() => {
    // Obtener sesión actual al montar
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()

        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listener de cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('🔐 Auth state changed:', event, {
          hasSession: !!currentSession,
          userId: currentSession?.user?.id,
          email: currentSession?.user?.email
        })

        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          console.log('👤 Usuario detectado, cargando perfil...')
          await fetchProfile(currentSession.user.id)
        } else {
          console.log('❌ No hay sesión, limpiando perfil')
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    // Evitar llamadas duplicadas simultáneas
    if (fetchingProfile.current && lastFetchedUserId.current === userId) {
      console.log('⏭️ fetchProfile ya en progreso para este usuario, omitiendo...')
      return
    }

    // Verificar cache primero
    const cachedProfile = getProfileFromCache(userId)
    if (cachedProfile) {
      setProfile(cachedProfile)
      setAuthError(null)
      setLoading(false)
      lastFetchedUserId.current = userId
      return
    }

    fetchingProfile.current = true
    lastFetchedUserId.current = userId

    try {
      console.log('🔄 Fetching profile for user:', userId)
      setAuthError(null) // Limpiar error previo

      // Añadir timeout de 10 segundos
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: La consulta de perfil tardó más de 10 segundos')), 10000)
      );

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('❌ Error fetching profile:', error)
        console.error('❌ Detalles del error:', JSON.stringify(error, null, 2))
        const profileError = new Error(error.message || 'Error al cargar perfil')
        setAuthError(profileError)
        throw profileError
      }

      console.log('✅ Profile fetched:', {
        email: data.email,
        role: data.role,
        id: data.id
      })

      const profileData = data as Profile
      setProfile(profileData)
      setAuthError(null)
      
      // Guardar en cache
      saveProfileToCache(profileData, userId)
    } catch (error) {
      console.error('❌ Error fetching profile:', error)
      console.error('❌ Error type:', typeof error)
      console.error('❌ Error message:', (error as any)?.message || 'No message')
      
      // Guardar el error en el estado
      const errorObj = error instanceof Error ? error : new Error('Error desconocido al cargar perfil')
      setAuthError(errorObj)
      
      // NO limpiar el perfil si hay error temporal, mantener el estado
      // Esto evita que el usuario vea pantalla de login intermitentemente
    } finally {
      setLoading(false)
      fetchingProfile.current = false
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) throw error

      setUser(null)
      setProfile(null)
      setSession(null)
      setAuthError(null)
      
      // Limpiar cache de perfil
      clearProfileCache()
      
      // Resetear control de fetch
      fetchingProfile.current = false
      lastFetchedUserId.current = null

      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  const refetchProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  const isAdmin = profile?.role === 'admin'
  const isAuthenticated = !!user

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    authError,
    isAdmin,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    refetchProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
