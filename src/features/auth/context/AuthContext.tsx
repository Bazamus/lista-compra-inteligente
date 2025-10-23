import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../../../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

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
    try {
      console.log('🔄 Fetching profile for user:', userId)
      setAuthError(null) // Limpiar error previo

      // Añadir timeout para evitar que se cuelgue
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

      setProfile(data as Profile)
      setAuthError(null) // Limpiar error si fue exitoso
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
