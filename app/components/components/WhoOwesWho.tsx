'use client'
 
import { useState } from 'react'
import { calculateMemberBalances, simplifyDebts } from '@/lib/splitMath'
import type { NightMember, Expense, ExpenseSplit } from '@/lib/types'
 
interface Props { members: NightMember[]; expenses: Expense[]; splits: ExpenseSplit[]; nightTitle: string }
 
export default function WhoOwesWho({ members, expenses, splits, nightTitle }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const balances = calculateMemberBalances(members, expenses, splits)
  const debts = simplifyDebts(balances, nightTitle)
 
  async function copyVenmo(text: string, id: string) {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }
 
  if (expenses.length === 0) return (
    <div className="text-center pt-10"><p className="font-mono text-muted text-sm">Add expenses first.</p></div>
  )
 
  return (
    <div>
      <p className="section-label mb-3">BALANCES</p>
      <div className="flex flex-col gap-2 mb-6">
        {balances.map((b) => (
          <div key={b.member.id} className="card flex justify-between items-center py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-muted border border-green/30 flex items-center justify-center">
                <span className="font-sans font-bold text-green text-xs">{b.member.display_name[0].toUpperCase()}</span>
              </div>
              <div>
                <p className="font-mono text-off-white text-sm">{b.member.display_name}</p>
                <p className="font-mono text-muted text-xs">paid ${b.totalPaid.toFixed(2)}</p>
              </div>
            </div>
            <div className="text-right">
              {b.netBalance > 0.01 && <p className="font-mono text-red text-sm font-medium">owes ${b.netBalance.toFixed(2)}</p>}
              {b.netBalance < -0.01 && <p className="font-mono text-green text-sm font-medium">+${Math.abs(b.netBalance).toFixed(2)}</p>}
              {Math.abs(b.netBalance) <= 0.01 && <p className="font-mono text-muted text-sm">settled</p>}
            </div>
          </div>
        ))}
      </div>
      <p className="section-label mb-3">VENMO REQUESTS</p>
      {debts.length === 0 ? (
        <div className="card text-center py-6">
          <p className="font-sans font-bold text-green text-lg mb-1">All settled 🎉</p>
          <p className="font-mono text-muted text-xs">Nobody owes anyone. Statistically impressive.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {debts.map((debt, i) => (
            <div key={i} className="card">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-mono text-off-white text-sm font-medium">
                    <span className="text-red">{debt.from.display_name}</span>
                    <span className="text-muted mx-2">→</span>
                    <span className="text-green">{debt.to.display_name}</span>
                  </p>
                  <p className="font-sans font-bold text-off-white text-xl mt-0.5">${debt.amount.toFixed(2)}</p>
                </div>
                <button onClick={() => copyVenmo(debt.venmoText, `${i}`)}
                  className={`flex-shrink-0 font-mono text-xs px-3 py-2 rounded border transition-colors ${copiedId === `${i}` ? 'border-green text-green bg-green-muted' : 'border-border text-muted hover:border-muted hover:text-off-white'}`}>
                  {copiedId === `${i}` ? '✓ Copied' : 'Copy Venmo'}
                </button>
              </div>
              <p className="font-mono text-muted text-xs bg-black/30 rounded px-3 py-2 leading-relaxed">{debt.venmoText}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
