import { useState } from 'react'
import { Link } from 'react-router-dom'
import { aiox, AIOXMemoryItem } from '../lib/aiox'

const SCOPES = ['global', 'project', 'squad', 'agent', 'session']

function Memory() {
  const [scope, setScope]         = useState('')
  const [keywords, setKeywords]   = useState('')
  const [results, setResults]     = useState<AIOXMemoryItem[]>([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [searched, setSearched]   = useState(false)

  const handleSearch = async () => {
    if (!keywords.trim() && !scope) return
    setLoading(true)
    setError(null)
    try {
      if (keywords.trim()) {
        const kwList = keywords.split(/[,\s]+/).filter(Boolean)
        const res = await aiox.searchMemory(kwList)
        setResults(res.results)
      } else {
        const res = await aiox.getMemory(scope)
        setResults(res.items)
      }
      setSearched(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleScopeLoad = async (s: string) => {
    setScope(s)
    setKeywords('')
    setLoading(true)
    setError(null)
    try {
      const res = await aiox.getMemory(s)
      setResults(res.items)
      setSearched(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Memória</h1>
        <p className="text-gray-400 mt-2">Consulte a memória contextual dos agentes</p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded px-4 py-3 text-red-200">
          ⚠️ {error} — <Link to="/settings" className="text-yellow-400 underline">configurar engine</Link>
        </div>
      )}

      {/* Scope buttons */}
      <div className="bg-gray-900 border border-gray-800 rounded p-5">
        <h2 className="font-bold mb-3">Carregar por Escopo</h2>
        <div className="flex flex-wrap gap-2">
          {SCOPES.map(s => (
            <button
              key={s}
              onClick={() => handleScopeLoad(s)}
              className={`px-4 py-2 rounded text-sm font-medium border transition ${
                scope === s && searched
                  ? 'bg-yellow-600 text-white border-yellow-700'
                  : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-yellow-600 hover:text-yellow-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Keyword search */}
      <div className="bg-gray-900 border border-gray-800 rounded p-5">
        <h2 className="font-bold mb-3">Busca por Palavras-chave</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={keywords}
            onChange={e => setKeywords(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
            placeholder="Digite palavras-chave separadas por vírgula..."
            className="flex-1 bg-black/50 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400"
          />
          <button
            onClick={handleSearch}
            disabled={loading || (!keywords.trim() && !scope)}
            className="px-5 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 disabled:text-gray-500 rounded font-medium transition"
          >
            {loading ? '⏳ Buscando...' : '🔍 Buscar'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Exemplo: "autenticação, deploy, backend"</p>
      </div>

      {/* Results */}
      {searched && (
        <div className="bg-gray-900 border border-gray-800 rounded p-5">
          <h2 className="font-bold mb-3">
            Resultados
            <span className="text-gray-400 font-normal text-sm ml-2">({results.length} itens)</span>
          </h2>
          {results.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhuma memória encontrada.</p>
          ) : (
            <div className="space-y-3">
              {results.map((item, i) => (
                <div key={i} className="bg-black/40 border border-gray-800 rounded p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-purple-400 bg-purple-900/30 border border-purple-700 px-2 py-0.5 rounded">
                      {item.scope}
                    </span>
                    <span className="text-xs text-yellow-400 font-mono">{item.key}</span>
                    {item.similarity !== undefined && (
                      <span className="text-xs text-gray-500 ml-auto">
                        {Math.round(item.similarity * 100)}% relevante
                      </span>
                    )}
                  </div>
                  <pre className="text-sm text-gray-200 whitespace-pre-wrap">{item.value}</pre>
                  {item.created_at && (
                    <p className="text-xs text-gray-600 mt-2">
                      {new Date(item.created_at).toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Memory
