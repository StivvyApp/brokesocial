'use client'
 
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { NIGHT_TYPE_META, VIBE_META } from '@/lib/budgetPlanner'
import type { Night } from '@/lib/types'
import Link from 'next/link'
 
export default function JoinNightPage() {
  const router = useRouter()
  const params = useParams()
  const inviteCode = (params?.inviteCode as string ?? '').toUpperCase().replace(/-/g, '')
  const [night, setNight] = useState<Night | null>(null)
  const [memberCount, setMemberCount] = useState(0)
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
 
  useEffect(() => { if (inviteCode) loadNight() }, [inviteCode])
 
  async function loadNight() {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('nights').select('*').eq('invite_code', inviteCode).single()
    if (error || !data) { setNotFound(true); setLoading(false); return }
    setNight(data)
    const { count } = await supabase
      .from('night_members').select('*', { count: 'exact', head: true }).eq('night_id', data.id)
    setMemberCount(count ?? 0)
    setLoading(false)
  }
 
  async function handleJoin() {
    if (!displayName.trim() || !night) return
    setJoining(true); setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error: memberError } = await supabase.from('night_members').insert({
      night_id: night.id, user_id: user?.id ?? null,
      display_name: displayName.trim(), is_creator: false,
    })
    if (memberError) { setError('Could not join. Try again.'); setJoining(false); return }
    router.push(`/night/${night.id}`)
  }
 
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen-mobile">
      <p className="font-mono text-muted text-sm">Loading...</p>
    </div>
  )
 
  if (notFound) return (
    <div className="flex flex-col items-center justify-center min-h-screen-mobile px-5 text-center">
      <p className="font-sans font-bold text-off-white text-xl mb-2">Night not found</p>
      <p className="font-mono text-muted text-sm mb-8">Check the link and try again.</p>
      <Link href="/" className="btn-secondary max-w-xs">Back to home</Link>
    </div>
  )
 
  if (!night) return null
 
  const perPerson = night.group_size > 1
    ? `~$${(night.budget_total / night.group_size).toFixed(0)}/person`
    : `$${night.budget_total} total`
 
  return (
    <div className="flex flex-col min-h-screen-mobile px-5 pt-10 pb-10 safe-bottom">
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-green rounded-sm flex items-center justify-center">
            <span className="font-sans font-extrabold text-black text-sm">BS</span>
          </div>
          <span className="font-sans font-bold text-off-white text-base">Broke Social</span>
        </div>
        <h1 className="font-sans font-extrabold text-off-white text-3xl leading-tight mb-2">Join a night</h1>
        <p className="font-mono text-muted text-xs">No account wall. See the move, type your name, you're in.</p>
      </div>
      <div className="card mb-8">
        <p className="section-label mb-3">{night.title.toUpperCase()}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="chip chip-selected">{NIGHT_TYPE_META[night.night_type].label}</span>
          <span className="chip">{VIBE_META[night.vibe_mode].label}</span>
          <span className="chip">{perPerson}</span>
        </div>
        <p className="font-mono text-muted text-xs">
          {memberCount} {memberCount === 1 ? 'person' : 'people'} already in
        </p>
      </div>
      <div className="mb-6">
        <label className="input-label">WHAT DO THEY CALL YOU?</label>
        <input className="input" value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display name" maxLength={30}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()} autoFocus />
      </div>
      {error && <div className="mb-4 p-3 bg-red/10 border border-red/30 rounded text-red font-mono text-xs">{error}</div>}
      <button className="btn-primary mb-4" onClick={handleJoin} disabled={joining || !displayName.trim()}>
        {joining ? 'Joining...' : 'Join the night'}
      </button>
      <p className="font-mono text-muted text-xs text-center">You can create an account later to track your history.</p>
    </div>
  )
}
