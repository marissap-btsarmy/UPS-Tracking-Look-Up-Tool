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
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <header className="border-b-2 border-text px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-surface-2 flex items-center justify-center text-white text-xs font-heading font-bold">
              UPS
            </div>
            <div>
              <p className="page-title text-text leading-none">Import Shipments</p>
              <p className="section-label mt-1">Admin</p>
            </div>
          </div>
          <a href="/" className="btn btn-ghost px-3 py-2">
            ← Back to search
          </a>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-14">

        <div className="card p-8">

          {/* Password */}
          <div className="mb-6">
            <label className="section-label block mb-2">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUpload()}
              placeholder="Enter password"
              className="field w-full h-12 px-4 text-sm"
            />
          </div>

          {/* File drop area */}
          <div className="mb-6">
            <label className="section-label block mb-2">WorldShip CSV Export</label>
            <div
              className="p-10 text-center cursor-pointer transition-colors"
              style={{
                border: `2px dashed ${file ? 'var(--accent)' : 'var(--border)'}`,
                background: file ? 'rgba(255,75,41,0.06)' : 'transparent',
              }}
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
                  <p className="mono text-sm text-text font-bold">{file.name}</p>
                  <p className="section-label mt-2">Ready to import — click to change</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-text">Click to choose a file, or drag and drop</p>
                  <p className="section-label mt-2">WorldShip CSV export (.csv)</p>
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
          <div className="px-4 py-3 text-xs mb-6" style={{ background: 'rgba(180,83,9,0.08)', border: '1px solid var(--warn)', color: 'var(--warn)' }}>
            Uploading adds new shipments and updates existing ones. Records not in this file are kept.
          </div>

          {error && (
            <div className="px-4 py-3 text-sm mb-4" style={{ background: 'rgba(187,58,46,0.08)', border: '1px solid var(--bad)', color: 'var(--bad)' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="px-4 py-3 text-sm mb-4 font-bold" style={{ background: 'rgba(44,133,83,0.08)', border: '1px solid var(--ok)', color: 'var(--ok)' }}>
              {success}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={loading}
            className="btn btn-accent w-full h-12"
          >
            {loading ? 'Importing…' : 'Import Shipments'}
          </button>
        </div>

      </div>
    </div>
  )
}
