import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { aiox, AIOXCron, AIOXSquad, AIOXAgent, CreateCronParams } from '../lib/aiox'

const CRON_PRESETS: Array<{ label: string; value: string }> = [
  { label: 'A cada 5 min',  value: '*/5 * * * *' },
  { label: 'A cada 15 min', value: '*/15 * * * *' },
  { label: 'A cada hora',   value: '0 * * * *' },
  { label: 'Diariamente às 9h', value: '0 9 * * *' },
  { label: 'Todo dia útil às 8h', value: '0 8 * * 1-5' },
  { label: 'Toda semana (segunda)', value: '0 9 * * 1' },
]

function CronPage() {
  const [crons, setCrons]     = useState<AIOXCron[]>([])
  const [squads, setSquads]   = useState<AIOXSquad[]>([])
  const [agents, setAgents]   = useState<AIOXAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [formSquad, setFormSquad]   = useState('')
  const [formAgent, setFormAgent]   = useState('')
  const [formSchedule, setFormSchedule] = useState('')
  const [formDesc, setFormDesc]     = useState('')
  const [creating, setCreating]     = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const [cr, sq, ag] = await Promise.allSettled([
        aiox.getCrons(),
        aiox.getSquads(),
        aiox.getAgentsBySquad(),
      ])
      if (cr.status === 'fulfilled') setCrons(cr.value.crons)
      if (sq.status === 'fulfilled') setSquads(sq.value.squads)
      if (ag.status === 'fulfilled') setAgents(ag.value.agents)
      if (cr.status === 'rejected') setError((cr.reason as Error).message)
      else setError(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleToggle = async (id: string) => {
    try { await aiox.toggleCron(id); await load() }
    catch (err: any) { alert('Erro: ' + err.message) }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formSquad || !formAgent || !formSchedule) return
    setCreating(true)
    try {
      const params: CreateCronParams = {
        squadId: formSquad,
        agentId: formAgent,
        schedule: formSchedule,
        description: formDesc || undefined,
      }
      await aiox.createCron(params)
      setShowForm(false)
      setFormSquad(''); setFormAgent(''); setFormSchedule(''); setFormDesc('')
      await load()
    } catch (err: any) {
      alert('Erro ao criar: ' + err.message)
    } finally {
      setCreating(false)
    }
  }

  const agentsInSquad = agents.filter(a => !formSquad || a.squadId === formSquad)

  const formatNextRun = (iso?: string) => {
    if (!iso) return '—'
    const d = new Date(iso)
    const now = new Date()
    const diff = d.getTime() - now.getTime()
    if (diff < 0) return 'Passou'
    if (diff < 60000) return 'Em menos de 1 min'
    if (diff < 3600000) return `Em ${Math.floor(diff / 60000)} min`
    if (diff < 86400000) return `Em ${Math.floor(diff / 3600000)}h`
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold">Tarefas Agendadas</h1>
          <p className="text-gray-400 mt-2">Cron jobs — execute agentes automaticamente</p>
        </div>
        <button
          onClick={() => setShowForm(f => !f)}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded font-medium transition text-sm"
        >
          {showForm ? '✕ Cancelar' : '+ Novo Cron'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded px-4 py-3 text-red-200">
          ⚠️ {error} — <Link to="/settings" className="text-yellow-400 underline">configurar engine</Link>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-900 border border-yellow-700/50 rounded p-6 space-y-4">
          <h2 className="font-bold text-lg">Novo Cron Job</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Squad *</label>
              <select
                value={formSquad}
                onChange={e => { setFormSquad(e.target.value); setFormAgent('') }}
                className="w-full bg-black/50 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                required
              >
                <option value="">Selecione...</option>
                {squads.map(s => <option key={s.id} value={s.id}>{s.name || s.id}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Agente *</label>
              <select
                value={formAgent}
                onChange={e => setFormAgent(e.target.value)}
                disabled={!formSquad}
                className="w-full bg-black/50 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400 disabled:opacity-50"
                required
              >
                <option value="">Selecione...</option>
                {agentsInSquad.map(a => <option key={a.id} value={a.id}>{a.name || a.id}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Agendamento (cron expression) *</label>
            <input
              type="text"
              value={formSchedule}
              onChange={e => setFormSchedule(e.target.value)}
              placeholder="*/15 * * * *"
              className="w-full bg-black/50 border border-gray-700 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-yellow-400"
              required
            />
            {/* Presets */}
            <div className="flex flex-wrap gap-2 mt-2">
              {CRON_PRESETS.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setFormSchedule(p.value)}
                  className={`px-2 py-1 rounded text-xs border transition ${
                    formSchedule === p.value
                      ? 'bg-yellow-600 text-white border-yellow-700'
                      : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Descrição (opcional)</label>
            <input
              type="text"
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
              placeholder="Ex: relatório diário de vendas..."
              className="w-full bg-black/50 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={creating || !formSquad || !formAgent || !formSchedule}
              className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 disabled:text-gray-500 rounded font-medium transition"
            >
              {creating ? '⏳ Criando...' : '✓ Criar Cron Job'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Cron List */}
      {loading && crons.length === 0 ? (
        <p className="text-gray-400">Carregando...</p>
      ) : crons.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded p-8 text-center">
          <div className="text-4xl mb-3">⏰</div>
          <p className="text-gray-400">Nenhum cron job configurado.</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-yellow-400 text-sm hover:underline">
            Criar o primeiro →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {crons.map(cron => (
            <div
              key={cron.id}
              className={`bg-gray-900 border rounded p-5 transition ${cron.enabled ? 'border-gray-800' : 'border-gray-800 opacity-60'}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white">{cron.agent_id}</span>
                    <span className="text-xs text-purple-400 bg-purple-900/30 border border-purple-700 px-2 py-0.5 rounded">
                      {cron.squad_id}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${
                      cron.enabled
                        ? 'bg-green-900/40 text-green-300 border-green-700'
                        : 'bg-gray-800 text-gray-400 border-gray-700'
                    }`}>
                      {cron.enabled ? '● Ativo' : '○ Pausado'}
                    </span>
                  </div>
                  {cron.description && (
                    <p className="text-gray-400 text-sm mt-1">{cron.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-yellow-400 font-mono text-xs bg-yellow-900/20 border border-yellow-700/40 px-2 py-0.5 rounded">
                      {cron.schedule}
                    </span>
                    <span className="text-gray-400 text-xs">
                      ⏩ {formatNextRun(cron.next_run_at)}
                    </span>
                    {cron.last_run_at && (
                      <span className="text-gray-500 text-xs">
                        Último: {new Date(cron.last_run_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(cron.id)}
                  className={`px-4 py-2 rounded text-sm font-medium border transition ${
                    cron.enabled
                      ? 'bg-red-900/30 hover:bg-red-800/50 text-red-300 border-red-700'
                      : 'bg-green-900/30 hover:bg-green-800/50 text-green-300 border-green-700'
                  }`}
                >
                  {cron.enabled ? '⏸ Pausar' : '▶ Ativar'}
                </button>
              </div>
              <p className="text-xs text-gray-600 font-mono mt-3">{cron.id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CronPage
