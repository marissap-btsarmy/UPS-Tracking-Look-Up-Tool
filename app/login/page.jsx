'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleLogin = async () => {
    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) { setError('Enter your email and password.'); return }
    if (!trimmedEmail.toLowerCase().endsWith('@bellsofsteel.com')) {
      setError('Use your Bells of Steel email address.')
      return
    }
    setLoading(true); setError('')
    const supabase = createBrowserSupabaseClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm card p-8">

        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-surface-2 flex items-center justify-center text-white text-xs font-heading font-bold">
            UPS
          </div>
          <div>
            <p className="page-title text-text leading-none">Shipping Cost Lookup</p>
            <p className="section-label mt-1">Bells of Steel</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="section-label block mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="you@bellsofsteel.com"
            className="field w-full h-12 px-4 text-sm"
            autoComplete="email"
            autoFocus
          />
        </div>

        <div className="mb-6">
          <label className="section-label block mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Enter password"
            className="field w-full h-12 px-4 text-sm"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className="px-4 py-3 text-sm mb-4" style={{ background: 'rgba(187,58,46,0.08)', border: '1px solid var(--bad)', color: 'var(--bad)' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn btn-accent w-full h-12"
        >
          {loading ? 'Signing in…' : 'Log in'}
        </button>

        <p className="section-label text-center mt-6 normal-case tracking-normal" style={{ fontSize: '11px' }}>
          Accounts are created by an admin in the Supabase dashboard — there&apos;s no self sign-up.
        </p>
      </div>
    </div>
  )
}
