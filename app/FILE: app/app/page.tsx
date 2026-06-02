'use client'
 
import Link from 'next/link'
 
export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen-mobile px-5 pt-12 pb-10 safe-bottom">
      <div className="flex items-center gap-2.5 mb-12">
        <div className="w-9 h-9 bg-green rounded-sm flex items-center justify-center">
          <span className="font-sans font-extrabold text-black text-sm">BS</span>
        </div>
        <span className="font-sans font-bold text-off-white text-base tracking-tight">Broke Social</span>
      </div>
 
      <div className="flex-1">
        <h1 className="font-sans font-extrabold text-off-white leading-none mb-4"
            style={{ fontSize: 'clamp(42px, 12vw, 56px)' }}>
          Plan the<br />move.<br />
          <span className="text-green">Split the<br />damage.</span>
        </h1>
        <p className="font-mono text-muted text-sm leading-relaxed mb-10 max-w-xs">
          The group page for your night out. Budget it, split it, recap it.
        </p>
        <div className="flex flex-col gap-3 mb-12">
          <Link href="/create" className="btn-primary text-center block">
            What's the move tonight?
          </Link>
          <Link href="/join" className="btn-secondary text-center block">
            Join a night
          </Link>
        </div>
        <div className="flex flex-col gap-3 mb-10">
          {[
            { label: 'NIGHT PLANNER', body: 'Pick the vibe, set the guardrails, send one link.' },
            { label: 'GROUP SPLIT', body: 'Add damage fast. See who owes who without the group chat trial.' },
            { label: 'DAMAGE REPORT', body: 'The enemy, the awards, the recap card people actually post.' },
          ].map((f) => (
            <div key={f.label} className="card">
              <p className="section-label mb-1">{f.label}</p>
              <p className="font-mono text-muted text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
        <div className="card border-green">
          <p className="section-label mb-3">EXAMPLE DAMAGE REPORT</p>
          <div className="flex justify-between items-baseline mb-3">
            <span className="font-mono text-muted text-xs">Planned</span>
            <span className="font-sans font-bold text-off-white text-xl">$60</span>
          </div>
          <div className="flex justify-between items-baseline mb-4">
            <span className="font-mono text-muted text-xs">Actual</span>
            <span className="font-sans font-extrabold text-green text-3xl">$91</span>
          </div>
          <div className="divider" />
          <p className="font-mono text-muted text-xs leading-relaxed">
            The enemy was Uber. Your group is financially unserious, but the vibes survived.
          </p>
        </div>
      </div>
    </div>
  )
}
