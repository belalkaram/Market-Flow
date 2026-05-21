import { useEffect, useRef, useCallback, useState } from "react";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const WARNING_BEFORE_MS = 2 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];

export interface SessionTimeoutOptions {
  onTimeout: () => void;
  enabled?: boolean;
  idleTimeoutMs?: number;
  warningBeforeMs?: number;
}

export function useSessionTimeout({
  onTimeout,
  enabled = true,
  idleTimeoutMs = IDLE_TIMEOUT_MS,
  warningBeforeMs = WARNING_BEFORE_MS,
}: SessionTimeoutOptions) {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(Math.floor(warningBeforeMs / 1000));
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const startCountdown = useCallback(() => {
    setSecondsLeft(Math.floor(warningBeforeMs / 1000));
    countdownRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [warningBeforeMs]);

  const resetTimers = useCallback(() => {
    if (!enabled) return;
    clearTimers();
    setShowWarning(false);

    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      startCountdown();
      idleTimerRef.current = setTimeout(() => {
        onTimeout();
      }, warningBeforeMs);
    }, idleTimeoutMs - warningBeforeMs);
  }, [enabled, clearTimers, startCountdown, onTimeout, idleTimeoutMs, warningBeforeMs]);

  const dismissWarning = useCallback(() => {
    setShowWarning(false);
    resetTimers();
  }, [resetTimers]);

  useEffect(() => {
    if (!enabled) return;
    resetTimers();
    const handleActivity = () => resetTimers();
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }));
    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, [enabled, resetTimers, clearTimers]);

  return { showWarning, secondsLeft, dismissWarning };
}
