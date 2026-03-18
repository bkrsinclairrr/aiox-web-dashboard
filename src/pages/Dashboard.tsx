import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { aiox, AIOXHealth, AIOXPool, AIOXJob, AIOXSquad, AIOXAgent } from '../lib/aiox'

const JOB_STATUS: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'Na Fila',    cls: 'bg-yellow-900/40 text-yellow-300 border border-yellow-700' },
  running:   { label: 'Rodando',   cls: 'bg-blue-900/40 text-blue-300 border border-blue-700' },
  done:      { label: 'ConcluÃ­do', cls: 'bg-green-900/40 text-green-300 border border-green-700' },
  failed:    { label: 'Falhou',    cls: 'bg-red-900/40 text-red-300 border border-red-700' },
  timeout:   { label: 'Timeout',   cls: 'bg-orange-900/40 text-orange-300 border border-orange-700' },
  rejected:  { label: 'Rejeitado', cls: 'bg-gray-800 text-gray-400 border border-gray-700' },
  cancelled: { label: 'Cancelado', cls: 'bg-gray-800 text-gray-400 border border-gray-700' },
}

function EngineOfflineBanner() {
  return (
    <div className="bg-red-900/30 border border-red-700 rounded p-4 text-red-200 flex items-center gap-3">
      <span className="text-xl">âš ï¸</span>
      <div>
        <div className="font-semibold">Engine Offline</div>
        <div className="text-sm mt-1">
          Configure o URL do engine em{' '}
          <Link to="/settings" className="text-yellow-400 underline">ConfiguraÃ§Ãµes</Link>.
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, color = 'text-white' }: {
  label: string; value: string | number; sub?: string; color?: string
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded p-5">
      <div className="text-gray-400 text-sm">{label}</div>
      <div className={`text-3xl font-bold mt-2 ${color}`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  )
}

function Dashboard() {
  const [health, setHealth] = useState<AIOXHealth | null>(null)
  const [pool, setPool] = useState<AIOXPool | null>(null)
  const [jobs, setJobs] = useState<AIOXJob[]>([])
  const [squads, setSquads] = useState<AIOXSquad[]>([])
  const [agents, setAgents] = useState<AIOXAgent[]>([])
  const [engineError, setEngineError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [healthRes, poolRes, jobsRes, squadsRes, agentsRes] = await Promise.allSettled([
        aiox.getHealth(),
        aiox.getPool(),
        aiox.getJobs({ limit: 10 }),
        aiox.getSquads(),
        aiox.getAgentsBySquad(),
      ])

      if (healthRes.status === 'fulfilled') { setHealth(healthRes.value); setEngineError(null) }
      else setEngineError('Engine offline')
      if (poolRes.status === 'fulfilled') setPool(poolRes.value)
      if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.jobs)
      if (squadsRes.status === 'fulfilled') setSquads(squadsRes.value.squads)
      if (agentsRes.status === 'fulfilled') setAgents(agentsRes.value.agents)
    } catch {
      setEngineError('Falha ao conectar com o engine')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const id = setInterval(loadData, 5000)
    return () => clearInterval(id)
  }, [])

  const runningJobs = jobs.filter(j => j.status === 'running').length
  const doneJobs    = jobs.filter(j => j.status === 'done').length
  const failedJobs  = jobs.filter(j => j.status === 'failed').length
  const uptime = health
    ? health.uptime_ms >= 3600000
      ? `${Math.floor(health.uptime_ms / 3600000)}h ${Math.floor((health.uptime_ms % 3600000) / 60000)}m`
      : `${Math.floor(health.uptime_ms / 60000)}m`
    : 'â€”'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-gray-400 mt-2">Monitoramento em tempo real do AIOX Engine</p>
      </div>

      {engineError && <EngineOfflineBanner />}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Status do Engine"
          value={health ? 'ðŸŸ¢ Online' : 'ðŸ”´ Offline'}
          sub={health ? `v${health.version}` : engineError ?? 'verificando...'}
          color={health ? 'text-green-400' : 'text-red-400'}
        />
        <StatCard
          label="Processos Ativos"
          value={pool ? `${pool.running}/${pool.max_concurrent}` : 'â€”'}
          sub="executando agora"
          color="text-blue-400"
        />
        <StatCard
          label="Agentes"
          value={agents.length}
          sub={`${squads.length} squad${squads.length !== 1 ? 's' : ''}`}
        />
        <StatCard
          label="Uptime"
          value={uptime}
          sub={health ? `PID ${health.pid}` : undefined}
          color="text-purple-400"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { to: '/orchestrator', icon: 'ðŸŽ¯', label: 'Orquestrar Tarefa', color: 'bg-yellow-600 hover:bg-yellow-700' },
          { to: '/chat', icon: 'ðŸ’¬', label: 'Chat com Agente', color: 'bg-purple-700 hover:bg-purple-800' },
          { to: '/monitor', icon: 'ðŸ“Š', label: 'Monitor', color: 'bg-blue-800 hover:bg-blue-900' },
          { to: '/cron', icon: 'â°', label: 'Tarefas Agendadas', color: 'bg-gray-700 hover:bg-gray-600' },
        ].map(({ to, icon, label, color }) => (
          <Link key={to} to={to} className={`${color} rounded p-4 text-center transition block`}>
            <div className="text-2xl">{icon}</div>
            <div className="text-sm font-medium mt-1">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-gray-900 border border-gray-800 rounded p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Ãšltimos Jobs</h2>
            <Link to="/history" className="text-yellow-400 text-sm hover:underline">Ver todos â†’</Link>
          </div>
          {loading && jobs.length === 0 ? (
            <p className="text-gray-400 text-sm">Carregando...</p>
          ) : jobs.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhum job encontrado. <Link to="/orchestrator" className="text-yellow-400 underline">Criar um?</Link></p>
          ) : (
            <div className="space-y-2">
              {jobs.map(job => {
                const st = JOB_STATUS[job.status] ?? { label: job.status, cls: 'bg-gray-800 text-gray-400 border border-gray-700' }
                return (
                  <div key={job.id} className="flex items-center gap-3 p-3 bg-black/40 rounded border border-gray-800 text-sm">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${st.cls}`}>{st.label}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">{job.agent_id}</div>
                      <div className="text-gray-500 text-xs">{job.squad_id}</div>
                    </div>
                    <div className="text-gray-500 text-xs whitespace-nowrap">
                      {new Date(job.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pool + Job Summary */}
        <div className="space-y-4">
          {/* Pool utilization */}
          {pool && (
            <div className="bg-gray-900 border border-gray-800 rounded p-6">
              <h2 className="text-lg font-bold mb-3">Pool de Processos</h2>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">UtilizaÃ§Ã£o</span>
                <span className="text-white font-medium">{pool.running}/{pool.max_concurrent}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${pool.running / pool.max_concurrent > 0.8 ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(100, (pool.running / Math.max(1, pool.max_concurrent)) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Job status summary */}
          <div className="bg-gray-900 border border-gray-800 rounded p-6">
            <h2 className="text-lg font-bold mb-3">Resumo (Ãºltimos 10)</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{runningJobs}</div>
                <div className="text-xs text-gray-400 mt-1">Rodando</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{doneJobs}</div>
                <div className="text-xs text-gray-400 mt-1">ConcluÃ­dos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{failedJobs}</div>
                <div className="text-xs text-gray-400 mt-1">Falhas</div>
              </div>
            </div>
          </div>

          {/* Squads */}
          {squads.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded p-6">
              <h2 className="text-lg font-bold mb-3">Squads</h2>
              <div className="space-y-2">
                {squads.slice(0, 4).map(squad => (
                  <div key={squad.id} className="flex items-center justify-between p-2 bg-black/40 rounded text-sm">
                    <div className="font-medium text-white">{squad.name || squad.id}</div>
                    <div className="text-gray-400 text-xs">{squad.agentCount} agente{squad.agentCount !== 1 ? 's' : ''}</div>
                  </div>
                ))}
                {squads.length > 4 && (
                  <Link to="/agents" className="block text-center text-xs text-yellow-400 hover:underline pt-1">
                    +{squads.length - 4} mais â†’
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
