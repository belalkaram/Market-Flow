export default function LoginScene() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0F172A]">
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 30% 70%, rgba(16,185,129,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(59,130,246,0.1) 0%, transparent 50%)',
        }}
      />
      {/* Cashier counter illustration */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div
          className="w-64 h-32 rounded-t-xl border border-emerald-500/30"
          style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}
        >
          <div className="flex items-center justify-center h-full">
            <div className="w-20 h-14 rounded bg-black/40 border border-emerald-500/50 flex items-center justify-center">
              <div className="w-14 h-10 rounded-sm bg-emerald-500/20 border border-emerald-500/40" />
            </div>
          </div>
        </div>
        <div
          className="w-72 h-3 rounded-b border border-emerald-500/40"
          style={{ background: '#0f172a' }}
        />
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded opacity-15 animate-float"
          style={{
            width: `${12 + (i % 3) * 8}px`,
            height: `${16 + (i % 4) * 8}px`,
            left: `${10 + (i * 11) % 80}%`,
            top: `${15 + (i * 9) % 60}%`,
            background: i % 2 === 0 ? '#10B981' : '#f59e0b',
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${4 + (i % 3)}s`,
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        />
      ))}
    </div>
  );
}
