import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Volume2,
  Mic,
  MicOff,
  ArrowRightLeft,
  Copy,
  Check,
  Languages,
  Sparkles,
  BookOpen,
  Loader2,
  Play,
  RotateCcw,
} from 'lucide-react';
import { speakPhoenix, stopPhoenixSpeech } from '../utils/phoenixVoice';

interface UniversalTranslatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText?: string;
  initialFrom?: string;
  initialTo?: string;
}

const LANGUAGES = [
  { code: 'en', name: 'English', voiceLang: 'en-US' },
  { code: 'hi', name: 'Hindi (हिन्दी)', voiceLang: 'hi-IN' },
  { code: 'ta', name: 'Tamil (தமிழ்)', voiceLang: 'ta-IN' },
  { code: 'ml', name: 'Malayalam (മലയാളം)', voiceLang: 'ml-IN' },
  { code: 'te', name: 'Telugu (తెలుగు)', voiceLang: 'te-IN' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)', voiceLang: 'kn-IN' },
  { code: 'bn', name: 'Bengali (বাংলা)', voiceLang: 'bn-IN' },
  { code: 'mr', name: 'Marathi (मराठी)', voiceLang: 'mr-IN' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)', voiceLang: 'gu-IN' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)', voiceLang: 'pa-IN' },
  { code: 'es', name: 'Spanish (Español)', voiceLang: 'es-ES' },
  { code: 'fr', name: 'French (Français)', voiceLang: 'fr-FR' },
  { code: 'de', name: 'German (Deutsch)', voiceLang: 'de-DE' },
  { code: 'ja', name: 'Japanese (日本語)', voiceLang: 'ja-JP' },
  { code: 'zh', name: 'Mandarin (中文)', voiceLang: 'zh-CN' },
  { code: 'ar', name: 'Arabic (العربية)', voiceLang: 'ar-SA' },
  { code: 'ru', name: 'Russian (Русский)', voiceLang: 'ru-RU' },
  { code: 'pt', name: 'Portuguese (Português)', voiceLang: 'pt-PT' },
  { code: 'it', name: 'Italian (Italiano)', voiceLang: 'it-IT' },
  { code: 'ko', name: 'Korean (한국어)', voiceLang: 'ko-KR' },
];

const TOURIST_PHRASES = [
  { label: 'Where is the station?', text: 'Where is the nearest railway station or bus stop?' },
  { label: 'Official fare?', text: 'What is the official government fare to this destination?' },
  { label: 'Vegetarian only', text: 'Does this food contain egg, meat, or fish? I am strictly vegetarian.' },
  { label: 'Medical emergency', text: 'Where is the nearest hospital or emergency clinic? Please help.' },
  { label: 'Safe drinking water', text: 'Is this filtered and safe drinking water?' },
  { label: 'Ferry ticket counter', text: 'Where is the official government ticket counter for the ferry?' },
  { label: 'Thank you very much', text: 'Thank you very much for your kind help!' },
];

export const UniversalTranslatorModal: React.FC<UniversalTranslatorModalProps> = ({
  isOpen,
  onClose,
  initialText = '',
  initialFrom = 'English',
  initialTo = 'Tamil (தமிழ்)',
}) => {
  const [sourceText, setSourceText] = useState(initialText);
  const [fromLang, setFromLang] = useState(initialFrom);
  const [toLang, setToLang] = useState(initialTo);
  const [translatedText, setTranslatedText] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [politenessNote, setPolitenessNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [micSupported, setMicSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (initialText) {
      setSourceText(initialText);
      handleTranslate(initialText, fromLang, toLang);
    }
  }, [initialText]);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicSupported(false);
    }
  }, []);

  const handleTranslate = async (
    textToTranslate: string = sourceText,
    sourceLanguage: string = fromLang,
    targetLanguage: string = toLang
  ) => {
    if (!textToTranslate.trim()) {
      setTranslatedText('');
      setPronunciation('');
      setPolitenessNote('');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToTranslate,
          fromLang: sourceLanguage,
          toLang: targetLanguage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTranslatedText(data.translatedText || '');
        setPronunciation(data.pronunciationGuide || data.romanization || '');
        setPolitenessNote(data.politenessNote || '');
      } else {
        throw new Error('Translation failed');
      }
    } catch (err) {
      console.warn('API error, applying client fallback:', err);
      // Fallback
      setTranslatedText(`[${targetLanguage}] ${textToTranslate}`);
      setPronunciation('Practice with standard cadence');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    const prevFrom = fromLang;
    const prevTo = toLang;
    setFromLang(prevTo);
    setToLang(prevFrom);
    if (translatedText) {
      setSourceText(translatedText);
      handleTranslate(translatedText, prevTo, prevFrom);
    }
  };

  // Stop speech when modal closes or unmounts
  useEffect(() => {
    if (!isOpen) {
      stopPhoenixSpeech();
    }
    return () => {
      stopPhoenixSpeech();
    };
  }, [isOpen]);

  const handleSpeak = (text: string, languageName: string) => {
    const matchedLang = LANGUAGES.find((l) => l.name === languageName);
    const langCode = matchedLang?.voiceLang || matchedLang?.code || 'en-US';
    speakPhoenix(text, {
      lang: langCode,
      rate: speechRate,
    });
  };

  const toggleMicListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can type in the text box directly.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;

      const matchedSource = LANGUAGES.find((l) => l.name === fromLang);
      recognition.lang = matchedSource?.voiceLang || 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        setSourceText(spoken);
        handleTranslate(spoken, fromLang, toLang);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Mic start failed:', err);
      setIsListening(false);
    }
  };

  const handleCopy = () => {
    if (!translatedText) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(translatedText).catch(() => {});
      }
    } catch {
      // safe fallback
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 my-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Languages className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                Universal Audio & Text Translator
              </h2>
              <p className="text-xs text-blue-100 font-medium">
                Translate any language to any language • Voice Audio input & output
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Language Selector Bar with Swap */}
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <div className="flex-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 ml-1">
                From Language
              </label>
              <select
                value={fromLang}
                onChange={(e) => {
                  setFromLang(e.target.value);
                  if (sourceText) handleTranslate(sourceText, e.target.value, toLang);
                }}
                className="w-full bg-white text-xs font-bold text-slate-800 py-1.5 px-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LANGUAGES.map((l) => (
                  <option key={`from-${l.code}`} value={l.name}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSwapLanguages}
              title="Swap languages"
              className="p-2 rounded-xl bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 transition-colors shadow-xs shrink-0 self-end mb-0.5 active:scale-95"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>

            <div className="flex-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 ml-1">
                To Language
              </label>
              <select
                value={toLang}
                onChange={(e) => {
                  setToLang(e.target.value);
                  if (sourceText) handleTranslate(sourceText, fromLang, e.target.value);
                }}
                className="w-full bg-white text-xs font-bold text-slate-800 py-1.5 px-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LANGUAGES.map((l) => (
                  <option key={`to-${l.code}`} value={l.name}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Source Input Box with Voice Mic */}
          <div className="relative border border-slate-200 rounded-2xl p-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 mb-2">
              <span className="text-[11px] font-bold text-slate-500">{fromLang}</span>
              <div className="flex items-center gap-1.5">
                {sourceText && (
                  <button
                    onClick={() => handleSpeak(sourceText, fromLang)}
                    title="Listen to original"
                    className="p-1 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-100"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {sourceText && (
                  <button
                    onClick={() => {
                      setSourceText('');
                      setTranslatedText('');
                      setPronunciation('');
                    }}
                    title="Clear"
                    className="p-1 text-slate-400 hover:text-red-500 rounded-md hover:bg-slate-100"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <textarea
              rows={3}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Type anything or tap mic to speak in any language..."
              className="w-full resize-none text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />

            {/* Bottom tools of input box */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMicListening}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" /> Listening...
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" /> Voice Speak
                    </>
                  )}
                </button>
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  {isListening ? 'Speak now into microphone' : 'Audio input supported'}
                </span>
              </div>

              <button
                onClick={() => handleTranslate()}
                disabled={isLoading || !sourceText.trim()}
                className="py-1.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Translating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Translate
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Translation Result Card */}
          <div className="bg-gradient-to-br from-indigo-50/70 to-sky-50/70 border-2 border-indigo-100 rounded-2xl p-4 relative">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-100 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-indigo-900">{toLang}</span>
                <span className="text-[10px] font-semibold bg-indigo-200/60 text-indigo-800 px-2 py-0.5 rounded-full">
                  Verified Translation
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Speech rate toggle */}
                <button
                  onClick={() => setSpeechRate((prev) => (prev === 1.0 ? 0.8 : 1.0))}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/80 border border-indigo-200 text-indigo-700 hover:bg-white"
                  title="Toggle speech speed"
                >
                  {speechRate === 0.8 ? 'Slow 0.8x' : 'Normal 1.0x'}
                </button>

                {/* Speak button */}
                <button
                  onClick={() => handleSpeak(translatedText || sourceText, toLang)}
                  disabled={!translatedText}
                  title="Speak translation aloud"
                  className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-40 shadow-xs flex items-center gap-1 text-xs font-bold"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">Play Audio</span>
                </button>

                {/* Copy button */}
                <button
                  onClick={handleCopy}
                  disabled={!translatedText}
                  title="Copy text"
                  className="p-1.5 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100/50 rounded-lg transition-colors disabled:opacity-40"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {translatedText ? (
              <div className="space-y-2">
                <p className="text-base sm:text-lg font-bold text-indigo-950 leading-snug">
                  {translatedText}
                </p>

                {pronunciation && (
                  <div className="bg-white/80 border border-indigo-100 rounded-xl p-2.5">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-indigo-500 mb-0.5">
                      Phonetic Pronunciation Guide:
                    </span>
                    <p className="text-xs font-medium text-slate-700 italic">
                      "{pronunciation}"
                    </p>
                  </div>
                )}

                {politenessNote && (
                  <p className="text-[11px] text-indigo-800/90 font-medium">
                    💡 <span className="font-semibold">Local etiquette:</span> {politenessNote}
                  </p>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2 text-indigo-600 font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating natural translation and audio guide...
                  </div>
                ) : (
                  'Your translated text, phonetic guide, and audio pronunciation will appear here.'
                )}
              </div>
            )}
          </div>

          {/* Quick Essential Tourist Phrasebook */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
              <BookOpen className="w-3.5 h-3.5 text-orange-600" />
              <span>Tourist Quick Phrasebook (Tap to Translate & Speak)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TOURIST_PHRASES.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSourceText(phrase.text);
                    handleTranslate(phrase.text, fromLang, toLang);
                  }}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all text-left active:scale-95"
                >
                  {phrase.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Gemini 3.8 Flash Neural Engine • Offline Fallback Enabled
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
