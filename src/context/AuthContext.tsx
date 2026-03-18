// Shared authentication context for all AIOX applications
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  signUp: (email: string, password: string, name: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<any>
  updatePassword: (newPassword: string) => Promise<any>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        if (mounted) {
          setSession(session)
          setUser(session?.user || null)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to get session')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setSession(session)
          setUser(session?.user || null)
        }
      }
    )

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setError(null)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      })
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed'
      setError(message)
      return { data: null, error: message }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      setError(message)
      return { data: null, error: message }
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed'
      setError(message)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setError(null)
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Reset password failed'
      setError(message)
      return { data: null, error: message }
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      setError(null)
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update password failed'
      setError(message)
      return { data: null, error: message }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        error,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        isAuthenticated: !!session?.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
