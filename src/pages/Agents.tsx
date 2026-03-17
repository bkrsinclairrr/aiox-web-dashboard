import { useEffect, useState } from 'react'
import { aiox, AIOXAgent } from '../lib/aiox'

function Agents() {
  const [agents, setAgents] = useState<AIOXAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    loadAgents()
    const interval = setInterval(loadAgents, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadAgents = async () => {
    try {
      setLoading(true)
      const res = await aiox.getAgents()
      setAgents(res.data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar agentes')
    } finally {
      setLoading(false)
    }
  }

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || agent.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-900/30 text-green-300 border border-green-700'
      case 'inactive':
        return 'bg-gray-900/30 text-gray-300 border border-gray-700'
      case 'error':
        return 'bg-red-900/30 text-red-300 border border-red-700'
      default:
        return 'bg-gray-900/30 text-gray-300 border border-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return '🟢'
      case 'inactive':
        return '⚪'
      case 'error':
        return '🔴'
      default:
        return '⚪'
    }
  }

  const handleExecuteAgent = async (agentId: string) => {
    try {
      await aiox.executeAgent(agentId, {})
      alert('Agente executado com sucesso!')
      loadAgents()
    } catch (err: any) {
      alert('Erro ao executar agente: ' + err.message)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Agentes</h1>
        <p className="text-gray-400 mt-2">Gerenciar e monitorar seus agentes IA</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded px-4 py-3 text-red-200">
          ⚠️ {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Buscar agentes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-gray-900 border border-gray-800 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
        >
          <option value="all">Todos os Status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
          <option value="error">Com Erro</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <div className="text-gray-400 text-sm">Total</div>
          <div className="text-3xl font-bold mt-2">{agents.length}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <div className="text-gray-400 text-sm">Ativos</div>
          <div className="text-3xl font-bold text-green-400 mt-2">
            {agents.filter(a => a.status === 'active').length}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <div className="text-gray-400 text-sm">Com Erro</div>
          <div className="text-3xl font-bold text-red-400 mt-2">
            {agents.filter(a => a.status === 'error').length}
          </div>
        </div>
      </div>

      {/* Agents List */}
      <div className="space-y-4">
        {loading && filteredAgents.length === 0 ? (
          <p className="text-gray-400">Carregando agentes...</p>
        ) : filteredAgents.length === 0 ? (
          <p className="text-gray-400">Nenhum agente encontrado</p>
        ) : (
          filteredAgents.map(agent => (
            <div key={agent.id} className="bg-gray-900 border border-gray-800 rounded p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{getStatusIcon(agent.status)}</div>
                  <div>
                    <h3 className="text-xl font-bold">{agent.name}</h3>
                    <p className="text-gray-400 mt-1">{agent.description}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(agent.status)}`}>
                  {agent.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                {agent.lastRun && (
                  <div className="text-sm text-gray-400">
                    Última execução: <span className="text-white">{new Date(agent.lastRun).toLocaleString('pt-BR')}</span>
                  </div>
                )}
                <button
                  onClick={() => handleExecuteAgent(agent.id)}
                  disabled={agent.status !== 'active'}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 disabled:text-gray-500 rounded font-medium transition"
                >
                  Executar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Agents
