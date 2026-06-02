import type { ExpenseCategory, VibeMode, BudgetBreakdown } from './types'
 
const BASE_ALLOCATIONS: Record<ExpenseCategory, number> = {
  food: 0.23, uber: 0.15, cover: 0.17, drinks: 0.27,
  snacks: 0.10, tickets: 0.17, outfit: 0.12, other: 0.08,
}
 
const VIBE_MODIFIERS: Record<VibeMode, Partial<Record<ExpenseCategory, number>>> = {
  safe:     { drinks: -0.08, uber: +0.04, food: +0.04 },
  balanced: {},
  menace:   { drinks: +0.08, uber: -0.04, food: -0.04 },
}
 
export const NIGHT_TYPE_DEFAULT_CATEGORIES: Record<string, ExpenseCategory[]> = {
  night_out: ['food', 'uber', 'cover', 'drinks'],
  dinner:    ['food', 'uber', 'drinks'],
  date:      ['food', 'uber', 'other'],
  tailgate:  ['food', 'drinks', 'snacks', 'tickets'],
  pregame:   ['drinks', 'snacks', 'food'],
  trip:      ['food', 'uber', 'drinks', 'tickets', 'other'],
  custom:    ['food', 'uber', 'drinks', 'other'],
}
 
export const NIGHT_TYPE_META: Record<string, { label: string; description: string; emoji: string }> = {
  night_out: { label: 'Night Out',  description: 'Bars, cover, Ubers, chaos',                  emoji: '🌃' },
  dinner:    { label: 'Dinner',     description: 'Sit down, split the check, tip math',          emoji: '🍽️' },
  date:      { label: 'Date',       description: "Look good, don't overspend, no awkward Venmo", emoji: '🫶' },
  tailgate:  { label: 'Tailgate',   description: 'Snacks, drinks, parking, the works',           emoji: '🏈' },
  pregame:   { label: 'Pregame',    description: 'Before the real damage starts',                emoji: '🥂' },
  trip:      { label: 'Trip',       description: 'Multi-day, multi-wallet, multi-problem',       emoji: '🧳' },
  custom:    { label: 'Custom',     description: 'Name your own chaos',                          emoji: '⚡' },
}
 
export const VIBE_META: Record<VibeMode, { label: string; description: string }> = {
  safe:     { label: 'Safe',     description: 'More buffer, less risk. Your wallet thanks you.' },
  balanced: { label: 'Balanced', description: 'Normal college night. Fun but aware.' },
  menace:   { label: 'Menace',   description: 'More fun money. Guardrails still exist. Barely.' },
}
 
export const CATEGORY_META: Record<ExpenseCategory, { label: string; emoji: string }> = {
  food:    { label: 'Food',             emoji: '🍕' },
  uber:    { label: 'Uber',             emoji: '🚗' },
  cover:   { label: 'Cover',            emoji: '🎟️' },
  drinks:  { label: 'Drinks',           emoji: '🍻' },
  snacks:  { label: 'Snacks',           emoji: '🍿' },
  tickets: { label: 'Tickets',          emoji: '🎫' },
  outfit:  { label: 'Outfit',           emoji: '👟' },
  other:   { label: 'Other',            emoji: '💸' },
}
 
export interface BudgetPlan {
  breakdown: BudgetBreakdown
  warnings: string[]
  perPerson: BudgetBreakdown
}
 
export function buildBudgetPlan(
  budget: number, categories: ExpenseCategory[], vibe: VibeMode, groupSize: number = 1
): BudgetPlan {
  if (categories.length === 0) return { breakdown: {}, warnings: ['Select at least one category.'], perPerson: {} }
 
  const baseForSelected: Partial<Record<ExpenseCategory, number>> = {}
  for (const cat of categories) baseForSelected[cat] = BASE_ALLOCATIONS[cat] ?? 0.10
 
  const vibeDeltas = VIBE_MODIFIERS[vibe]
  for (const [cat, delta] of Object.entries(vibeDeltas)) {
    const c = cat as ExpenseCategory
    if (baseForSelected[c] !== undefined) baseForSelected[c] = Math.max(0, (baseForSelected[c] ?? 0) + delta)
  }
 
  const total = Object.values(baseForSelected).reduce((s, v) => s + (v ?? 0), 0)
  const normalized: Partial<Record<ExpenseCategory, number>> = {}
  for (const [cat, pct] of Object.entries(baseForSelected)) normalized[cat as ExpenseCategory] = (pct ?? 0) / total
 
  const breakdown: BudgetBreakdown = {}
  let assigned = 0
  const cats = Object.keys(normalized) as ExpenseCategory[]
  cats.forEach((cat, i) => {
    if (i === cats.length - 1) {
      breakdown[cat] = Math.max(0, parseFloat((budget - assigned).toFixed(2)))
    } else {
      const amount = parseFloat((budget * (normalized[cat] ?? 0)).toFixed(2))
      breakdown[cat] = amount
      assigned += amount
    }
  })
 
  const perPerson: BudgetBreakdown = {}
  for (const [cat, amount] of Object.entries(breakdown))
    perPerson[cat] = parseFloat((amount / Math.max(groupSize, 1)).toFixed(2))
 
  const warnings: string[] = []
  for (const [cat, amount] of Object.entries(breakdown))
    if (amount < 5) warnings.push(`${CATEGORY_META[cat as ExpenseCategory]?.label ?? cat} budget is tight ($${amount}).`)
  if (breakdown.uber !== undefined && breakdown.uber < budget * 0.12)
    warnings.push('Uber surge could blow this plan.')
  if (vibe === 'menace') warnings.push('Late-night food not included. Budget accordingly.')
 
  return { breakdown, warnings, perPerson }
}
 
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount)
}
