import { useEffect, useState } from 'react'
import { aiox, AIOXJob, JobStatus } from '../lib/aiox'

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: string }> = {
  pending:   { label: 'Na Fila',    cls: 'bg-yellow-900/40 text-yellow-300 border-yellow-700',  icon: 'â³' },
  running:   { label: 'Rodando',   cls: 'bg-blue-900/40 text-blue-300 border-blue-700',         icon: 'â–¶' },
  done:      { label: 'ConcluÃ­do', cls: 'bg-green-900/40 text-green-300 border-green-700',      icon: 'âœ…' },
  failed:    { label: 'Falhou',    cls: 'bg-red-900/40 text-red-300 border-red-700',            icon: 'âŒ' },
  timeout:   { label: 'Timeout',   cls: 'bg-orange-900/40 text-orange-300 border-orange-700',   icon: 'â°' },
  rejected:  { label: 'Rejeitado', cls: 'bg-gray-800 text-gray-400 border-gray-700',            icon: 'ðŸš«' },
  cancelled: { label: 'Cancelado', cls: 'bg-gray-800 text-gray-400 border-gray-700',            icon: 'â›”' },
}

const FILTER_TABS: Array<{ key: string; label: string }> = [
  { key: 'all',       label: 'Todos' },
  { key: 'running',   label: 'Rodando' },
  { key: 'pending',   label: 'Na Fila' },
  { key: 'done',      label: 'ConcluÃ­dos' },
  { key: 'failed',    label: 'Falhou' },
]

function LogsModal({ jobId, onClose }: { jobId: string; onClose: () => void }) {
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    aiox.getJobLogs(jobId, 500)
      .then(r => setLogs(r.logs))
      .catch(() => setLogs(['Erro ao carregar logs.']))
      .finally(() => setLoading(false))
  }, [jobId])

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-3xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="font-bold">Logs do Job <span className="text-gray-400 font-mono text-sm">{jobId.slice(0, 12)}â€¦</span></h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">Ã—</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="text-gray-400">Carregando logs...</p>
          ) : logs.length === 0 ? (
            <p className="text-gray-400">Nenhum log disponÃ­vel.</p>
          ) : (
            <pre className="text-xs text-green-300 whitespace-pre-wrap font-mono leading-relaxed">
              {logs.join('\n')}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}

function History() {
  const [jobs, setJobs] = useState<AIOXJob[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [logsJobId, setLogsJobId] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const pageSize = 20

  const load = async () => {
    try {
      setLoading(true)
      const res = await aiox.getJobs({
        status: activeTab === 'all' ? undefined : (activeTab as JobStatus),
        limit: pageSize,
        offset: page * pageSize,
      })
      setJobs(res.jobs)
      setTotal(res.total)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar histÃ³rico')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(0)
  }, [activeTab])

  useEffect(() => {
    load()
    const id = setInterval(load, 8000)
    return () => clearInterval(id)
  }, [activeTab, page])

  const handleRetry = async (jobId: string) => {
    try {
      await aiox.retryJob(jobId)
      load()
    } catch (err: any) {
      alert('Erro ao retentar: ' + err.message)
    }
  }

  const filteredJobs = jobs.filter(job => {
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    return job.squad_id.includes(q) || job.agent_id.includes(q) || job.id.includes(q)
  })

  const formatDuration = (job: AIOXJob) => {
    if (!job.started_at || !job.completed_at) return null
    const ms = new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold">HistÃ³rico</h1>
          <p className="text-gray-400 mt-2">Todos os jobs executados â€¢ {total} total</p>
        </div>
        <button onClick={load} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition">
          ðŸ”„ Atualizar
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded px-4 py-3 text-red-200">âš ï¸ {error}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded p-1 overflow-x-auto">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition ${
              activeTab === tab.key
                ? 'bg-yellow-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Buscar por squad, agente ou job ID..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full bg-gray-900 border border-gray-800 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
      />

      {/* Jobs Table */}
      {loading && filteredJobs.length === 0 ? (
        <p className="text-gray-400">Carregando...</p>
      ) : filteredJobs.length === 0 ? (
        <p className="text-gray-400">Nenhum job encontrado.</p>
      ) : (
        <div className="space-y-2">
          {filteredJobs.map(job => {
            const st = STATUS_CONFIG[job.status] ?? { label: job.status, cls: 'bg-gray-800 text-gray-300 border-gray-700', icon: 'âšª' }
            const duration = formatDuration(job)
            return (
              <div key={job.id} className="bg-gray-900 border border-gray-800 rounded p-4">
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border whitespace-nowrap mt-0.5 ${st.cls}`}>
                    {st.icon} {st.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white">{job.agent_id}</span>
                      <span className="text-xs text-purple-400 bg-purple-900/30 border border-purple-700 px-2 py-0.5 rounded">
                        {job.squad_id}
                      </span>
                      {duration && (
                        <span className="text-xs text-gray-500">{duration}</span>
                      )}
                    </div>
                    {job.input_payload?.message && (
                      <p className="text-sm text-gray-400 mt-1 truncate">{job.input_payload.message}</p>
                    )}
                    {job.error_message && (
                      <p className="text-sm text-red-400 mt-1 truncate">âŒ {job.error_message}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-1 font-mono">{job.id}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {new Date(job.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(job.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setLogsJobId(job.id)}
                        className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs transition"
                        title="Ver logs"
                      >
                        ðŸ“‹
                      </button>
                      {(job.status === 'failed' || job.status === 'timeout') && (
                        <button
                          onClick={() => handleRetry(job.id)}
                          className="px-2 py-1 bg-blue-900/50 hover:bg-blue-800 border border-blue-700 rounded text-xs transition"
                          title="Retentar"
                        >
                          ðŸ”
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {job.output_result && job.status === 'done' && (
                  <details className="mt-3">
                    <summary className="text-xs text-gray-400 cursor-pointer hover:text-white">Ver resultado</summary>
                    <pre className="mt-2 bg-black/60 border border-gray-800 rounded p-3 text-xs text-green-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {job.output_result}
                    </pre>
                  </details>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 rounded text-sm transition"
          >
            â† Anterior
          </button>
          <span className="text-gray-400 text-sm">
            PÃ¡gina {page + 1} de {Math.ceil(total / pageSize)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={(page + 1) * pageSize >= total}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 rounded text-sm transition"
          >
            PrÃ³xima â†’
          </button>
        </div>
      )}

      {logsJobId && <LogsModal jobId={logsJobId} onClose={() => setLogsJobId(null)} />}
    </div>
  )
}

export default History
