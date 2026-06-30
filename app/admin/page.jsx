'use client'

import { useState } from 'react'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [file, setFile]         = useState(null)
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState('')
  const [error, setError]       = useState('')

  const handleUpload = async () => {
    if (!password) { setError('Enter the admin password first.'); return }
    if (!file)     { setError('Select a CSV file to upload.'); return }
    setLoading(true); setError(''); setSuccess('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res  = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-admin-password': password },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) throw new Error('Incorrect password.')
        throw new Error(data.error || 'Upload failed.')
      }
      setSuccess(`Imported ${data.imported.toLocaleString()} shipments successfully.`)
      setFile(null)
      document.getElementById('csvInput').value = ''
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1a3554 50%, #0f172a 100%)' }}>

      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/30">
              UPS
            </div>
            <div>
              <p className="text-white font-semibold leading-none">Import Shipments</p>
              <p className="text-blue-400 text-xs mt-0.5">Admin</p>
            </div>
          </div>
          <a href="/" className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all">
            ← Back to search
          </a>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-14">

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUpload()}
              placeholder="Enter password"
              className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all"
            />
          </div>

          {/* File drop area */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">WorldShip CSV Export</label>
            <div
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                file
                  ? 'border-blue-400/50 bg-blue-500/10'
                  : 'border-white/15 hover:border-white/30 hover:bg-white/5'
              }`}
              onClick={() => document.getElementById('csvInput').click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault()
                const f = e.dataTransfer.files[0]
                if (f) { setFile(f); setSuccess(''); setError('') }
              }}
            >
              {file ? (
                <>
                  <div className="text-3xl mb-2">✅</div>
                  <p className="font-medium text-blue-300 text-sm">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-1">Ready to import — click to change</p>
                </>
              ) : (
                <>
                  <div className="text-3xl mb-2 opacity-30">📂</div>
                  <p className="font-medium text-slate-300 text-sm">Click to choose a file, or drag and drop</p>
                  <p className="text-xs text-slate-500 mt-1">WorldShip CSV export (.csv)</p>
                </>
              )}
              <input
                id="csvInput"
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={e => { setFile(e.target.files[0]); setSuccess(''); setError('') }}
              />
            </div>
          </div>

          {/* Note */}
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300/80 rounded-xl px-4 py-3 text-xs mb-6">
            Uploading adds new shipments and updates existing ones. Records not in this file are kept.
          </div>

          {error && (
            <div className="bg-red-500/15 border border-red-500/25 text-red-300 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 px-4 py-3 rounded-xl text-sm mb-4 font-medium">
              ✅ {success}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-400 active:bg-blue-600 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-500/20 text-sm"
          >
            {loading ? 'Importing…' : 'Import Shipments'}
          </button>
        </div>

      </div>
    </div>
  )
}
