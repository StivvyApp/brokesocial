'use client'
 
interface BudgetBarProps { planned: number; spent: number; remaining: number }
 
export default function BudgetBar({ planned, spent, remaining }: BudgetBarProps) {
  const pct = planned > 0 ? Math.min((spent / planned) * 100, 100) : 0
  const isOver = spent > planned
  const overAmt = isOver ? spent - planned : null
  const barColor = pct < 70 ? '#b8f060' : pct < 90 ? '#ff8c42' : '#ff4d4d'
 
  return (
    <div className="card">
      <div className="flex justify-between items-baseline mb-3">
        <div>
          <p className="section-label mb-0.5">SPENT</p>
          <p className={`font-sans font-extrabold text-2xl ${isOver ? 'text-red' : 'text-off-white'}`}>
            ${spent.toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="section-label mb-0.5">{isOver ? 'OVER BY' : 'LEFT'}</p>
          <p className={`font-sans font-bold text-xl ${isOver ? 'text-red' : 'text-green'}`}>
            {isOver ? `+$${overAmt!.toFixed(2)}` : `$${remaining.toFixed(2)}`}
          </p>
        </div>
      </div>
      <div className="budget-bar-track">
        <div className="budget-bar-fill" style={{ width: `${pct}%`, backgroundColor: barColor }} />
      </div>
      <p className="font-mono text-muted text-xs mt-1.5">${spent.toFixed(2)} of ${planned.toFixed(2)} planned</p>
    </div>
  )
}
