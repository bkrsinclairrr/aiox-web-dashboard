import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const NAV_SECTIONS = [
  {
    title: 'Plataforma',
    items: [
      { to: '/',             label: '📊 Dashboard' },
      { to: '/orchestrator', label: '🎯 Orquestrador' },
      { to: '/chat',         label: '💬 Chat' },
      { to: '/agents',       label: '🤖 Agentes' },
      { to: '/history',      label: '📋 Histórico' },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { to: '/monitor', label: '🖥 Monitor' },
      { to: '/cron',    label: '⏰ Agendamentos' },
      { to: '/memory',  label: '🧠 Memória' },
    ],
  },
  {
    title: 'Conta',
    items: [
      { to: '/team',     label: '👥 Time' },
      { to: '/settings', label: '⚙ Configurações' },
    ],
  },
]

function Navigation() {
  const location = useLocation()
  const [user, setUser] = React.useState<any>(null)
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <nav className="border-b border-gray-800 bg-black/70 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="text-2xl font-bold">⚡</div>
            <span className="text-lg font-bold hidden sm:block">AIOX Dashboard</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_SECTIONS.map(section => (
              <div key={section.title} className="flex items-center gap-1">
                <span className="text-gray-600 text-xs px-2 hidden xl:inline">{section.title}:</span>
                {section.items.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`px-3 py-1.5 rounded text-sm transition whitespace-nowrap ${
                      isActive(to)
                        ? 'text-white bg-yellow-600/20 border border-yellow-600/50'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
                {section.title !== 'Conta' && <div className="w-px h-4 bg-gray-800 mx-1" />}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 transition"
              >
                <div className="w-7 h-7 bg-yellow-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {user?.email?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="text-sm text-right hidden sm:block">
                  <div className="text-xs text-gray-400 max-w-32 truncate">{user?.email}</div>
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-gray-900 border border-gray-800 rounded shadow-xl z-50">
                  <div className="px-4 py-3 border-b border-gray-800">
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    ⚙ Configurações
                  </Link>
                  <button
                    onClick={() => { setDropdownOpen(false); handleSignOut() }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 rounded-b"
                  >
                    ↩ Sair
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(m => !m)}
              className="lg:hidden p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-white"
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="lg:hidden mt-3 pb-3 border-t border-gray-800 pt-3 space-y-3">
            {NAV_SECTIONS.map(section => (
              <div key={section.title}>
                <p className="text-xs text-gray-600 uppercase tracking-widest mb-1 px-1">{section.title}</p>
                <div className="flex flex-wrap gap-1">
                  {section.items.map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      className={`px-3 py-2 rounded text-sm transition ${
                        isActive(to)
                          ? 'text-white bg-yellow-600/20 border border-yellow-600/50'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation

