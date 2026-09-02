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
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1a3554 50%, #0f172a 100%)' }}>
      <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">

        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/30">
            UPS
          </div>
          <div>
            <p className="text-white font-semibold leading-none">Shipping Cost Lookup</p>
            <p className="text-blue-400 text-xs mt-0.5">Bells of Steel</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="you@bellsofsteel.com"
            className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all"
            autoComplete="email"
            autoFocus
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Enter password"
            className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className="bg-red-500/15 border border-red-500/25 text-red-300 px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-400 active:bg-blue-600 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-500/20 text-sm"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="text-xs text-slate-500 text-center mt-6">
          Accounts are created by an admin in the Supabase dashboard — there&apos;s no self sign-up.
        </p>
      </div>
    </div>
  )
}
