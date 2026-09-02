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
    return Math.round((pub - neg) / pub * 100) + '% OFF'
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <header className="border-b-2 border-text px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-surface-2 flex items-center justify-center text-white text-xs font-heading font-bold">
              UPS
            </div>
            <div>
              <p className="page-title text-text leading-none">Shipping Cost Lookup</p>
              <p className="section-label mt-1">Bells of Steel</p>
            </div>
          </div>
          <a href="/admin" className="btn btn-ghost px-3 py-2">
            Admin →
          </a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-14">

        {/* Hero search */}
        <div className="text-center mb-10">
          <h2 className="display text-text mb-3">Look up a shipment</h2>
          <p className="section-label">Enter a full or partial UPS tracking number</p>
        </div>

        <div className="max-w-2xl mx-auto mb-10">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
                placeholder="e.g. 1Z999AA10123456784"
                className="field mono w-full h-12 pl-11 pr-4 text-sm"
                spellCheck={false}
                autoComplete="off"
                autoFocus
              />
            </div>
            <button
              onClick={search}
              disabled={loading}
              className="btn btn-accent h-12 px-7 whitespace-nowrap"
            >
              {loading ? 'Searching…' : 'Search'}
            </button>
            {(results !== null || query) && (
              <button onClick={clear} aria-label="Clear search" className="btn btn-ghost w-12 h-12 text-lg leading-none border border-border">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto px-4 py-3 mb-6 text-sm text-center" style={{ background: 'rgba(187,58,46,0.08)', border: '1px solid var(--bad)', color: 'var(--bad)' }}>
            {error}
          </div>
        )}

        {/* Empty state */}
        {results === null && !loading && !error && (
          <div className="text-center py-24">
            <p className="section-label">Results will appear here</p>
          </div>
        )}

        {/* No results */}
        {results !== null && results.length === 0 && (
          <div className="text-center py-24">
            <p className="page-title text-text">No shipments found for &ldquo;{query}&rdquo;</p>
            <p className="section-label mt-2">Try a shorter partial number</p>
          </div>
        )}

        {/* Results table */}
        {results && results.length > 0 && (
          <div className="card">
            <div className="px-6 py-4 border-b-2 border-text flex items-center justify-between">
              <span className="section-label">
                {results.length} shipment{results.length !== 1 ? 's' : ''} found
              </span>
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--ok)' }}></span>
            </div>
            <div className="overflow-x-auto">
              <table className="bos-table">
                <thead>
                  <tr>
                    {['Tracking #', 'Date', 'Service', 'Weight', 'Actual Cost', 'Published', 'Recipient'].map(h => (
                      <th key={h} scope="col">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, i) => (
                    <tr key={i}>
                      <td className="mono text-text whitespace-nowrap">{row.tracking_number || '—'}</td>
                      <td className="mono text-text-2 whitespace-nowrap">{row.ship_date || '—'}</td>
                      <td className="whitespace-nowrap">
                        {row.service_type
                          ? <span className="mono inline-block text-xs px-2.5 py-1 rounded-full" style={{ background: 'var(--subtle-fill)', color: 'var(--text)', border: '1px solid var(--border)' }}>{row.service_type}</span>
                          : <span className="text-text-2">—</span>}
                      </td>
                      <td className="text-text-2">{row.weight ? `${row.weight} lbs` : '—'}</td>
                      <td className="whitespace-nowrap">
                        <span className="font-heading font-bold text-text">{fmt(row.negotiated_charge)}</span>
                        {savingsPct(row.negotiated_charge, row.published_charge) && (
                          <span className="mono ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(44,133,83,0.12)', color: 'var(--ok)', border: '1px solid var(--ok)' }}>
                            {savingsPct(row.negotiated_charge, row.published_charge)}
                          </span>
                        )}
                      </td>
                      <td className="text-text-2 line-through whitespace-nowrap">{fmt(row.published_charge)}</td>
                      <td className="text-text">{row.recipient_name || '—'}</td>
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
