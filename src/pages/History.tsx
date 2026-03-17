import { useEffect, useState } from 'react'
import { aiox, AIOXEvent } from '../lib/aiox'

function History() {
  const [events, setEvents] = useState<AIOXEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterAgent, setFilterAgent] = useState<string>('all')
  const [agents, setAgents] = useState<string[]>([])

  useEffect(() => {
    loadEvents()
    const interval = setInterval(loadEvents, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const res = await aiox.getEvents(100)
      setEvents(res.data)
      const uniqueAgents = [...new Set(res.data.map(e => e.agent))]
      setAgents(uniqueAgents)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar eventos')
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.agent.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus
    const matchesAgent = filterAgent === 'all' || event.agent === filterAgent
    return matchesSearch && matchesStatus && matchesAgent
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-900/30 text-green-300 border border-green-700'
      case 'error':
        return 'bg-red-900/30 text-red-300 border border-red-700'
      case 'pending':
        return 'bg-yellow-900/30 text-yellow-300 border border-yellow-700'
      default:
        return 'bg-gray-900/30 text-gray-300 border border-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'pending':
        return '⏳'
      default:
        return '⚪'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Histórico</h1>
        <p className="text-gray-400 mt-2">Auditoria e histórico de eventos do AIOX</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded px-4 py-3 text-red-200">
          ⚠️ {error}
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Buscar eventos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
        >
          <option value="all">Todos os Status</option>
          <option value="success">Sucesso</option>
          <option value="error">Erro</option>
          <option value="pending">Pendente</option>
        </select>
        <select
          value={filterAgent}
          onChange={(e) => setFilterAgent(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
        >
          <option value="all">Todos os Agentes</option>
          {agents.map(agent => (
            <option key={agent} value={agent}>
              {agent}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <div className="text-gray-400 text-sm">Total de Eventos</div>
          <div className="text-3xl font-bold mt-2">{events.length}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <div className="text-gray-400 text-sm">Sucessos</div>
          <div className="text-3xl font-bold text-green-400 mt-2">
            {events.filter(e => e.status === 'success').length}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <div className="text-gray-400 text-sm">Erros</div>
          <div className="text-3xl font-bold text-red-400 mt-2">
            {events.filter(e => e.status === 'error').length}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <div className="text-gray-400 text-sm">Pendentes</div>
          <div className="text-3xl font-bold text-yellow-400 mt-2">
            {events.filter(e => e.status === 'pending').length}
          </div>
        </div>
      </div>

      {/* Events Timeline */}
      <div className="bg-gray-900 border border-gray-800 rounded p-6">
        <h2 className="text-xl font-bold mb-4">Timeline de Eventos</h2>
        {loading && filteredEvents.length === 0 ? (
          <p className="text-gray-400">Carregando eventos...</p>
        ) : filteredEvents.length === 0 ? (
          <p className="text-gray-400">Nenhum evento encontrado</p>
        ) : (
          <div className="space-y-3 max-h-[800px] overflow-y-auto">
            {filteredEvents.map(event => (
              <div
                key={event.id}
                className="flex items-start gap-4 p-4 bg-black/50 rounded border border-gray-800 hover:border-gray-700 transition"
              >
                <div className="text-2xl flex-shrink-0 pt-1">{getStatusIcon(event.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm bg-black/50 px-2 py-1 rounded">{event.type}</span>
                    <span className="text-gray-400 text-sm">em</span>
                    <span className="font-medium">{event.agent}</span>
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    {new Date(event.timestamp).toLocaleString('pt-BR')}
                  </div>
                  {Object.keys(event.data).length > 0 && (
                    <details className="mt-2 text-xs">
                      <summary className="cursor-pointer text-gray-500 hover:text-gray-300">
                        Detalhes ({Object.keys(event.data).length} campos)
                      </summary>
                      <pre className="mt-2 bg-black/50 p-2 rounded overflow-x-auto text-gray-300">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
                <span className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap flex-shrink-0 ${getStatusColor(event.status)}`}>
                  {event.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default History
