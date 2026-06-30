'use client'

import { useState } from 'react'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [file, setFile]         = useState(null)
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState('')
  const [error, setError]       = useState('')

  const handleUpload = async () => {
    if (!password)  { setError('Enter the admin password first.'); return }
    if (!file)      { setError('Select a CSV file to upload.'); return }

    setLoading(true)
    setError('')
    setSuccess('')

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1a3a5c] text-white px-6 py-4 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Admin — Import Shipments</h1>
            <p className="text-sm text-blue-200 mt-0.5">Upload a WorldShip CSV export to refresh the data</p>
          </div>
          <a href="/" className="text-xs text-blue-300 hover:text-white transition-colors">
            ← Back to search
          </a>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Upload card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUpload()}
              placeholder="Enter admin password"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* File drop area */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">WorldShip CSV Export</label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
              onClick={() => document.getElementById('csvInput').click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault()
                const f = e.dataTransfer.files[0]
                if (f) { setFile(f); setSuccess(''); setError('') }
              }}
            >
              <div className="text-4xl mb-3">📂</div>
              {file ? (
                <p className="font-semibold text-blue-700">{file.name}</p>
              ) : (
                <>
                  <p className="font-semibold text-gray-600">Click to choose a CSV, or drag and drop</p>
                  <p className="text-sm text-gray-400 mt-1">Exported from WorldShip → Tools → Export/Import Data</p>
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
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm mb-6">
            Uploading will add new shipments and update any existing ones with the same tracking number. Old records not in this file are kept.
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4 font-medium">
              ✅ {success}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full bg-[#1a3a5c] hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition-colors text-base"
          >
            {loading ? 'Importing…' : 'Import Shipments'}
          </button>
        </div>

        {/* Export instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-sm text-yellow-900">
          <strong className="block mb-2 text-yellow-800">How to export from WorldShip:</strong>
          <ol className="list-decimal pl-5 space-y-1 leading-relaxed">
            <li>Open UPS WorldShip on the shipping computer</li>
            <li>Go to <strong>Tools → Export/Import Data → Create/Edit Export File</strong></li>
            <li>Set Data Type to <strong>Shipment History</strong></li>
            <li>Set your date range (e.g. last 30 days)</li>
            <li>Include these fields: <strong>Tracking Number, Ship Date, Service Type, Weight, Zone, Published Charge, Negotiated Charge, Recipient Name</strong></li>
            <li>Save as <strong>CSV</strong></li>
            <li>Upload that file using the form above</li>
          </ol>
        </div>

      </div>
    </div>
  )
}
