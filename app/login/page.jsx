'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const reason = params.get('error')
    if (reason === 'domain') setError('Use your Bells of Steel Google account.')
    if (reason === 'oauth')  setError('Google sign-in failed — try again.')
  }, [])

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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true); setError('')
    const supabase = createBrowserSupabaseClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { hd: 'bellsofsteel.com', prompt: 'select_account' },
      },
    })
    if (error) { setGoogleLoading(false); setError(error.message) }
    // On success the browser navigates to Google, so no further state change here.
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

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }} />
          <span className="section-label">or</span>
          <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }} />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="btn w-full h-12 flex items-center justify-center gap-3"
          style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.9v2.33A9 9 0 009 18z" />
            <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 013.68 9c0-.59.1-1.17.27-1.7V4.97H.9A9 9 0 000 9c0 1.45.35 2.83.9 4.03l3.05-2.33z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.9 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z" />
          </svg>
          {googleLoading ? 'Redirecting…' : 'Continue with Google'}
        </button>

        <p className="section-label text-center mt-6 normal-case tracking-normal" style={{ fontSize: '11px' }}>
          Accounts are created by an admin in the Supabase dashboard — there&apos;s no self sign-up.
        </p>
      </div>
    </div>
  )
}
