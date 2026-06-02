import type { Night, NightMember, Expense, ExpenseSplit, DamageReport, MemberAward, AwardType } from './types'
import { calculateMemberBalances, spendingByCategory, biggestLeakCategory } from './splitMath'
import { CATEGORY_META } from './budgetPlanner'
 
export function getRoastText(overBy: number, biggestLeak: string | null): string {
  if (overBy <= 0) return "You stayed on budget. Statistically impossible. We're proud and suspicious."
  if (biggestLeak === 'uber' && overBy > 30) return "Uber was not transportation. It was a financial crime scene."
  if (biggestLeak === 'uber') return "The enemy was Uber. It always is."
  if (biggestLeak === 'food' && overBy > 40) return "Late-night food did generational damage to this budget."
  if (biggestLeak === 'food') return "Eating was the move. Your bank account disagrees."
  if (biggestLeak === 'cover') return "You paid cover to make questionable decisions. Respect the commitment."
  if (biggestLeak === 'drinks' && overBy > 50) return "Your bank account got jumped and drinks held the weapon."
  if (biggestLeak === 'drinks') return "The drinks were good. Your budget was not."
  if (overBy > 60) return "This was not a night out. This was a financial incident."
  if (overBy > 40) return "Your bank account noticed. It is not happy."
  if (overBy > 20) return "Financially questionable, but the vibes survived."
  return "Close enough. The budget lost but at least you showed up."
}
 
export function getGroupRating(overBy: number, plannedTotal: number): string {
  const pct = plannedTotal > 0 ? (overBy / plannedTotal) * 100 : 0
  if (overBy <= 0) return 'Financially Responsible (suspicious)'
  if (pct <= 15) return 'Financially Questionable But Fun'
  if (pct <= 30) return 'Your Bank Account Noticed'
  if (pct <= 50) return 'Economically Unserious'
  return 'Financial Crime Scene'
}
 
const AWARD_META: Record<AwardType, string> = {
  uber_victim: 'Uber Victim', responsible_menace: 'Responsible Menace',
  late_night_food_liability: 'Late-Night Food Liability', budget_demon: 'Budget Demon',
  cover_charge_casualty: 'Cover Charge Casualty', financially_dangerous: 'Financially Dangerous',
  most_economical_menace: 'Most Economical Menace', top_payer: 'Top Payer', biggest_debtor: 'Biggest Debtor',
}
 
export function assignAwards(members: NightMember[], expenses: Expense[], splits: ExpenseSplit[], balances: ReturnType<typeof calculateMemberBalances>): MemberAward[] {
  if (members.length === 0) return []
  const awards: MemberAward[] = []
  const assigned = new Set<string>()
  const memberCategorySpend: Record<string, Record<string, number>> = {}
  for (const m of members) memberCategorySpend[m.id] = {}
  for (const exp of expenses) {
    if (!memberCategorySpend[exp.paid_by_member_id]) continue
    memberCategorySpend[exp.paid_by_member_id][exp.category] = (memberCategorySpend[exp.paid_by_member_id][exp.category] ?? 0) + exp.amount
  }
  function assign(memberId: string, award: AwardType) {
    if (assigned.has(memberId)) return
    const member = members.find((m) => m.id === memberId)
    if (!member) return
    assigned.add(memberId)
    awards.push({ member_id: memberId, member_name: member.display_name, award, label: AWARD_META[award] })
  }
  const topSpender = [...balances].sort((a, b) => b.totalPaid - a.totalPaid)[0]
  if (topSpender) assign(topSpender.member.id, 'financially_dangerous')
  const lowestSpender = [...balances].filter((b) => b.totalPaid > 0).sort((a, b) => a.totalPaid - b.totalPaid)[0]
  if (lowestSpender && lowestSpender.member.id !== topSpender?.member.id) assign(lowestSpender.member.id, 'most_economical_menace')
  const uberVictim = [...members].sort((a, b) => (memberCategorySpend[b.id]?.uber ?? 0) - (memberCategorySpend[a.id]?.uber ?? 0)).find((m) => (memberCategorySpend[m.id]?.uber ?? 0) > 0)
  if (uberVictim) assign(uberVictim.id, 'uber_victim')
  const coverCasualty = [...members].sort((a, b) => (memberCategorySpend[b.id]?.cover ?? 0) - (memberCategorySpend[a.id]?.cover ?? 0)).find((m) => (memberCategorySpend[m.id]?.cover ?? 0) > 0)
  if (coverCasualty) assign(coverCasualty.id, 'cover_charge_casualty')
  const foodLiability = [...members].sort((a, b) => (memberCategorySpend[b.id]?.food ?? 0) - (memberCategorySpend[a.id]?.food ?? 0)).find((m) => (memberCategorySpend[m.id]?.food ?? 0) > 0)
  if (foodLiability) assign(foodLiability.id, 'late_night_food_liability')
  const responsibleMenace = [...balances].filter((b) => !assigned.has(b.member.id)).sort((a, b) => Math.abs(a.netBalance) - Math.abs(b.netBalance))[0]
  if (responsibleMenace) assign(responsibleMenace.member.id, 'responsible_menace')
  const biggestDebtor = [...balances].sort((a, b) => b.netBalance - a.netBalance)[0]
  if (biggestDebtor && biggestDebtor.netBalance > 0) assign(biggestDebtor.member.id, 'budget_demon')
  for (const member of members) {
    if (!assigned.has(member.id)) {
      const balance = balances.find((b) => b.member.id === member.id)
      if (balance && balance.totalPaid > 0) assign(member.id, 'top_payer')
    }
  }
  return awards
}
 
export function generateDamageReport(night: Night, members: NightMember[], expenses: Expense[], splits: ExpenseSplit[]): Omit<DamageReport, 'id' | 'created_at' | 'updated_at'> {
  const actualTotal = parseFloat(expenses.reduce((s, e) => s + e.amount, 0).toFixed(2))
  const overUnder = parseFloat((actualTotal - night.budget_total).toFixed(2))
  const biggestLeak = biggestLeakCategory(expenses)
  const balances = calculateMemberBalances(members, expenses, splits)
  const awards = assignAwards(members, expenses, splits, balances)
  return {
    night_id: night.id,
    planned_total: night.budget_total,
    actual_total: actualTotal,
    over_under: overUnder,
    biggest_leak_category: biggestLeak as any,
    awards,
    roast_text: getRoastText(overUnder, biggestLeak),
    group_rating: getGroupRating(overUnder, night.budget_total),
  }
}
 
export function getAwardEmoji(award: AwardType): string {
  const map: Record<AwardType, string> = {
    uber_victim: '🚗', responsible_menace: '🧮', late_night_food_liability: '🍕',
    budget_demon: '😈', cover_charge_casualty: '🎟️', financially_dangerous: '💀',
    most_economical_menace: '🏆', top_payer: '💳', biggest_debtor: '📉',
  }
  return map[award] ?? '🏅'
}
 
export function getCategoryLabel(category: string): string {
  return CATEGORY_META[category as keyof typeof CATEGORY_META]?.label ?? category
}
