import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Navigation() {
  const location = useLocation()
  const [user, setUser] = React.useState<any>(null)
  const [dropdownOpen, setDropdownOpen] = React.useState(false)

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="border-b border-gray-800 bg-black/50 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="text-2xl font-bold">⚡</div>
              <span className="text-lg font-bold">AIOX Dashboard</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className={`transition ${
                  isActive('/') ? 'text-white border-b-2 border-yellow-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/agents"
                className={`transition ${
                  isActive('/agents') ? 'text-white border-b-2 border-yellow-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Agentes
              </Link>
              <Link
                to="/history"
                className={`transition ${
                  isActive('/history') ? 'text-white border-b-2 border-yellow-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Histórico
              </Link>
              <Link
                to="/team"
                className={`transition ${
                  isActive('/team') ? 'text-white border-b-2 border-yellow-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Time
              </Link>
              <Link
                to="/settings"
                className={`transition ${
                  isActive('/settings') ? 'text-white border-b-2 border-yellow-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Configurações
              </Link>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800 transition"
            >
              <div className="text-sm text-right">
                <div className="font-medium">{user?.email}</div>
                <div className="text-xs text-gray-400">Conta</div>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded shadow-lg">
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    handleSignOut()
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-800 text-red-400 rounded"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
