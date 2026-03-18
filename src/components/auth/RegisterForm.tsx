import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { Mail, Lock, User, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const { name, email, password, confirmPassword } = formData

      if (!name || !email || !password || !confirmPassword) {
        setError('Please fill in all fields')
        setLoading(false)
        return
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters')
        setLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }

      const { error: authError } = await signUp(email, password, name)

      if (authError) {
        setError(authError)
        setLoading(false)
        return
      }

      setSuccess('Account created! Check your email to verify your account.')
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-5 w-5 text-purple-400" />
          <input
            id="name"
            type="text"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 text-white placeholder-gray-500 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
          />
        </div>
      </motion.div>

      {/* Email Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-purple-400" />
          <input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 text-white placeholder-gray-500 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
          />
        </div>
      </motion.div>

      {/* Password Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-purple-400" />
          <input
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 text-white placeholder-gray-500 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
          />
        </div>
      </motion.div>

      {/* Confirm Password Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-purple-400" />
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleInputChange}
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

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2"
        >
          <CheckCircle className="h-5 w-5 text-green-400" />
          <span className="text-sm text-green-200">{success}</span>
        </motion.div>
      )}

      {/* Terms Agreement */}
      <motion.label
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2 text-sm text-gray-400"
      >
        <input
          type="checkbox"
          required
          className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500"
        />
        I agree to the Terms of Service and Privacy Policy
      </motion.label>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </motion.div>

      {/* Sign In Link */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center text-sm text-gray-400"
      >
        Already have an account?{' '}
        <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
          Sign in
        </Link>
      </motion.p>
    </form>
  )
}
