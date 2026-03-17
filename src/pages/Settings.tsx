import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function Settings() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({
    aiox_engine_url: '',
    auto_sync: true,
    notifications_enabled: true,
    theme: 'dark',
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Load from localStorage
      const saved = localStorage.getItem('aiox-settings')
      if (saved) {
        setSettings(prev => ({ ...prev, ...JSON.parse(saved) }))
      }
      setLoading(false)
    } catch (err) {
      console.error('Erro ao carregar configurações:', err)
      setLoading(false)
    }
  }

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('aiox-settings', JSON.stringify(newSettings))
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const newPassword = (e.target as any).newPassword?.value

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error
      alert('Senha alterada com sucesso!')
      ;(e.target as any).reset()
    } catch (err: any) {
      alert('Erro ao alterar senha: ' + err.message)
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm('Tem certeza? Esta ação não pode ser desfeita.')) {
      try {
        const { error } = await supabase.auth.admin.deleteUser(user.id)
        if (error) throw error
        await supabase.auth.signOut()
        window.location.href = '/login'
      } catch (err: any) {
        alert('Erro ao deletar conta: ' + err.message)
      }
    }
  }

  if (loading) {
    return <p className="text-gray-400">Carregando...</p>
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Configurações</h1>
        <p className="text-gray-400 mt-2">Personalize sua experiência no AIOX Dashboard</p>
      </div>

      {/* Account Settings */}
      <div className="bg-gray-900 border border-gray-800 rounded p-6">
        <h2 className="text-xl font-bold mb-4">Conta</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full bg-black/50 border border-gray-800 rounded px-4 py-2 text-gray-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Criado em</label>
            <input
              type="text"
              value={new Date(user?.created_at).toLocaleString('pt-BR')}
              disabled
              className="w-full bg-black/50 border border-gray-800 rounded px-4 py-2 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* AIOX Settings */}
      <div className="bg-gray-900 border border-gray-800 rounded p-6">
        <h2 className="text-xl font-bold mb-4">AIOX Engine</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">URL do AIOX Engine</label>
            <input
              type="text"
              value={settings.aiox_engine_url}
              onChange={(e) => handleSettingChange('aiox_engine_url', e.target.value)}
              placeholder="http://localhost:4002"
              className="w-full bg-black/50 border border-gray-800 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
            />
            <p className="text-xs text-gray-400 mt-2">
              Deixe em branco para usar o padrão (localhost:4002)
            </p>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.auto_sync}
              onChange={(e) => handleSettingChange('auto_sync', e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm font-medium">Sincronização automática</span>
          </label>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-gray-900 border border-gray-800 rounded p-6">
        <h2 className="text-xl font-bold mb-4">Notificações</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.notifications_enabled}
            onChange={(e) => handleSettingChange('notifications_enabled', e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm font-medium">Habilitar notificações</span>
        </label>
      </div>

      {/* Appearance */}
      <div className="bg-gray-900 border border-gray-800 rounded p-6">
        <h2 className="text-xl font-bold mb-4">Aparência</h2>
        <div>
          <label className="block text-sm font-medium mb-2">Tema</label>
          <select
            value={settings.theme}
            onChange={(e) => handleSettingChange('theme', e.target.value)}
            className="w-full bg-black/50 border border-gray-800 rounded px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
          >
            <option value="dark">Escuro (AIOX Cockpit)</option>
            <option value="light">Claro</option>
            <option value="auto">Automático</option>
          </select>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-gray-900 border border-gray-800 rounded p-6">
        <h2 className="text-xl font-bold mb-4">Segurança</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Senha Atual</label>
            <input
              type="password"
              name="currentPassword"
              className="w-full bg-black/50 border border-gray-800 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Nova Senha</label>
            <input
              type="password"
              name="newPassword"
              required
              className="w-full bg-black/50 border border-gray-800 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-600 hover:bg-yellow-700 rounded px-4 py-2 font-medium transition"
          >
            Alterar Senha
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-900/20 border border-red-700 rounded p-6">
        <h2 className="text-xl font-bold mb-4 text-red-300">Zona de Perigo</h2>
        <p className="text-sm text-gray-400 mb-4">Essas ações não podem ser desfeitas.</p>
        <button
          onClick={handleDeleteAccount}
          className="w-full bg-red-900 hover:bg-red-800 text-red-200 rounded px-4 py-2 font-medium transition"
        >
          Deletar Conta
        </button>
      </div>
    </div>
  )
}

export default Settings
