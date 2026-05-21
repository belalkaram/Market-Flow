import { useEffect, useState, Suspense, lazy } from 'react';
import { useLocation } from 'wouter';
import { Progress } from '@/components/ui/progress';
import { useFadeIn } from '@/hooks/useGsap';

const SplashScene = lazy(() => import('../components/three/SplashScene'));

export default function SplashPage() {
  const [, setLocation] = useLocation();
  const [progress, setProgress] = useState(0);
  const fadeRef = useFadeIn(0.2, 1);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(timer);
          return 100;
        }
        return old + 2;
      });
    }, 50);

    const navTimer = setTimeout(() => {
      setLocation('/login');
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(navTimer);
    };
  }, [setLocation]);

  return (
    <div className="relative w-full h-screen bg-[#0F172A] overflow-hidden flex flex-col items-center justify-center text-white" dir="rtl">
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>
          <SplashScene />
        </Suspense>
      </div>
      
      <div ref={fadeRef} className="z-10 flex flex-col items-center space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center font-bold text-4xl shadow-[0_0_30px_rgba(16,185,129,0.5)]">
            M
          </div>
          <h1 className="text-5xl font-bold tracking-tight">
            Market<span className="text-primary">Flow</span>
          </h1>
        </div>
        
        <p className="text-xl text-slate-300 font-light">نظام ذكي لإدارة السوبرماركت والبقالات</p>
        
        <div className="w-64 space-y-2 mt-12">
          <Progress value={progress} className="h-2 bg-slate-800 [&>div]:bg-primary" />
          <p className="text-xs text-center text-slate-400">جاري تحميل النظام... {Math.round(progress)}%</p>
        </div>
      </div>
    </div>
  );
}
