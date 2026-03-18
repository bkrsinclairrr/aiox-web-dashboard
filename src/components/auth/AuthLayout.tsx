import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  image?: string
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  image = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=700&fit=crop',
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Left Side - Image & Branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${image}')`,
            filter: 'brightness(0.4)',
          }}
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/40 via-transparent to-blue-600/40" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">⚡</span>
              </div>
              <div>
                <h1 className="text-white text-2xl font-bold">AIOX</h1>
                <p className="text-purple-200 text-sm">AI Orchestration Platform</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-white text-4xl font-bold mb-4 leading-tight">
                AI-Powered Orchestration
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                Manage, monitor, and orchestrate AI agents at scale. Collaborate with your team in real-time.
              </p>

              <div className="space-y-4">
                {[
                  'Multi-Agent Orchestration',
                  'Real-time Collaboration',
                  'Advanced Analytics',
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full" />
                    <span className="text-gray-300">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-gray-400 text-sm"
          >
            <p>© 2024 AIOX. All rights reserved.</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-8 bg-gradient-to-b from-slate-800 to-slate-900"
      >
        <div className="w-full max-w-md">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
            {subtitle && (
              <p className="text-gray-400 text-sm">{subtitle}</p>
            )}
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
