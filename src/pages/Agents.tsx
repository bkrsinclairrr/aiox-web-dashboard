import { useEffect, useState, useRef } from 'react'
import { aiox, AIOXSquad, AIOXAgent, AIOXJob, ExecuteParams } from '../lib/aiox'

const JOB_STATUS_CLS: Record<string, string> = {
  pending:   'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  running:   'bg-blue-900/40 text-blue-300 border-blue-700',
  done:      'bg-green-900/40 text-green-300 border-green-700',
  failed:    'bg-red-900/40 text-red-300 border-red-700',
  cancelled: 'bg-gray-800 text-gray-400 border-gray-700',
  rejected:  'bg-gray-800 text-gray-400 border-gray-700',
}

function ExecuteModal({
  agent, squad, onClose,
}: {
  agent: AIOXAgent; squad: AIOXSquad; onClose: () => void
}) {
  const [message, setMessage] = useState('')
  const [job, setJob] = useState<AIOXJob | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await aiox.execute({
        squadId: squad.id,
        agentId: agent.id,
        message: message.trim(),
      })
      // Poll for job status
      pollRef.current = setInterval(async () => {
        try {
          const status = await aiox.getExecution(res.executionId)
          if (status.status === 'completed' || status.status === 'failed') {
            clearInterval(pollRef.current!)
            // Fetch full job details
            const fullJob = await aiox.getJob(res.executionId).catch(() => null)
            setJob(fullJob ?? {
              id: res.executionId,
              squad_id: squad.id,
              agent_id: agent.id,
              status: status.status === 'completed' ? 'done' : 'failed',
              input_payload: { message },
              output_result: status.result,
              error_message: status.error,
              created_at: new Date().toISOString(),
              trigger_type: 'gui',
            })
            setSubmitting(false)
          }
        } catch {}
      }, 1500)
    } catch (err: any) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold">{agent.name || agent.id}</h3>
              <p className="text-sm text-gray-400 mt-1">{squad.name || squad.id} Â· {agent.role || 'agente'}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">Ã—</button>
          </div>

          {!job ? (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Mensagem / Tarefa</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={4}
                  className="w-full bg-black/50 border border-gray-700 rounded px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 resize-none"
                  placeholder="Descreva o que o agente deve fazer..."
                  disabled={submitting}
                />
              </div>
              {error && <p className="text-red-400 text-sm">âš ï¸ {error}</p>}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting || !message.trim()}
                  className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 disabled:text-gray-500 rounded font-medium transition"
                >
                  {submitting ? 'â³ Executando...' : 'â–¶ Executar'}
                </button>
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition">
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className={`px-3 py-1 rounded text-sm font-medium inline-flex items-center gap-2 border ${JOB_STATUS_CLS[job.status] ?? 'bg-gray-800 text-gray-300 border-gray-600'}`}>
                {job.status === 'done' ? 'âœ…' : job.status === 'failed' ? 'âŒ' : 'âšª'} {job.status.toUpperCase()}
              </div>
              {job.output_result && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Resultado:</p>
                  <pre className="bg-black/60 border border-gray-800 rounded p-3 text-sm text-green-300 whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {job.output_result}
                  </pre>
                </div>
              )}
              {job.error_message && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Erro:</p>
                  <pre className="bg-black/60 border border-red-900 rounded p-3 text-sm text-red-300 whitespace-pre-wrap">
                    {job.error_message}
                  </pre>
                </div>
              )}
              <button onClick={onClose} className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded font-medium transition">
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Agents() {
  const [squads, setSquads] = useState<AIOXSquad[]>([])
  const [agents, setAgents] = useState<AIOXAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSquad, setSelectedSquad] = useState<string>('all')
  const [executing, setExecuting] = useState<{ agent: AIOXAgent; squad: AIOXSquad } | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      const [squadsRes, agentsRes] = await Promise.all([
        aiox.getSquads(),
        aiox.getAgentsBySquad(),
      ])
      setSquads(squadsRes.squads)
      setAgents(agentsRes.agents)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com o engine')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filteredAgents = agents.filter(agent => {
    const matchSearch = !searchTerm ||
      (agent.name || agent.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.role || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchSquad = selectedSquad === 'all' || agent.squadId === selectedSquad
    return matchSearch && matchSquad
  })

  const getSquad = (squadId: string) => squads.find(s => s.id === squadId)

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold">Agentes</h1>
          <p className="text-gray-400 mt-2">Todos os agentes disponÃ­veis nos squads</p>
        </div>
        <button onClick={load} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition">
          ðŸ”„ Atualizar
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded px-4 py-3 text-red-200">
          âš ï¸ {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <div className="text-gray-400 text-sm">Total de Agentes</div>
          <div className="text-3xl font-bold mt-2">{agents.length}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <div className="text-gray-400 text-sm">Squads</div>
          <div className="text-3xl font-bold text-purple-400 mt-2">{squads.length}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <div className="text-gray-400 text-sm">Filtrados</div>
          <div className="text-3xl font-bold text-yellow-400 mt-2">{filteredAgents.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar agentes..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 bg-gray-900 border border-gray-800 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
        />
        <select
          value={selectedSquad}
          onChange={e => setSelectedSquad(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
        >
          <option value="all">Todos os Squads</option>
          {squads.map(s => (
            <option key={s.id} value={s.id}>{s.name || s.id}</option>
          ))}
        </select>
      </div>

      {/* Agent Cards */}
      {loading && agents.length === 0 ? (
        <p className="text-gray-400">Carregando agentes...</p>
      ) : filteredAgents.length === 0 ? (
        <p className="text-gray-400">Nenhum agente encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAgents.map(agent => {
            const squad = getSquad(agent.squadId)
            return (
              <div key={`${agent.squadId}/${agent.id}`} className="bg-gray-900 border border-gray-800 rounded p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-white">{agent.name || agent.id}</h3>
                    {agent.role && <p className="text-yellow-400 text-xs mt-0.5 uppercase tracking-wide">{agent.role}</p>}
                    {agent.description && <p className="text-gray-400 text-sm mt-1 line-clamp-2">{agent.description}</p>}
                  </div>
                  <div className="text-green-400 text-xl ml-3">ðŸ¤–</div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                  <span className="text-xs text-purple-400 bg-purple-900/30 border border-purple-700 px-2 py-0.5 rounded">
                    {squad?.name || agent.squadId}
                  </span>
                  <button
                    onClick={() => squad && setExecuting({ agent, squad })}
                    className="px-4 py-1.5 bg-yellow-600 hover:bg-yellow-700 rounded text-sm font-medium transition"
                  >
                    â–¶ Executar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {executing && (
        <ExecuteModal
          agent={executing.agent}
          squad={executing.squad}
          onClose={() => setExecuting(null)}
        />
      )}
    </div>
  )
}

export default Agents
