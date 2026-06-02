import type { Expense, ExpenseSplit, NightMember, MemberBalance, DebtSimplified } from './types'
 
export function calculateEvenSplit(amount: number, memberIds: string[]): { memberId: string; amount: number }[] {
  if (memberIds.length === 0) return []
  const base = Math.floor((amount * 100) / memberIds.length) / 100
  const remainder = parseFloat((amount - base * memberIds.length).toFixed(2))
  return memberIds.map((memberId, i) => ({ memberId, amount: i === 0 ? parseFloat((base + remainder).toFixed(2)) : base }))
}
 
export function validateCustomSplit(total: number, splits: { memberId: string; amount: number }[]): { valid: boolean; remaining: number } {
  const assigned = splits.reduce((s, sp) => s + sp.amount, 0)
  const remaining = parseFloat((total - assigned).toFixed(2))
  return { valid: Math.abs(remaining) < 0.01, remaining }
}
 
export function calculateMemberBalances(members: NightMember[], expenses: Expense[], splits: ExpenseSplit[]): MemberBalance[] {
  const balanceMap: Record<string, { paid: number; owed: number }> = {}
  for (const m of members) balanceMap[m.id] = { paid: 0, owed: 0 }
  for (const exp of expenses) if (balanceMap[exp.paid_by_member_id]) balanceMap[exp.paid_by_member_id].paid += exp.amount
  for (const split of splits) if (balanceMap[split.owed_by_member_id]) balanceMap[split.owed_by_member_id].owed += split.amount
  return members.map((member) => {
    const { paid, owed } = balanceMap[member.id] ?? { paid: 0, owed: 0 }
    return { member, totalPaid: parseFloat(paid.toFixed(2)), totalOwed: parseFloat(owed.toFixed(2)), netBalance: parseFloat((owed - paid).toFixed(2)) }
  })
}
 
export function simplifyDebts(balances: MemberBalance[], nightTitle: string): DebtSimplified[] {
  const debts: DebtSimplified[] = []
  const creditors = balances.filter((b) => b.netBalance < -0.01).map((b) => ({ member: b.member, amount: Math.abs(b.netBalance) })).sort((a, b) => b.amount - a.amount)
  const debtors = balances.filter((b) => b.netBalance > 0.01).map((b) => ({ member: b.member, amount: b.netBalance })).sort((a, b) => b.amount - a.amount)
  let i = 0, j = 0
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i], creditor = creditors[j]
    const amount = parseFloat(Math.min(debtor.amount, creditor.amount).toFixed(2))
    if (amount > 0.01) debts.push({ from: debtor.member, to: creditor.member, amount, venmoText: generateVenmoText(debtor.member.display_name, creditor.member.display_name, amount, nightTitle) })
    debtor.amount = parseFloat((debtor.amount - amount).toFixed(2))
    creditor.amount = parseFloat((creditor.amount - amount).toFixed(2))
    if (debtor.amount < 0.01) i++
    if (creditor.amount < 0.01) j++
  }
  return debts
}
 
export function generateVenmoText(fromName: string, toName: string, amount: number, nightTitle: string): string {
  return `${fromName} → ${toName}: $${amount.toFixed(2)} — Broke Social split for ${nightTitle}`
}
 
export function calculateTotalSpent(expenses: Expense[]): number {
  return parseFloat(expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2))
}
 
export function spendingByCategory(expenses: Expense[]): Record<string, number> {
  const result: Record<string, number> = {}
  for (const exp of expenses) result[exp.category] = parseFloat(((result[exp.category] ?? 0) + exp.amount).toFixed(2))
  return result
}
 
export function biggestLeakCategory(expenses: Expense[]): string | null {
  const byCat = spendingByCategory(expenses)
  if (Object.keys(byCat).length === 0) return null
  return Object.entries(byCat).sort(([, a], [, b]) => b - a)[0][0]
}
