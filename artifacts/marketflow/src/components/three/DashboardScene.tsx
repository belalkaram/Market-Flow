export default function DashboardScene() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float"
          style={{
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            left: `${(i * 7 + 3) % 97}%`,
            top: `${(i * 11 + 5) % 93}%`,
            background: i % 3 === 0 ? '#10B981' : i % 3 === 1 ? '#3b82f6' : '#f59e0b',
            opacity: 0.15,
            animationDelay: `${i * 0.2}s`,
            animationDuration: `${5 + (i % 5)}s`,
          }}
        />
      ))}
    </div>
  );
}
