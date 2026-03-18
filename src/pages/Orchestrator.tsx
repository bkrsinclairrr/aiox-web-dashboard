import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { aiox, AIOXSquad, AIOXAgent, AIOXJob, JobStatus } from '../lib/aiox'

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: string }> = {
  pending:   { label: 'Na Fila',    cls: 'bg-yellow-900/40 text-yellow-300 border-yellow-700',  icon: '⏳' },
  running:   { label: 'Rodando',   cls: 'bg-blue-900/40 text-blue-300 border-blue-700',         icon: '▶' },
  done:      { label: 'Concluído', cls: 'bg-green-900/40 text-green-300 border-green-700',      icon: '✅' },
  failed:    { label: 'Falhou',    cls: 'bg-red-900/40 text-red-300 border-red-700',            icon: '❌' },
  timeout:   { label: 'Timeout',   cls: 'bg-orange-900/40 text-orange-300 border-orange-700',   icon: '⏰' },
  rejected:  { label: 'Rejeitado', cls: 'bg-gray-800 text-gray-400 border-gray-700',            icon: '🚫' },
  cancelled: { label: 'Cancelado', cls: 'bg-gray-800 text-gray-400 border-gray-700',            icon: '⛔' },
}

function Orchestrator() {
  const [squads, setSquads]     = useState<AIOXSquad[]>([])
  const [agents, setAgents]     = useState<AIOXAgent[]>([])
  const [engineError, setEngineError] = useState<string | null>(null)

  // Form
  const [task, setTask]               = useState('')
  const [squadId, setSquadId]         = useState('')
  const [agentId, setAgentId]         = useState('')
  const [priority, setPriority]       = useState<'low' | 'normal' | 'high'>('normal')
  const [submitting, setSubmitting]   = useState(false)

  // Active job
  const [activeJob, setActiveJob]     = useState<AIOXJob | null>(null)
  const [jobLogs, setJobLogs]         = useState<string[]>([])
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)

  // Recent jobs sidebar
  const [recentJobs, setRecentJobs]   = useState<AIOXJob[]>([])

  const loadRegistry = async () => {
    try {
      const [sq, ag] = await Promise.all([aiox.getSquads(), aiox.getAgentsBySquad()])
      setSquads(sq.squads)
      setAgents(ag.agents)
      setEngineError(null)
    } catch (err: any) {
      setEngineError(err.message)
    }
  }

  const loadRecentJobs = async () => {
    try {
      const res = await aiox.getJobs({ limit: 15 })
      setRecentJobs(res.jobs)
    } catch {}
  }

  useEffect(() => {
    loadRegistry()
    loadRecentJobs()
    const id = setInterval(loadRecentJobs, 10000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [jobLogs])

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  const agentsInSquad = agents.filter(a => !squadId || a.squadId === squadId)

  const startPollJob = (jobId: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const job = await aiox.getJob(jobId)
        setActiveJob(job)

        const logsRes = await aiox.getJobLogs(jobId, 200)
        setJobLogs(logsRes.logs)

        if (job.status === 'done' || job.status === 'failed' || job.status === 'timeout' || job.status === 'cancelled') {
          clearInterval(pollRef.current!)
          loadRecentJobs()
        }
      } catch {}
    }, 1500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task.trim() || !squadId || !agentId) return
    if (pollRef.current) clearInterval(pollRef.current)
    setSubmitting(true)
    setActiveJob(null)
    setJobLogs([])

    try {
      const res = await aiox.execute({ squadId, agentId, message: task.trim() })
      const job = await aiox.getJob(res.executionId).catch(() => null)
      if (job) setActiveJob(job)
      startPollJob(res.executionId)
    } catch (err: any) {
      setEngineError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async () => {
    if (!activeJob) return
    try {
      await aiox.cancelExecution(activeJob.id)
      if (pollRef.current) clearInterval(pollRef.current)
      const updated = await aiox.getJob(activeJob.id)
      setActiveJob(updated)
      loadRecentJobs()
    } catch (err: any) {
      alert('Erro ao cancelar: ' + err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Orquestrador</h1>
        <p className="text-gray-400 mt-2">Execute tarefas nos agentes e acompanhe em tempo real</p>
      </div>

      {engineError && (
        <div className="bg-red-900/30 border border-red-700 rounded px-4 py-3 text-red-200">
          ⚠️ {engineError} — <Link to="/settings" className="text-yellow-400 underline">configurar engine</Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form + Active Job */}
        <div className="lg:col-span-2 space-y-5">
          {/* Task Form */}
          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded p-6 space-y-4">
            <h2 className="text-lg font-bold">Nova Tarefa</h2>

            {/* Squad + Agent */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Squad</label>
                <select
                  value={squadId}
                  onChange={e => { setSquadId(e.target.value); setAgentId('') }}
                  className="w-full bg-black/50 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                  disabled={submitting}
                >
                  <option value="">Selecione um squad...</option>
                  {squads.map(s => <option key={s.id} value={s.id}>{s.name || s.id}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Agente</label>
                <select
                  value={agentId}
                  onChange={e => setAgentId(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                  disabled={!squadId || submitting}
                >
                  <option value="">Selecione um agente...</option>
                  {agentsInSquad.map(a => <option key={a.id} value={a.id}>{a.name || a.id}</option>)}
                </select>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Prioridade</label>
              <div className="flex gap-2">
                {(['low', 'normal', 'high'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-1.5 rounded text-sm font-medium border transition ${
                      priority === p
                        ? p === 'high' ? 'bg-red-900/50 text-red-300 border-red-700'
                          : p === 'low' ? 'bg-gray-800 text-gray-300 border-gray-600'
                          : 'bg-yellow-900/50 text-yellow-300 border-yellow-700'
                        : 'bg-black/30 text-gray-500 border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    {p === 'low' ? '🔽 Baixa' : p === 'normal' ? '➡ Normal' : '🔺 Alta'}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tarefa / Mensagem</label>
              <textarea
                value={task}
                onChange={e => setTask(e.target.value)}
                rows={5}
                className="w-full bg-black/50 border border-gray-700 rounded px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 resize-none font-mono text-sm"
                placeholder="Descreva o que o agente deve executar..."
                disabled={submitting}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || !task.trim() || !squadId || !agentId}
                className="flex-1 py-2.5 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 disabled:text-gray-500 rounded font-medium transition"
              >
                {submitting ? '⏳ Enviando...' : '▶ Executar Tarefa'}
              </button>
              {activeJob && activeJob.status === 'running' && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-5 py-2.5 bg-red-900/50 hover:bg-red-800 border border-red-700 rounded font-medium transition"
                >
                  ⛔ Cancelar
                </button>
              )}
            </div>
          </form>

          {/* Active Job Output */}
          {activeJob && (
            <div className="bg-gray-900 border border-gray-800 rounded p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">Job Ativo</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${STATUS_CONFIG[activeJob.status]?.cls ?? 'bg-gray-800 text-gray-300 border-gray-700'}`}>
                  {STATUS_CONFIG[activeJob.status]?.icon} {STATUS_CONFIG[activeJob.status]?.label ?? activeJob.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-mono">{activeJob.id}</p>

              {/* Logs */}
              <div className="bg-black/60 border border-gray-800 rounded p-3 max-h-64 overflow-y-auto">
                {jobLogs.length === 0 ? (
                  <p className="text-gray-500 text-xs">{activeJob.status === 'pending' ? 'Aguardando processamento...' : 'Sem logs disponíveis.'}</p>
                ) : (
                  <pre className="text-xs font-mono text-green-300 whitespace-pre-wrap">
                    {jobLogs.join('\n')}
                  </pre>
                )}
                <div ref={logsEndRef} />
              </div>

              {activeJob.output_result && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Resultado Final:</p>
                  <pre className="bg-black/60 border border-green-900 rounded p-3 text-sm text-green-200 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {activeJob.output_result}
                  </pre>
                </div>
              )}
              {activeJob.error_message && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Erro:</p>
                  <pre className="bg-black/60 border border-red-900 rounded p-3 text-sm text-red-300 whitespace-pre-wrap">
                    {activeJob.error_message}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Recent Jobs Sidebar */}
        <div className="bg-gray-900 border border-gray-800 rounded p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Jobs Recentes</h2>
            <Link to="/history" className="text-xs text-yellow-400 hover:underline">Ver todos</Link>
          </div>
          {recentJobs.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhum job ainda.</p>
          ) : (
            <div className="space-y-2">
              {recentJobs.map(job => {
                const st = STATUS_CONFIG[job.status] ?? { label: job.status, cls: 'bg-gray-800 text-gray-300 border-gray-700', icon: '⚪' }
                const isActive = activeJob?.id === job.id
                return (
                  <div
                    key={job.id}
                    className={`p-3 rounded border text-sm transition ${isActive ? 'border-yellow-600 bg-yellow-900/10' : 'border-gray-800 bg-black/30'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-xs border ${st.cls}`}>{st.icon} {st.label}</span>
                    </div>
                    <div className="text-white text-xs truncate font-medium">{job.agent_id}</div>
                    <div className="text-gray-500 text-xs">{job.squad_id}</div>
                    <div className="flex gap-1 mt-2">
                      {(job.status === 'failed' || job.status === 'timeout') && (
                        <button
                          onClick={async () => { await aiox.retryJob(job.id); loadRecentJobs() }}
                          className="flex-1 py-1 bg-blue-900/40 hover:bg-blue-800 border border-blue-700 rounded text-xs transition"
                        >
                          🔁 Retentar
                        </button>
                      )}
                      {job.status === 'running' && (
                        <button
                          onClick={async () => { await aiox.cancelExecution(job.id); loadRecentJobs() }}
                          className="flex-1 py-1 bg-red-900/40 hover:bg-red-800 border border-red-700 rounded text-xs transition"
                        >
                          ⛔ Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Orchestrator
