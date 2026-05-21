export default function SplashScene() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0F172A]">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-lg opacity-20 animate-float"
          style={{
            width: `${20 + (i % 5) * 12}px`,
            height: `${20 + (i % 4) * 12}px`,
            left: `${(i * 17 + 5) % 95}%`,
            top: `${(i * 13 + 10) % 85}%`,
            background: i % 2 === 0 ? '#10B981' : '#3b82f6',
            animationDelay: `${i * 0.3}s`,
            animationDuration: `${3 + (i % 4)}s`,
            border: '1px solid rgba(16,185,129,0.4)',
          }}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.08) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
