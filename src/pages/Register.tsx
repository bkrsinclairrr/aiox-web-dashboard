import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Zap, Eye, EyeOff, Loader, CheckCircle, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'

function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)

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

  const passwordStrength = password ? Math.min(Math.ceil(password.length / 4), 4) : 0
  const passwordsMatch = password && confirmPassword && password === confirmPassword

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center px-4 overflow-hidden relative">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-gradient-to-br from-purple-600/30 to-transparent rounded-full mix-blend-multiply filter blur-3xl animate-blob opacity-40"></div>
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-600/30 to-transparent rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 opacity-40"></div>
      <div className="absolute -bottom-8 left-1/2 w-80 h-80 bg-gradient-to-br from-pink-600/30 to-transparent rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000 opacity-40"></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-20" style={{
        backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)',
        backgroundSize: '50px 50px'
      }}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Floating accent */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl"></div>

        {/* Header Section */}
        <div className="text-center mb-12 relative">
          {/* Animated badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full mb-6 backdrop-blur-sm animate-fade-in">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-purple-300">Comece sua jornada</span>
          </div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-300 via-purple-200 to-blue-300 bg-clip-text text-transparent mb-3 leading-tight">
            AIOX Dashboard
          </h1>
          <p className="text-gray-400 text-lg font-light tracking-wide">Crie sua conta e domine a IA</p>
        </div>

        {/* Main Card */}
        <div className="relative group">
          {/* Gradient border effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
          
          {/* Card */}
          <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/20 rounded-2xl p-8 shadow-2xl">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 animate-shake">
                <div className="w-5 h-5 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-400 text-xs font-bold">✕</span>
                </div>
                <div>
                  <p className="text-red-200 text-sm font-medium">Erro no cadastro</p>
                  <p className="text-red-200/70 text-xs mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-start gap-3 animate-fade-in">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-200 text-sm font-medium">Cadastro realizado!</p>
                  <p className="text-green-200/70 text-xs mt-1">Redirecionando para login...</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2 group/field">
                <label className="block text-sm font-semibold text-gray-300">
                  Endereço de Email
                </label>
                <div className={`relative transition-all duration-300 ${focused === 'email' ? 'scale-105' : ''}`}>
                  <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${focused === 'email' ? 'text-purple-400' : 'text-gray-400'}`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    required
                    disabled={success}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200 disabled:opacity-50 hover:border-white/20"
                    placeholder="seu@empresa.com"
                  />
                  {email && focused === 'email' && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2 group/field">
                <label className="block text-sm font-semibold text-gray-300">
                  Senha
                </label>
                <div className={`relative transition-all duration-300 ${focused === 'password' ? 'scale-105' : ''}`}>
                  <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${focused === 'password' ? 'text-purple-400' : 'text-gray-400'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    required
                    disabled={success}
                    className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200 disabled:opacity-50 hover:border-white/20"
                    placeholder="••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={success}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength */}
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            i <= passwordStrength
                              ? i <= 2
                                ? 'bg-red-500'
                                : i === 3
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                              : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">
                      {password.length < 6
                        ? '❌ Mínimo 6 caracteres'
                        : password.length < 10
                        ? '🔓 Fraca'
                        : password.length < 15
                        ? '🔒 Média'
                        : '🔐 Forte'}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2 group/field">
                <label className="block text-sm font-semibold text-gray-300">
                  Confirmar Senha
                </label>
                <div className={`relative transition-all duration-300 ${focused === 'confirm' ? 'scale-105' : ''}`}>
                  <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${focused === 'confirm' ? 'text-purple-400' : 'text-gray-400'}`} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocused('confirm')}
                    onBlur={() => setFocused(null)}
                    required
                    disabled={success}
                    className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200 disabled:opacity-50 hover:border-white/20"
                    placeholder="••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={success}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors disabled:opacity-50"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Match Indicator */}
                {confirmPassword && (
                  <div className="mt-2 flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full transition-all ${
                        passwordsMatch ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <p className={`text-xs transition-all ${passwordsMatch ? 'text-green-400' : 'text-red-400'}`}>
                      {passwordsMatch ? '✓ Senhas coincidem perfeitamente' : '✗ Senhas não coincidem'}
                    </p>
                  </div>
                )}
              </div>

              {/* Terms checkbox */}
              <label className="flex items-center gap-3 cursor-pointer group/checkbox">
                <input
                  type="checkbox"
                  required
                  className="w-5 h-5 rounded-lg bg-white/5 border border-white/10 cursor-pointer accent-purple-600 group-hover/checkbox:border-white/20 transition"
                />
                <span className="text-xs text-gray-400 group-hover/checkbox:text-gray-300 transition">
                  Concordo com os{' '}
                  <a href="#" className="text-purple-400 hover:text-purple-300">
                    Termos de Serviço
                  </a>
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || success}
                className="w-full mt-8 py-4 px-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 disabled:from-gray-600 disabled:via-gray-600 disabled:to-gray-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:shadow-2xl hover:shadow-purple-500/30 disabled:shadow-none disabled:scale-100 flex items-center justify-center gap-2 group shadow-lg relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Criando conta...</span>
                  </>
                ) : (
                  <>
                    <span>Criar minha conta</span>
                    <Zap className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              <span className="text-xs text-gray-500 font-medium">JÁ REGISTRADO</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </div>

            {/* Login Link */}
            <p className="text-center text-gray-400 text-sm">
              Já tem conta?{' '}
              <Link
                to="/login"
                className="font-semibold text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text hover:from-purple-300 hover:via-pink-300 hover:to-blue-300 transition-all duration-300 hover:underline"
              >
                Faça login aqui
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-600 font-light">
            © 2026 AIOX. Plataforma de Inteligência Artificial Executiva
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <a href="#" className="text-xs text-gray-500 hover:text-gray-400 transition">Privacidade</a>
            <span className="text-gray-700">•</span>
            <a href="#" className="text-xs text-gray-500 hover:text-gray-400 transition">Termos</a>
            <span className="text-gray-700">•</span>
            <a href="#" className="text-xs text-gray-500 hover:text-gray-400 transition">Suporte</a>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default Register
