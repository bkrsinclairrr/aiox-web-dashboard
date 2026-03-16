import axios from 'axios'

const AIOX_ENGINE_URL = import.meta.env.VITE_AIOX_ENGINE_URL || 'http://localhost:4002'

const aioxClient = axios.create({
  baseURL: AIOX_ENGINE_URL,
  timeout: 10000,
})

export interface AIOXEvent {
  id: string
  timestamp: string
  type: string
  agent: string
  status: 'success' | 'error' | 'pending'
  data: Record<string, any>
}

export interface AIOXAgent {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'error'
  lastRun?: string
}

export const aiox = {
  // Get events
  getEvents: (limit = 50) =>
    aioxClient.get<AIOXEvent[]>('/api/events', { params: { limit } }),

  // Get agents
  getAgents: () =>
    aioxClient.get<AIOXAgent[]>('/api/agents'),

  // Get agent details
  getAgent: (id: string) =>
    aioxClient.get<AIOXAgent>(`/api/agents/${id}`),

  // Execute agent
  executeAgent: (id: string, params: Record<string, any>) =>
    aioxClient.post(`/api/agents/${id}/execute`, { params }),

  // Get metrics
  getMetrics: () =>
    aioxClient.get('/api/metrics'),

  // Get health status
  getHealth: () =>
    aioxClient.get('/api/health'),
}
