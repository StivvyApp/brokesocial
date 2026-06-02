'use client'
 
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  NIGHT_TYPE_META, VIBE_META, CATEGORY_META,
  NIGHT_TYPE_DEFAULT_CATEGORIES, buildBudgetPlan,
} from '@/lib/budgetPlanner'
import { generateInviteCode } from '@/lib/inviteCodes'
import { createClient } from '@/lib/supabase/client'
import type { NightType, VibeMode, ExpenseCategory, CreateNightForm } from '@/lib/types'
 
const NIGHT_TYPES = Object.keys(NIGHT_TYPE_META) as NightType[]
const VIBE_MODES = Object.keys(VIBE_META) as VibeMode[]
const ALL_CATEGORIES = Object.keys(CATEGORY_META) as ExpenseCategory[]
 
const DEFAULT_FORM: CreateNightForm = {
  title: 'Friday Night',
  night_type: 'night_out',
  budget_total: 60,
  group_size: 4,
  vibe_mode: 'balanced',
  categories: ['food', 'uber', 'cover', 'drinks'],
}
 
export default function CreateNightPage() {
  const router = useRouter()
  const [form, setForm] = useState<CreateNightForm>(DEFAULT_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
 
  const perPerson = form.budget_total > 0 && form.group_size > 1
    ? (form.budget_total / form.group_size).toFixed(2) : null
 
  const plan = form.budget_total > 0 && form.categories.length > 0
    ? buildBudgetPlan(form.budget_total, form.categories, form.vibe_mode, form.group_size)
    : null
 
  function selectNightType(type: NightType) {
    const defaultCats = NIGHT_TYPE_DEFAULT_CATEGORIES[type] ?? ['food', 'uber', 'other']
    const title = type === 'custom' ? form.title : NIGHT_TYPE_META[type].label
    setForm((f) => ({ ...f, night_type: type, categories: defaultCats, title }))
  }
 
  function toggleCategory(cat: ExpenseCategory) {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter((c) => c !== cat)
        : [...f.categories, cat],
    }))
  }
 
  async function handleSubmit() {
    if (!form.title.trim()) return setError('Give the night a name.')
    if (form.budget_total <= 0) return setError('Add a budget.')
    if (form.categories.length === 0) return setError('Pick at least one category.')
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const inviteCode = generateInviteCode()
      const { data: night, error: nightError } = await supabase
        .from('nights')
        .insert({
          invite_code: inviteCode,
          creator_id: user?.id ?? null,
          title: form.title.trim(),
          night_type: form.night_type,
          budget_total: form.budget_total,
          group_size: form.group_size,
          vibe_mode: form.vibe_mode,
          categories: form.categories,
          budget_breakdown: plan?.breakdown ?? {},
        })
        .select()
        .single()
      if (nightError) throw nightError
      if (user) {
        const { data: profile } = await supabase
          .from('users').select('display_name').eq('id', user.id).single()
        await supabase.from('night_members').insert({
          night_id: night.id, user_id: user.id,
          display_name: profile?.display_name ?? 'You', is_creator: true,
        })
      }
      router.push(`/night/${night.id}`)
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.')
      setLoading(false)
    }
  }
 
  return (
    <div className="flex flex-col min-h-screen-mobile">
      <div className="flex items-center justify-between px-5 pt-10 pb-6">
        <Link href="/" className="btn-ghost px-0 text-muted">← Back</Link>
      </div>
      <div className="flex-1 px-5 pb-10 safe-bottom overflow-y-auto">
        <h1 className="font-sans font-extrabold text-off-white text-3xl leading-tight mb-1">
          What's the move<br />tonight?
        </h1>
        <p className="font-mono text-muted text-xs mb-8">Make the private group page. No finance portal behavior.</p>
 
        <div className="mb-7">
          <p className="section-label">PICK THE MOVE</p>
          <div className="grid grid-cols-2 gap-2">
            {NIGHT_TYPES.map((type) => {
              const meta = NIGHT_TYPE_META[type]
              const selected = form.night_type === type
              return (
                <button key={type} onClick={() => selectNightType(type)}
                  className={selected ? 'card-selected text-left' : 'card-interactive text-left'}>
                  <p className={`font-sans font-bold text-sm mb-0.5 ${selected ? 'text-green' : 'text-off-white'}`}>
                    {meta.label}
                  </p>
                  <p className="font-mono text-muted text-xs leading-tight">{meta.description}</p>
                </button>
              )
            })}
          </div>
        </div>
 
        {form.night_type === 'custom' && (
          <div className="mb-7">
            <label className="input-label">NIGHT NAME</label>
            <input className="input" value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Friday Night" maxLength={60} />
          </div>
        )}
 
        <div className="mb-7">
          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <label className="input-label">YOUR BUDGET</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-mono text-sm">$</span>
                <input type="number" className="input pl-8" value={form.budget_total || ''}
                  onChange={(e) => setForm((f) => ({ ...f, budget_total: parseFloat(e.target.value) || 0 }))}
                  placeholder="60" min={1} />
              </div>
            </div>
            <div className="w-24">
              <label className="input-label">GROUP SIZE</label>
              <input type="number" className="input text-center" value={form.group_size || ''}
                onChange={(e) => setForm((f) => ({ ...f, group_size: parseInt(e.target.value) || 1 }))}
                min={1} max={30} />
            </div>
          </div>
          {perPerson && (
            <div className="card bg-transparent border-border/50">
              <p className="section-label mb-0.5">PER PERSON</p>
              <p className="font-sans font-extrabold text-green text-2xl">${perPerson}</p>
            </div>
          )}
        </div>
 
        <div className="mb-7">
          <p className="section-label">VIBE MODE</p>
          <div className="flex flex-col gap-2">
            {VIBE_MODES.map((vibe) => {
              const meta = VIBE_META[vibe]
              const selected = form.vibe_mode === vibe
              return (
                <button key={vibe} onClick={() => setForm((f) => ({ ...f, vibe_mode: vibe }))}
                  className={selected ? 'card-selected text-left' : 'card-interactive text-left'}>
                  <p className={`font-sans font-bold text-sm mb-0.5 ${selected ? 'text-green' : 'text-off-white'}`}>
                    {meta.label}
                  </p>
                  <p className="font-mono text-muted text-xs">{meta.description}</p>
                </button>
              )
            })}
          </div>
        </div>
 
        <div className="mb-7">
          <p className="section-label">SPENDING CATEGORIES</p>
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map((cat) => {
              const meta = CATEGORY_META[cat]
              const selected = form.categories.includes(cat)
              return (
                <button key={cat} onClick={() => toggleCategory(cat)}
                  className={selected ? 'chip-selected' : 'chip'}>
                  <span>{meta.emoji}</span><span>{meta.label}</span>
                </button>
              )
            })}
          </div>
        </div>
 
        {plan && Object.keys(plan.breakdown).length > 0 && (
          <div className="mb-7">
            <p className="section-label">YOUR PLAN</p>
            <div className="card">
              {Object.entries(plan.breakdown).map(([cat, amount]) => (
                <div key={cat} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
                  <span className="font-mono text-muted text-sm flex items-center gap-1.5">
                    {CATEGORY_META[cat as ExpenseCategory]?.emoji}
                    {CATEGORY_META[cat as ExpenseCategory]?.label ?? cat}
                  </span>
                  <span className="font-mono text-off-white text-sm">${amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
            {plan.warnings.length > 0 && (
              <div className="mt-2 flex flex-col gap-1.5">
                {plan.warnings.map((w, i) => (
                  <p key={i} className="font-mono text-orange text-xs">⚠ {w}</p>
                ))}
              </div>
            )}
          </div>
        )}
 
        {error && (
          <div className="mb-4 p-3 bg-red/10 border border-red/30 rounded text-red font-mono text-xs">{error}</div>
        )}
        <button className="btn-primary" onClick={handleSubmit}
          disabled={loading || form.categories.length === 0 || form.budget_total <= 0}>
          {loading ? 'Creating...' : 'Create the night →'}
        </button>
      </div>
    </div>
  )
}
