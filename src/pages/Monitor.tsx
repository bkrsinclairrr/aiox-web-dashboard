import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { aiox, AIOXHealth, AIOXPool, AIOXJob, AIOXCron, JobStatus } from '../lib/aiox'

const STATUS_CLS: Record<string, string> = {
  pending:   'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  running:   'bg-blue-900/40 text-blue-300 border-blue-700 animate-pulse',
  done:      'bg-green-900/40 text-green-300 border-green-700',
  failed:    'bg-red-900/40 text-red-300 border-red-700',
  timeout:   'bg-orange-900/40 text-orange-300 border-orange-700',
  rejected:  'bg-gray-800 text-gray-400 border-gray-700',
  cancelled: 'bg-gray-800 text-gray-400 border-gray-700',
}
const STATUS_LABEL: Record<string, string> = {
  pending: 'Na Fila', running: 'Rodando', done: 'Concluído',
  failed: 'Falhou', timeout: 'Timeout', rejected: 'Rejeitado', cancelled: 'Cancelado',
}

const JOB_TABS: Array<{ key: string; label: string }> = [
  { key: 'all', label: 'Todos' },
  { key: 'running', label: 'Rodando' },
  { key: 'pending', label: 'Na Fila' },
  { key: 'done', label: 'Concluídos' },
  { key: 'failed', label: 'Falhou' },
]

function Monitor() {
  const [health, setHealth]   = useState<AIOXHealth | null>(null)
  const [pool, setPool]       = useState<AIOXPool | null>(null)
  const [jobs, setJobs]       = useState<AIOXJob[]>([])
  const [crons, setCrons]     = useState<AIOXCron[]>([])
  const [error, setError]     = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [jobTab, setJobTab]   = useState('all')
  const [newSize, setNewSize] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      const [h, p, j, c] = await Promise.allSettled([
        aiox.getHealth(),
        aiox.getPool(),
        aiox.getJobs({ limit: 50 }),
        aiox.getCrons(),
      ])
      if (h.status === 'fulfilled') { setHealth(h.value); setError(null) }
      else setError('Engine offline: ' + (h.reason as Error).message)
      if (p.status === 'fulfilled') setPool(p.value)
      if (j.status === 'fulfilled') setJobs(j.value.jobs)
      if (c.status === 'fulfilled') setCrons(c.value.crons)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 5000)
    return () => clearInterval(id)
  }, [])

  const handleResize = async () => {
    const size = parseInt(newSize, 10)
    if (!size || size < 1 || size > 50) return alert('Tamanho inválido (1-50)')
    try {
      await aiox.resizePool(size)
      setNewSize('')
      await load()
    } catch (err: any) {
      alert('Erro: ' + err.message)
    }
  }

  const handleRetry = async (id: string) => {
    try { await aiox.retryJob(id); await load() }
    catch (err: any) { alert('Erro: ' + err.message) }
  }

  const handleCancel = async (id: string) => {
    try { await aiox.cancelExecution(id); await load() }
    catch (err: any) { alert('Erro: ' + err.message) }
  }

  const handleToggleCron = async (id: string) => {
    try { await aiox.toggleCron(id); await load() }
    catch (err: any) { alert('Erro: ' + err.message) }
  }

  const filteredJobs = jobs.filter(j => jobTab === 'all' || j.status === jobTab)

  const formatUptime = (ms: number) => {
    if (ms >= 3600000) return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold">Monitor</h1>
          <p className="text-gray-400 mt-2">Saúde do engine, processos e tarefas agendadas</p>
        </div>
        <button onClick={load} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition">
          🔄 Atualizar
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded px-4 py-3 text-red-200">
          ⚠️ {error} — <Link to="/settings" className="text-yellow-400 underline">Configurar</Link>
        </div>
      )}

      {/* Health + Pool Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded p-5">
          <div className="text-gray-400 text-xs mb-1">STATUS</div>
          <div className={`text-xl font-bold ${health ? 'text-green-400' : 'text-red-400'}`}>
            {health ? '🟢 Online' : '🔴 Offline'}
          </div>
          {health && <div className="text-xs text-gray-500 mt-1">v{health.version}</div>}
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded p-5">
          <div className="text-gray-400 text-xs mb-1">UPTIME</div>
          <div className="text-xl font-bold text-purple-400">{health ? formatUptime(health.uptime_ms) : '—'}</div>
          {health && <div className="text-xs text-gray-500 mt-1">PID {health.pid}</div>}
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded p-5">
          <div className="text-gray-400 text-xs mb-1">PROCESSOS</div>
          <div className="text-xl font-bold text-blue-400">
            {pool ? `${pool.running}/${pool.max_concurrent}` : '—'}
          </div>
          {pool && (
            <div className="mt-2 w-full bg-gray-800 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${(pool.running / pool.max_concurrent) > 0.8 ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(100, (pool.running / Math.max(1, pool.max_concurrent)) * 100)}%` }}
              />
            </div>
          )}
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded p-5">
          <div className="text-gray-400 text-xs mb-1">WS CLIENTS</div>
          <div className="text-xl font-bold text-yellow-400">{health?.ws_clients ?? '—'}</div>
          <div className="text-xs text-gray-500 mt-1">conexões ativas</div>
        </div>
      </div>

      {/* Pool Resize */}
      {pool && (
        <div className="bg-gray-900 border border-gray-800 rounded p-5">
          <h2 className="font-bold mb-3">Redimensionar Pool</h2>
          <div className="flex gap-3 items-center">
            <p className="text-sm text-gray-400">Máximo atual: <span className="text-white font-medium">{pool.max_concurrent}</span></p>
            <input
              type="number"
              value={newSize}
              onChange={e => setNewSize(e.target.value)}
              min={1} max={50}
              placeholder="Novo tamanho..."
              className="w-36 bg-black/50 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
            />
            <button
              onClick={handleResize}
              disabled={!newSize}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 disabled:text-gray-500 rounded font-medium text-sm transition"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}

      {/* Jobs */}
      <div className="bg-gray-900 border border-gray-800 rounded p-5 space-y-4">
        <h2 className="font-bold">Jobs</h2>

        {/* Tabs */}
        <div className="flex gap-1 bg-black/40 rounded p-1 overflow-x-auto">
          {JOB_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setJobTab(tab.key)}
              className={`px-3 py-1.5 rounded text-sm whitespace-nowrap transition ${
                jobTab === tab.key ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.label}
              {tab.key !== 'all' && (
                <span className="ml-1 text-xs opacity-70">
                  {jobs.filter(j => j.status === tab.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading && filteredJobs.length === 0 ? (
          <p className="text-gray-400 text-sm">Carregando...</p>
        ) : filteredJobs.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhum job nesta categoria.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredJobs.map(job => (
              <div key={job.id} className="flex items-center gap-3 p-3 bg-black/40 rounded border border-gray-800 text-sm">
                <span className={`px-2 py-0.5 rounded text-xs font-medium border whitespace-nowrap ${STATUS_CLS[job.status] ?? 'bg-gray-800 text-gray-300 border-gray-700'}`}>
                  {STATUS_LABEL[job.status] ?? job.status}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-white font-medium">{job.agent_id}</span>
                  <span className="text-gray-500 mx-1">·</span>
                  <span className="text-purple-400 text-xs">{job.squad_id}</span>
                </div>
                <span className="text-gray-500 text-xs whitespace-nowrap">
                  {new Date(job.created_at).toLocaleTimeString('pt-BR')}
                </span>
                <div className="flex gap-1">
                  {(job.status === 'failed' || job.status === 'timeout') && (
                    <button onClick={() => handleRetry(job.id)} className="px-2 py-1 bg-blue-900/50 hover:bg-blue-800 border border-blue-700 rounded text-xs transition">🔁</button>
                  )}
                  {job.status === 'running' && (
                    <button onClick={() => handleCancel(job.id)} className="px-2 py-1 bg-red-900/50 hover:bg-red-800 border border-red-700 rounded text-xs transition">⛔</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cron Jobs */}
      <div className="bg-gray-900 border border-gray-800 rounded p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Tarefas Agendadas (Cron)</h2>
          <Link to="/cron" className="text-sm text-yellow-400 hover:underline">Gerenciar →</Link>
        </div>
        {crons.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhuma tarefa agendada.</p>
        ) : (
          <div className="space-y-2">
            {crons.map(cron => (
              <div key={cron.id} className="flex items-center gap-3 p-3 bg-black/40 rounded border border-gray-800 text-sm">
                <div className="flex-1 min-w-0">
                  <span className="text-white font-medium">{cron.agent_id}</span>
                  <span className="text-gray-500 mx-1">·</span>
                  <span className="text-purple-400 text-xs">{cron.squad_id}</span>
                  <div className="text-gray-500 text-xs mt-0.5 font-mono">{cron.schedule}</div>
                  {cron.description && <div className="text-gray-400 text-xs mt-0.5">{cron.description}</div>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {cron.next_run_at && (
                    <span className="text-xs text-gray-500">
                      próx: {new Date(cron.next_run_at).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  <button
                    onClick={() => handleToggleCron(cron.id)}
                    className={`px-3 py-1 rounded text-xs font-medium border transition ${
                      cron.enabled
                        ? 'bg-green-900/40 text-green-300 border-green-700 hover:bg-red-900/40 hover:text-red-300 hover:border-red-700'
                        : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-green-900/40 hover:text-green-300 hover:border-green-700'
                    }`}
                  >
                    {cron.enabled ? '● Ativo' : '○ Pausado'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Monitor
