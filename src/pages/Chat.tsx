import { useEffect, useState, useRef, KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { aiox, AIOXSquad, AIOXAgent } from '../lib/aiox'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  status: 'done' | 'streaming' | 'error'
  timestamp: Date
}

let msgCounter = 0
function uid() { return `msg-${++msgCounter}-${Date.now()}` }

function Chat() {
  const [squads, setSquads]         = useState<AIOXSquad[]>([])
  const [agents, setAgents]         = useState<AIOXAgent[]>([])
  const [squadId, setSquadId]       = useState('')
  const [agentId, setAgentId]       = useState('')
  const [engineError, setEngineError] = useState<string | null>(null)

  const [messages, setMessages]     = useState<ChatMessage[]>([])
  const [input, setInput]           = useState('')
  const [sending, setSending]       = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef       = useRef<AbortController | null>(null)

  useEffect(() => {
    aiox.getSquads()
      .then(res => setSquads(res.squads))
      .catch(err => setEngineError(err.message))
    aiox.getAgentsBySquad()
      .then(res => setAgents(res.agents))
      .catch(() => {})
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => () => { abortRef.current?.abort() }, [])

  const agentsInSquad = agents.filter(a => !squadId || a.squadId === squadId)
  const selectedAgent = agents.find(a => a.id === agentId && a.squadId === squadId)

  const appendMsg = (msg: ChatMessage) =>
    setMessages(prev => [...prev, msg])

  const updateMsg = (id: string, updates: Partial<ChatMessage>) =>
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m))

  const sendMessage = async () => {
    if (!input.trim() || !squadId || !agentId || sending) return

    const userMsg: ChatMessage = {
      id: uid(), role: 'user', content: input.trim(), status: 'done', timestamp: new Date(),
    }
    const assistantId = uid()
    const assistantMsg: ChatMessage = {
      id: assistantId, role: 'assistant', content: '', status: 'streaming', timestamp: new Date(),
    }

    appendMsg(userMsg)
    appendMsg(assistantMsg)
    const text = input.trim()
    setInput('')
    setSending(true)

    abortRef.current = new AbortController()

    try {
      const res = await fetch(aiox.streamUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          squadId,
          agentId,
          input: { message: text },
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error((err as any).error || `HTTP ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data:')) continue
          const data = line.slice(5).trim()
          if (!data || data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            if (parsed.event === 'text' || parsed.type === 'text' || typeof parsed.text === 'string') {
              accumulated += parsed.text ?? parsed.content ?? ''
              updateMsg(assistantId, { content: accumulated })
            } else if (parsed.event === 'output' || parsed.output) {
              accumulated += parsed.output ?? ''
              updateMsg(assistantId, { content: accumulated })
            } else if (parsed.event === 'error' || parsed.error) {
              updateMsg(assistantId, {
                content: parsed.error || 'Erro durante a execução.',
                status: 'error',
              })
              return
            } else if (parsed.event === 'done' || parsed.event === 'complete') {
              // done
            } else if (typeof parsed === 'string') {
              accumulated += parsed
              updateMsg(assistantId, { content: accumulated })
            }
          } catch {
            // non-JSON SSE data — treat as text
            accumulated += data
            updateMsg(assistantId, { content: accumulated })
          }
        }
      }

      // Fallback: if no streamed content, poll the job
      if (!accumulated) {
        updateMsg(assistantId, { content: 'Tarefa enviada. Aguardando resultado...', status: 'streaming' })
      } else {
        updateMsg(assistantId, { status: 'done' })
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        updateMsg(assistantId, { content: '[Cancelado]', status: 'error' })
      } else {
        updateMsg(assistantId, {
          content: `Erro: ${err.message}`,
          status: 'error',
        })
      }
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-0">
      <div className="mb-4">
        <h1 className="text-4xl font-bold">Chat</h1>
        <p className="text-gray-400 mt-2">Conversa com streaming em tempo real via SSE</p>
      </div>

      {engineError && (
        <div className="mb-4 bg-red-900/30 border border-red-700 rounded px-4 py-3 text-red-200 text-sm">
          ⚠️ {engineError} — <Link to="/settings" className="text-yellow-400 underline">configurar engine</Link>
        </div>
      )}

      {/* Agent selector */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Squad</label>
          <select
            value={squadId}
            onChange={e => { setSquadId(e.target.value); setAgentId('') }}
            className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400"
          >
            <option value="">Selecione um squad...</option>
            {squads.map(s => <option key={s.id} value={s.id}>{s.name || s.id}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Agente</label>
          <select
            value={agentId}
            onChange={e => setAgentId(e.target.value)}
            disabled={!squadId}
            className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400 disabled:opacity-50"
          >
            <option value="">Selecione um agente...</option>
            {agentsInSquad.map(a => <option key={a.id} value={a.id}>{a.name || a.id}</option>)}
          </select>
        </div>
      </div>

      {selectedAgent && (
        <div className="mb-3 px-3 py-2 bg-yellow-900/20 border border-yellow-700/40 rounded text-sm">
          🤖 <span className="text-yellow-300 font-medium">{selectedAgent.name || selectedAgent.id}</span>
          {selectedAgent.role && <span className="text-gray-400 ml-2">({selectedAgent.role})</span>}
          {selectedAgent.description && <span className="text-gray-400 ml-2">— {selectedAgent.description}</span>}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-900 border border-gray-800 rounded p-4 space-y-4 mb-3">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-gray-600">
            <div>
              <div className="text-4xl mb-3">💬</div>
              <p className="text-sm">Selecione um squad e agente acima, depois escreva sua mensagem.</p>
              <p className="text-xs mt-1">O agente responde com streaming em tempo real.</p>
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-3xl px-4 py-3 rounded-xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-yellow-600 text-white'
                    : msg.status === 'error'
                    ? 'bg-red-900/50 border border-red-700 text-red-200'
                    : 'bg-gray-800 border border-gray-700 text-gray-100'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="text-xs text-gray-400 mb-1 font-medium">
                    🤖 {selectedAgent?.name || agentId || 'Agente'}
                    {msg.status === 'streaming' && <span className="ml-2 animate-pulse">●●●</span>}
                  </div>
                )}
                <pre className="whitespace-pre-wrap font-sans">{msg.content || (msg.status === 'streaming' ? '…' : '')}</pre>
                <div className="text-xs mt-1.5 opacity-50">
                  {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          disabled={!squadId || !agentId || sending}
          placeholder={
            !squadId ? 'Selecione um squad e agente primeiro...'
            : !agentId ? 'Selecione um agente...'
            : 'Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)'
          }
          className="flex-1 bg-gray-900 border border-gray-800 rounded px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 resize-none text-sm disabled:opacity-50"
        />
        <div className="flex flex-col gap-2">
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !squadId || !agentId || sending}
            className="flex-1 px-5 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 disabled:text-gray-500 rounded font-medium transition text-sm"
          >
            {sending ? '⏳' : '▶ Enviar'}
          </button>
          {sending && (
            <button
              onClick={() => abortRef.current?.abort()}
              className="px-5 py-2 bg-red-900/50 hover:bg-red-800 border border-red-700 rounded text-sm transition"
            >
              ⛔ Parar
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-600 mt-1">Enter = enviar · Shift+Enter = nova linha</p>
    </div>
  )
}

export default Chat
