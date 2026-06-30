'use client'

import { useState } from 'react'

export default function SearchPage() {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setResults(null)
    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResults(data.results)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const clear = () => { setQuery(''); setResults(null); setError('') }

  const fmt = (val) => val == null ? '—' : '$' + Number(val).toFixed(2)

  const savingsPct = (neg, pub) => {
    if (!neg || !pub || pub <= neg) return null
    return Math.round((pub - neg) / pub * 100) + '% off'
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1a3554 50%, #0f172a 100%)' }}>

      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/30">
              UPS
            </div>
            <div>
              <p className="text-white font-semibold leading-none">Shipping Cost Lookup</p>
              <p className="text-blue-400 text-xs mt-0.5">Bells of Steel</p>
            </div>
          </div>
          <a href="/admin" className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all">
            Admin →
          </a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-14">

        {/* Hero search */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Look up a shipment</h2>
          <p className="text-slate-400 text-sm">Enter a full or partial UPS tracking number</p>
        </div>

        <div className="max-w-2xl mx-auto mb-10">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
                placeholder="e.g. 1Z999AA10123456784"
                className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all"
                spellCheck={false}
                autoComplete="off"
                autoFocus
              />
            </div>
            <button
              onClick={search}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-400 active:bg-blue-600 disabled:opacity-50 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-500/25 whitespace-nowrap text-sm"
            >
              {loading ? 'Searching…' : 'Search'}
            </button>
            {(results !== null || query) && (
              <button onClick={clear} className="text-slate-400 hover:text-white px-3.5 rounded-xl hover:bg-white/10 transition-all text-lg leading-none">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto bg-red-500/15 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        {/* Empty state */}
        {results === null && !loading && !error && (
          <div className="text-center py-24 opacity-40">
            <div className="text-6xl mb-3">📦</div>
            <p className="text-slate-400 text-sm">Results will appear here</p>
          </div>
        )}

        {/* No results */}
        {results !== null && results.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-3 opacity-30">🔍</div>
            <p className="text-slate-300 font-medium">No shipments found for &ldquo;{query}&rdquo;</p>
            <p className="text-slate-500 text-sm mt-1">Try a shorter partial number</p>
          </div>
        )}

        {/* Results table */}
        {results && results.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <span className="text-slate-300 text-sm font-medium">
                {results.length} shipment{results.length !== 1 ? 's' : ''} found
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"></span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Tracking #', 'Date', 'Service', 'Weight', 'Actual Cost', 'Published', 'Recipient'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <td className="px-5 py-4 font-mono text-blue-300 text-xs whitespace-nowrap">{row.tracking_number || '—'}</td>
                      <td className="px-5 py-4 text-slate-400 whitespace-nowrap text-xs">{row.ship_date || '—'}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {row.service_type
                          ? <span className="bg-blue-500/20 text-blue-300 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-500/20">{row.service_type}</span>
                          : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs">{row.weight ? `${row.weight} lbs` : '—'}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-emerald-400 font-bold text-base">{fmt(row.negotiated_charge)}</span>
                        {savingsPct(row.negotiated_charge, row.published_charge) && (
                          <span className="ml-2 text-xs bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                            {savingsPct(row.negotiated_charge, row.published_charge)}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600 line-through text-xs whitespace-nowrap">{fmt(row.published_charge)}</td>
                      <td className="px-5 py-4 text-slate-300 text-xs">{row.recipient_name || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
