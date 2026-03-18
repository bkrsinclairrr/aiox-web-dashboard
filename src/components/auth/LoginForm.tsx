import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!email || !password) {
        setError('Please fill in all fields')
        setLoading(false)
        return
      }

      const { error: authError } = await signIn(email, password)
      
      if (authError) {
        setError(authError)
        setLoading(false)
        return
      }

      // Success! Redirect to dashboard
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-purple-400" />
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 text-white placeholder-gray-500 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
          />
        </div>
      </motion.div>

      {/* Password Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-purple-400" />
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 text-white placeholder-gray-500 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
          />
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2"
        >
          <AlertCircle className="h-5 w-5 text-red-400" />
          <span className="text-sm text-red-200">{error}</span>
        </motion.div>
      )}

      {/* Remember Me & Forgot Password */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between"
      >
        <label className="flex items-center gap-2 text-sm text-gray-400">
          <input
            type="checkbox"
            className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500"
          />
          Remember me
        </label>
        <Link
          to="/forgot-password"
          className="text-sm text-purple-400 hover:text-purple-300 transition"
        >
          Forgot password?
        </Link>
      </motion.div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </motion.div>

      {/* Sign Up Link */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center text-sm text-gray-400"
      >
        Don't have an account?{' '}
        <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium">
          Sign up
        </Link>
      </motion.p>
    </form>
  )
}
