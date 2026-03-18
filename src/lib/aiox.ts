// ─── AIOX Engine API Client ────────────────────────────────────────────────
// Connects to the AIOX Hono engine (default: port 4002).
// URL resolution order: localStorage settings → VITE_AIOX_ENGINE_URL → localhost

function getEngineUrl(): string {
  try {
    const saved = localStorage.getItem('aiox-settings')
    if (saved) {
      const s = JSON.parse(saved)
      if (s.aiox_engine_url) return s.aiox_engine_url.replace(/\/$/, '')
    }
  } catch {}
  return (import.meta.env.VITE_AIOX_ENGINE_URL as string) || 'http://localhost:4002'
}

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${getEngineUrl()}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `HTTP ${res.status}: ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

// ─── Types ─────────────────────────────────────────────────────────────────

export interface AIOXHealth {
  status: string
  version: string
  uptime_ms: number
  pid: number
  ws_clients: number
}

export interface AIOXPool {
  running: number
  max_concurrent: number
  queued?: number
  workers?: Array<{ id: string; status: string; agent_id?: string }>
}

export type JobStatus =
  | 'pending' | 'running' | 'done' | 'failed'
  | 'timeout' | 'rejected' | 'cancelled'

export interface AIOXJob {
  id: string
  squad_id: string
  agent_id: string
  status: JobStatus
  input_payload: { message: string; context?: string; command?: string }
  output_result?: string
  error_message?: string
  created_at: string
  started_at?: string
  completed_at?: string
  pid?: number
  trigger_type: string
  workspace_dir?: string
}

export interface AIOXSquad {
  id: string
  name: string
  description?: string
  domain?: string
  agentCount: number
  taskCount: number
  hasConfig: boolean
}

export interface AIOXAgent {
  id: string
  name: string
  squadId: string
  role?: string
  description?: string
  filePath: string
}

export interface AIOXCron {
  id: string
  squad_id: string
  agent_id: string
  schedule: string
  enabled: boolean
  description?: string
  last_run_at?: string
  last_job_id?: string
  next_run_at?: string
}

export interface AIOXMemoryItem {
  scope: string
  key: string
  value: string
  created_at?: string
  similarity?: number
}

export interface AIOXAuditEntry {
  id: string
  timestamp: string
  agent_id: string
  squad_id?: string
  action: string
  allowed: boolean
  reason?: string
}

export interface ExecuteResponse {
  executionId: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  result?: string
  error?: string
  duration_ms?: number
}

export interface ExecuteParams {
  squadId: string
  agentId: string
  message: string
  context?: string
  command?: string
  timeout?: number
}

export interface CreateCronParams {
  squadId: string
  agentId: string
  schedule: string
  description?: string
  input?: Record<string, unknown>
}

// ─── API Methods ───────────────────────────────────────────────────────────

export const aiox = {
  // Health & System
  getHealth: () => api<AIOXHealth>('/health'),
  getPool: () => api<AIOXPool>('/pool'),
  resizePool: (max_concurrent: number) =>
    api<{ message: string }>('/pool/resize', {
      method: 'POST',
      body: JSON.stringify({ max_concurrent }),
    }),

  // Jobs
  getJobs: (params: { status?: JobStatus; squad_id?: string; agent_id?: string; limit?: number; offset?: number } = {}) => {
    const qs = new URLSearchParams()
    if (params.status) qs.set('status', params.status)
    if (params.squad_id) qs.set('squad_id', params.squad_id)
    if (params.agent_id) qs.set('agent_id', params.agent_id)
    if (params.limit) qs.set('limit', String(params.limit))
    if (params.offset) qs.set('offset', String(params.offset))
    return api<{ jobs: AIOXJob[]; total: number }>(`/jobs?${qs}`)
  },
  getQueueStatus: () => api<{ pending: number; running: number }>('/jobs/queue'),
  getJob: (id: string) => api<AIOXJob>(`/jobs/${id}`),
  getJobLogs: (id: string, tail = 200) =>
    api<{ logs: string[]; total: number; hasMore: boolean }>(`/jobs/${id}/logs?tail=${tail}`),
  retryJob: (id: string) => api<AIOXJob>(`/jobs/${id}/retry`, { method: 'POST' }),

  // Execute (queued)
  execute: (params: ExecuteParams) =>
    api<ExecuteResponse>('/execute/agent', {
      method: 'POST',
      body: JSON.stringify({
        squadId: params.squadId,
        agentId: params.agentId,
        input: { message: params.message, context: params.context, command: params.command },
        options: params.timeout ? { timeout: params.timeout } : undefined,
      }),
    }),
  getExecution: (id: string) => api<ExecuteResponse>(`/execute/status/${id}`),
  cancelExecution: (id: string) =>
    api<{ executionId: string; status: string }>(`/execute/status/${id}`, { method: 'DELETE' }),

  // Registry
  getSquads: () => api<{ squads: AIOXSquad[]; count: number }>('/registry/squads'),
  getAgentsBySquad: (squadId?: string) => {
    const qs = squadId ? `?squad=${squadId}` : ''
    return api<{ agents: AIOXAgent[]; count: number }>(`/registry/agents${qs}`)
  },

  // Cron
  getCrons: () => api<{ crons: AIOXCron[] }>('/cron'),
  createCron: (params: CreateCronParams) =>
    api<AIOXCron>('/cron', {
      method: 'POST',
      body: JSON.stringify({
        squadId: params.squadId,
        agentId: params.agentId,
        schedule: params.schedule,
        description: params.description,
        input: params.input,
      }),
    }),
  toggleCron: (id: string) => api<AIOXCron>(`/cron/${id}/toggle`, { method: 'POST' }),

  // Memory
  getMemory: (scope: string) => api<{ items: AIOXMemoryItem[] }>(`/memory/${scope}`),
  searchMemory: (keywords: string[]) =>
    api<{ results: AIOXMemoryItem[] }>('/memory/recall', {
      method: 'POST',
      body: JSON.stringify({ keywords }),
    }),

  // Audit
  getAuditLog: (limit = 50) =>
    api<{ entries: AIOXAuditEntry[] }>(`/authority/audit?limit=${limit}`),

  // Streaming URL (for SSE — used directly with EventSource/fetch)
  streamUrl: () => `${getEngineUrl()}/stream/agent`,
}
