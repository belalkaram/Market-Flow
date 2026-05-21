import { useAuth } from "@/hooks/useAuth";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { Button } from "@/components/ui/button";
import { Clock, LogOut } from "lucide-react";

export function SessionTimeoutGuard() {
  const { currentUser, logout } = useAuth();

  const { showWarning, secondsLeft, dismissWarning } = useSessionTimeout({
    enabled: !!currentUser,
    onTimeout: logout,
    idleTimeoutMs: 30 * 60 * 1000,
    warningBeforeMs: 2 * 60 * 1000,
  });

  if (!showWarning) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeStr = minutes > 0
    ? `${minutes}:${String(seconds).padStart(2, "0")} دقيقة`
    : `${seconds} ثانية`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-gray-100">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">انتهاء الجلسة قريباً</h2>
            <p className="text-gray-600 text-sm">
              سيتم تسجيل خروجك تلقائياً بعد
            </p>
            <p className="text-2xl font-bold text-orange-500 mt-2 font-mono">{timeStr}</p>
            <p className="text-gray-500 text-xs mt-1">بسبب عدم النشاط</p>
          </div>
          <div className="flex gap-3 w-full mt-2">
            <Button onClick={dismissWarning} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
              الاستمرار في الجلسة
            </Button>
            <Button onClick={logout} variant="outline" className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50">
              <LogOut className="w-4 h-4 ml-1" />
              خروج الآن
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
