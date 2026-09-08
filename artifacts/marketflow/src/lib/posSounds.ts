// POS Sound Synthesis Engine using Web Audio API
// 100% offline, zero network requests, ultra-low latency

export type PosSoundType = 'beep' | 'chime' | 'cash_register' | 'pop' | 'bell' | 'scanner';

export interface PosSoundConfig {
  enabled: boolean;
  type: PosSoundType;
  volume: number; // 0.0 to 1.0
}

export const SOUND_OPTIONS: { id: PosSoundType; label: string; description: string }[] = [
  { id: 'chime', label: 'رنين ناعم (Chime)', description: 'نغمة كورد هادئة ومريحة للأذن' },
  { id: 'beep', label: 'صفارة سريعة (Beep)', description: 'صوت بيب قياسي لقارئ الباركود التقليدي' },
  { id: 'cash_register', label: 'كاشير كلاسيكي (Register)', description: 'صوت آلة تسجيل النقد الميكانيكية' },
  { id: 'pop', label: 'نقرة عصرية (Pop)', description: 'صوت نقرة فقاعة خفيفة ولطيفة' },
  { id: 'bell', label: 'جرس خدمة (Bell)', description: 'رنين جرس استقبال صافي مع صدى لطيف' },
  { id: 'scanner', label: 'ماسح ضوئي ذكي (Scanner)', description: 'تأثير إلكتروني حديث للمسح المتقدم' },
];

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    console.warn('Web Audio API not supported or blocked:', e);
    return null;
  }
}

export function getPosSoundConfig(): PosSoundConfig {
  try {
    const enabled = localStorage.getItem('mf_settings_pos_sound_notify') !== 'false';
    const type = (localStorage.getItem('mf_settings_pos_sound_type') as PosSoundType) || 'chime';
    const volRaw = localStorage.getItem('mf_settings_pos_sound_volume');
    const volume = volRaw ? Math.max(0, Math.min(1, parseFloat(volRaw))) : 0.7;
    return { enabled, type, volume };
  } catch {
    return { enabled: true, type: 'chime', volume: 0.7 };
  }
}

export function savePosSoundConfig(config: Partial<PosSoundConfig>) {
  if (config.enabled !== undefined) {
    localStorage.setItem('mf_settings_pos_sound_notify', String(config.enabled));
  }
  if (config.type !== undefined) {
    localStorage.setItem('mf_settings_pos_sound_type', config.type);
  }
  if (config.volume !== undefined) {
    localStorage.setItem('mf_settings_pos_sound_volume', String(config.volume));
  }
}

export function playPosSound(forcedType?: PosSoundType, forcedVolume?: number) {
  const config = getPosSoundConfig();
  if (!config.enabled && !forcedType) return;

  const type = forcedType || config.type;
  const volume = (forcedVolume !== undefined ? forcedVolume : config.volume) * 0.25; // Normalize to pleasant decibels

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  switch (type) {
    case 'beep': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1050, now);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.085);
      break;
    }

    case 'chime': {
      // Dual harmonious tone (C5 and E5)
      [523.25, 659.25].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        
        gain.gain.setValueAtTime(volume * 0.7, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.21);
      });
      break;
    }

    case 'cash_register': {
      // Mechanical metallic ding double stroke
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(987.77, now); // B5
      gain1.gain.setValueAtTime(volume, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.075);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      gain2.gain.setValueAtTime(volume * 1.2, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.29);
      break;
    }

    case 'pop': {
      // Soft rounded bubble pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);

      gain.gain.setValueAtTime(volume * 1.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.065);
      break;
    }

    case 'bell': {
      // Service bell with rich harmonic decay
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now); // A6
      gain.gain.setValueAtTime(volume * 0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
      break;
    }

    case 'scanner': {
      // Quick futuristic chirp
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.linearRampToValueAtTime(2200, now + 0.05);

      gain.gain.setValueAtTime(volume * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.075);
      break;
    }
  }
}
