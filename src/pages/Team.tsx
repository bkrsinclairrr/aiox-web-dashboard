import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface TeamMember {
  id: string
  email: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
}

function Team() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    loadTeam()
    loadCurrentUser()
  }, [])

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const loadTeam = async () => {
    try {
      setLoading(true)
      // In a real app, this would fetch from Supabase
      // For now, we'll show a placeholder
      setMembers([])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar time')
    } finally {
      setLoading(false)
    }
  }

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // In a real app, this would create an invitation in Supabase
      alert(`Convite enviado para ${inviteEmail}`)
      setInviteEmail('')
      setInviteRole('member')
    } catch (err: any) {
      alert('Erro ao enviar convite: ' + err.message)
    }
  }

  const handleRemoveMember = async (_memberId: string) => {
    if (window.confirm('Tem certeza que deseja remover este membro?')) {
      try {
        // In a real app, this would update Supabase
        alert('Membro removido')
        loadTeam()
      } catch (err: any) {
        alert('Erro ao remover membro: ' + err.message)
      }
    }
  }

  const handleChangeRole = async (_memberId: string, newRole: string) => {
    try {
      // In a real app, this would update Supabase
      alert(`Role do membro alterado para ${newRole}`)
      loadTeam()
    } catch (err: any) {
      alert('Erro ao alterar role: ' + err.message)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Time</h1>
        <p className="text-gray-400 mt-2">Gerenciamento de membros da equipe e permissões</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded px-4 py-3 text-red-200">
          ⚠️ {error}
        </div>
      )}

      {/* Invite Form */}
      <div className="bg-gray-900 border border-gray-800 rounded p-6">
        <h2 className="text-xl font-bold mb-4">Convidar Novo Membro</h2>
        <form onSubmit={handleSendInvite} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="email"
              placeholder="Email do membro"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              className="bg-black/50 border border-gray-800 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
              className="bg-black/50 border border-gray-800 rounded px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
            >
              <option value="member">Membro</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              className="bg-yellow-600 hover:bg-yellow-700 rounded px-4 py-2 font-medium transition"
            >
              Enviar Convite
            </button>
          </div>
        </form>
      </div>

      {/* Members List */}
      <div className="bg-gray-900 border border-gray-800 rounded p-6">
        <h2 className="text-xl font-bold mb-4">Membros ({members.length})</h2>
        {loading ? (
          <p className="text-gray-400">Carregando membros...</p>
        ) : members.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-2">Nenhum membro no time ainda</p>
            <p className="text-sm text-gray-500">Use o formulário acima para convidar membros</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map(member => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-black/50 rounded border border-gray-800">
                <div>
                  <div className="font-medium">{member.email}</div>
                  <div className="text-sm text-gray-400">
                    Entrou em {new Date(member.joinedAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={member.role}
                    onChange={(e) => handleChangeRole(member.id, e.target.value)}
                    disabled={member.email === currentUser?.email}
                    className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-yellow-400 disabled:opacity-50"
                  >
                    <option value="member">Membro</option>
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                  </select>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={member.email === currentUser?.email}
                    className="px-4 py-1 bg-red-900/30 hover:bg-red-900/50 text-red-300 rounded text-sm transition disabled:opacity-50"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team Settings */}
      <div className="bg-gray-900 border border-gray-800 rounded p-6">
        <h2 className="text-xl font-bold mb-4">Configurações do Time</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nome do Time</label>
            <input
              type="text"
              placeholder="Nome do seu time"
              defaultValue=""
              className="w-full bg-black/50 border border-gray-800 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Descrição</label>
            <textarea
              placeholder="Descreva seu time..."
              rows={4}
              className="w-full bg-black/50 border border-gray-800 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
            />
          </div>
          <button className="bg-yellow-600 hover:bg-yellow-700 rounded px-6 py-2 font-medium transition">
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  )
}

export default Team
