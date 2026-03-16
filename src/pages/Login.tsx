import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold mb-2">⚡</div>
          <h1 className="text-3xl font-bold">AIOX Dashboard</h1>
          <p className="text-gray-400 mt-2">Controle seus agentes IA</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="bg-gray-900 border border-gray-800 rounded p-8 space-y-6">
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded px-4 py-3 text-red-200 text-sm">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-black/50 border border-gray-800 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black/50 border border-gray-800 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 text-white rounded px-4 py-2 font-medium transition"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Não tem conta?{' '}
            <Link to="/register" className="text-yellow-400 hover:text-yellow-300 font-medium">
              Cadastre-se
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-8 bg-gray-900/50 border border-gray-800 rounded p-4 text-sm text-gray-400">
          <p className="font-medium mb-2">📝 Credenciais de Demonstração:</p>
          <p>Email: demo@aiox.dev</p>
          <p>Senha: demo123456</p>
        </div>
      </div>
    </div>
  )
}

export default Login
