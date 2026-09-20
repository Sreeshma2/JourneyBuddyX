/**
 * Dedicated Voice Engine for Phoenix (The AI Travel Companion Fox)
 * 
 * Solves all common browser SpeechSynthesis issues:
 * - Garbage collection bug (retains global reference)
 * - Chrome/Safari stuck/paused speech synthesis engine (auto cancel & resume)
 * - Asynchronous voices loading (voiceschanged event listener)
 * - Text cleansing (strips raw markdown symbols, bullet points & disruptive emojis so speech is smooth and natural)
 * - Friendly fox pitch & tone tuning (warm, energetic, slightly higher pitch for mascot feel)
 * - Web Audio API fallback chime with explicit resume() for autoplay policy
 */

let activeUtterance: SpeechSynthesisUtterance | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];
let voiceInitAttempted = false;

// AudioContext singleton with state handling
let globalAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!globalAudioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        globalAudioCtx = new AudioContextClass();
      }
    }
    if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume().catch(() => {});
    }
    return globalAudioCtx;
  } catch {
    return null;
  }
}

// Initialize available voices
export function initPhoenixVoiceEngine(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  const loadVoices = () => {
    try {
      cachedVoices = window.speechSynthesis.getVoices();
    } catch {
      cachedVoices = [];
    }
  };

  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
  voiceInitAttempted = true;
}

// Clean text for speech output (strip markdown and emojis for clean, natural speech)
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';

  return text
    // Replace markdown bold, italics, headers
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    // Replace bullet points with pauses
    .replace(/^\s*[-•*]\s+/gm, ', ')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove URLs
    .replace(/https?:\/\/\S+/g, 'link')
    // Remove rupee symbol and pronounce as Rupees
    .replace(/₹\s?(\d+[\d,]*)/g, '$1 Rupees')
    // Remove common emojis to prevent robotic "fox face emoji" TTS pronunciation
    .replace(/[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    // Collapse duplicate whitespace and newlines
    .replace(/\s+/g, ' ')
    .trim();
}

// Find best matching voice for language & persona
function selectBestVoice(targetLang: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  if (cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices();
  }

  if (cachedVoices.length === 0) return null;

  const langCode = targetLang.toLowerCase();

  // Map app language code to BCP-47 prefixes
  const langPrefix =
    langCode === 'hi' ? 'hi' :
    langCode === 'ml' ? 'ml' :
    langCode === 'ta' ? 'ta' :
    langCode === 'te' ? 'te' :
    langCode === 'kn' ? 'kn' :
    langCode === 'bn' ? 'bn' :
    langCode === 'es' ? 'es' :
    langCode === 'fr' ? 'fr' :
    langCode === 'de' ? 'de' : 'en';

  // 1. Try to find a voice matching the language that is natural/neural/female or friendly
  const exactLangVoices = cachedVoices.filter((v) => v.lang && v.lang.toLowerCase().startsWith(langPrefix));

  if (exactLangVoices.length > 0) {
    // Prefer Google, Samantha, Victoria, Natural, or Enhanced voices
    const preferred = exactLangVoices.find(
      (v) =>
        v.name.includes('Natural') ||
        v.name.includes('Google') ||
        v.name.includes('Samantha') ||
        v.name.includes('Karen') ||
        v.name.includes('Victoria')
    );
    return preferred || exactLangVoices[0];
  }

  // 2. Default fallback to standard English voice
  const defaultEnglish = cachedVoices.find((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
  return defaultEnglish || cachedVoices[0] || null;
}

export interface SpeakOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

/**
 * Make Phoenix speak text aloud with speech synthesis.
 * Returns true if speech was successfully dispatched.
 */
export function speakPhoenix(text: string, options: SpeakOptions = {}): boolean {
  if (typeof window === 'undefined') return false;

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) return false;

  // Check if SpeechSynthesis is supported
  if (!('speechSynthesis' in window)) {
    // Fallback: play sound chime
    playPhoenixChime();
    options.onError?.('Speech synthesis not supported on this device');
    return false;
  }

  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Chrome bugfix: resume if audio engine was in suspended/paused state
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(cleaned);
    activeUtterance = utterance; // Retain global reference to prevent garbage collection!

    // Select suitable voice
    const lang = options.lang || 'en';
    const voice = selectBestVoice(lang);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = lang === 'ml' ? 'ml-IN' : lang === 'hi' ? 'hi-IN' : lang === 'es' ? 'es-ES' : 'en-US';
    }

    // Friendly fox mascot vocal tuning:
    // Slightly elevated pitch (1.15) and brisk lively rate (1.02)
    utterance.pitch = options.pitch ?? 1.15;
    utterance.rate = options.rate ?? 1.02;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      activeUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      // In Chrome, 'interrupted' or 'canceled' events are triggered when stop is called, which isn't a fatal error
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('Speech synthesis notification:', e);
      }
      activeUtterance = null;
      options.onError?.(e);
    };

    // Trigger cheerful start chime subtly before speaking for delightful feedback
    playPhoenixChime(0.06);

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('Error starting Phoenix voice:', err);
    playPhoenixChime(0.12);
    options.onError?.(err);
    return false;
  }
}

/**
 * Stop Phoenix from speaking immediately
 */
export function stopPhoenixSpeech(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  } catch {
    // Ignore cancel errors
  }
}

/**
 * Check if Phoenix is currently speaking
 */
export function isPhoenixSpeaking(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  return window.speechSynthesis.speaking;
}

/**
 * Play Phoenix's signature cheerful mascot sound
 * Resilient against browser AudioContext autoplay policies
 */
export function playPhoenixChime(volume = 0.12): void {
  try {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;

    // 3-note upbeat arpeggio (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(volume, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.22);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  } catch {
    // Audio policy fallback
  }
}

// Auto-initialize when file is imported
if (typeof window !== 'undefined') {
  initPhoenixVoiceEngine();
}
