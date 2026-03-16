import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)

      if (password !== confirmPassword) {
        throw new Error('Senhas não coincidem')
      }

      if (password.length < 6) {
        throw new Error('Senha deve ter pelo menos 6 caracteres')
      }

      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      })

      if (authError) throw authError

      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar')
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
          <p className="text-gray-400 mt-2">Crie sua conta</p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="bg-gray-900 border border-gray-800 rounded p-8 space-y-6">
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded px-4 py-3 text-red-200 text-sm">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900/30 border border-green-700 rounded px-4 py-3 text-green-200 text-sm">
              ✅ Cadastro realizado! Redirecionando...
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={success}
              className="w-full bg-black/50 border border-gray-800 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 disabled:opacity-50"
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
              disabled={success}
              className="w-full bg-black/50 border border-gray-800 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 disabled:opacity-50"
              placeholder="••••••••"
            />
            <p className="text-xs text-gray-400 mt-1">Mínimo 6 caracteres</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirmar Senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={success}
              className="w-full bg-black/50 border border-gray-800 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 text-white rounded px-4 py-2 font-medium transition"
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Já tem conta?{' '}
            <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-medium">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
