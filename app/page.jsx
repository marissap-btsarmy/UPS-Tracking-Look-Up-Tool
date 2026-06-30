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

  const clear = () => {
    setQuery('')
    setResults(null)
    setError('')
  }

  const fmt = (val) => {
    if (val == null) return '—'
    return '$' + Number(val).toFixed(2)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a3a5c] text-white px-6 py-4 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">WorldShip Cost Lookup</h1>
            <p className="text-sm text-blue-200 mt-0.5">Search shipment history by tracking number</p>
          </div>
          <a href="/admin" className="text-xs text-blue-300 hover:text-white transition-colors">
            Admin →
          </a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Search box */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="Enter tracking number (full or partial)…"
              className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-3 font-mono text-base focus:outline-none focus:border-blue-500 transition-colors"
              spellCheck={false}
              autoComplete="off"
              autoFocus
            />
            <button
              onClick={search}
              disabled={loading}
              className="bg-[#1a3a5c] hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-7 py-3 rounded-lg transition-colors"
            >
              {loading ? 'Searching…' : 'Search'}
            </button>
            {(results !== null || query) && (
              <button
                onClick={clear}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-3 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
            {error}
          </div>
        )}

        {/* Empty prompt */}
        {results === null && !loading && !error && (
          <div className="text-center text-gray-400 py-24">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-lg font-medium text-gray-500">Enter a tracking number to look up its shipping cost</p>
            <p className="text-sm mt-1">Partial matches work — you don't need the full number</p>
          </div>
        )}

        {/* No results */}
        {results !== null && results.length === 0 && (
          <div className="text-center text-gray-400 py-24">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-medium text-gray-500">No shipments found for "{query}"</p>
            <p className="text-sm mt-1">Try a shorter partial number, or check if the data has been imported</p>
          </div>
        )}

        {/* Results table */}
        {results && results.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-gray-700 text-sm">Results</span>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                {results.length} shipment{results.length !== 1 ? 's' : ''} found
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                    {['Tracking #', 'Ship Date', 'Service', 'Weight', 'Zone', 'Actual Cost', 'Published Rate', 'Recipient'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold border-b border-gray-200 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-blue-50/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-[#1a3a5c] whitespace-nowrap">{row.tracking_number || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.ship_date || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.service_type
                          ? <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">{row.service_type}</span>
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{row.weight || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{row.zone || '—'}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600 text-base whitespace-nowrap">{fmt(row.negotiated_charge)}</td>
                      <td className="px-4 py-3 text-gray-400 line-through whitespace-nowrap">{fmt(row.published_charge)}</td>
                      <td className="px-4 py-3 text-gray-600">{row.recipient_name || '—'}</td>
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
