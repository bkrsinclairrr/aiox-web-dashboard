import React, { useEffect, useState } from 'react'
import { aiox, AIOXEvent, AIOXAgent } from '../lib/aiox'
import { supabase } from '../lib/supabase'

function Dashboard() {
  const [events, setEvents] = useState<AIOXEvent[]>([])
  const [agents, setAgents] = useState<AIOXAgent[]>([])
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [eventsRes, agentsRes, metricsRes] = await Promise.all([
        aiox.getEvents(20),
        aiox.getAgents(),
        aiox.getMetrics(),
      ])

      setEvents(eventsRes.data)
      setAgents(agentsRes.data)
      setMetrics(metricsRes.data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-900 text-green-200'
      case 'error':
        return 'bg-red-900 text-red-200'
      case 'pending':
        return 'bg-yellow-900 text-yellow-200'
      default:
        return 'bg-gray-900 text-gray-200'
    }
  }

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400'
      case 'inactive':
        return 'text-gray-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-gray-400 mt-2">Monitoramento em tempo real do AIOX Engine</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded px-4 py-3 text-red-200">
          ⚠️ {error}
        </div>
      )}

      {/* Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded p-4">
            <div className="text-gray-400 text-sm">Total de Agentes</div>
            <div className="text-3xl font-bold mt-2">{agents.length}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-4">
            <div className="text-gray-400 text-sm">Agentes Ativos</div>
            <div className="text-3xl font-bold text-green-400 mt-2">
              {agents.filter(a => a.status === 'active').length}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-4">
            <div className="text-gray-400 text-sm">Eventos Hoje</div>
            <div className="text-3xl font-bold mt-2">{events.length}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-4">
            <div className="text-gray-400 text-sm">Taxa de Sucesso</div>
            <div className="text-3xl font-bold text-green-400 mt-2">
              {events.length > 0
                ? Math.round((events.filter(e => e.status === 'success').length / events.length) * 100)
                : 0}
              %
            </div>
          </div>
        </div>
      )}

      {/* Events Timeline */}
      <div className="bg-gray-900 border border-gray-800 rounded p-6">
        <h2 className="text-xl font-bold mb-4">Últimos Eventos</h2>
        {loading && !events.length ? (
          <p className="text-gray-400">Carregando eventos...</p>
        ) : events.length === 0 ? (
          <p className="text-gray-400">Nenhum evento disponível</p>
        ) : (
          <div className="space-y-3">
            {events.map(event => (
              <div key={event.id} className="flex items-start gap-4 p-3 bg-black/50 rounded border border-gray-800">
                <div className={`px-3 py-1 rounded text-sm font-medium whitespace-nowrap ${getStatusColor(event.status)}`}>
                  {event.type}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white">{event.agent}</div>
                  <div className="text-sm text-gray-400">{new Date(event.timestamp).toLocaleString('pt-BR')}</div>
                </div>
                <div className={`text-sm font-medium ${getStatusColor(event.status)}`}>
                  {event.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Agents */}
      <div className="bg-gray-900 border border-gray-800 rounded p-6">
        <h2 className="text-xl font-bold mb-4">Agentes Ativos</h2>
        {loading && !agents.length ? (
          <p className="text-gray-400">Carregando agentes...</p>
        ) : agents.length === 0 ? (
          <p className="text-gray-400">Nenhum agente disponível</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.slice(0, 6).map(agent => (
              <div key={agent.id} className="p-4 bg-black/50 rounded border border-gray-800">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-white">{agent.name}</div>
                    <div className="text-sm text-gray-400 mt-1">{agent.description}</div>
                  </div>
                  <div className={`text-xl ${getAgentStatusColor(agent.status)}`}>●</div>
                </div>
                {agent.lastRun && (
                  <div className="text-xs text-gray-500 mt-3">
                    Última execução: {new Date(agent.lastRun).toLocaleString('pt-BR')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
