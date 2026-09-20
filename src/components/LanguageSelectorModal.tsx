import React from 'react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../context/TranslationContext';
import { X, Check, Globe, Sparkles } from 'lucide-react';
import { SupportedLanguage } from '../types';

export const LanguageSelectorModal: React.FC = () => {
  const { language, setLanguage, isLanguageModalOpen, closeLanguageModal, t } = useTranslation();

  if (!isLanguageModalOpen) return null;

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    closeLanguageModal();
  };

  return (
    <div
      id="language-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={closeLanguageModal}
    >
      <div
        id="language-modal-container"
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl flex flex-col max-h-[85vh] shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Globe className="w-4 h-4 text-blue-200" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight">
                {t('app.language', 'Choose App Language')}
              </h2>
              <p className="text-[11px] text-blue-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Translates the entire JourneyBuddy app</span>
              </p>
            </div>
          </div>
          <button
            onClick={closeLanguageModal}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Close language selector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of languages */}
        <div className="p-4 overflow-y-auto space-y-2">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 text-left">
                  <span className="text-2xl" role="img" aria-label={lang.name}>
                    {lang.flag}
                  </span>
                  <div>
                    <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <span>{lang.name}</span>
                      {isSelected && (
                        <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {lang.nativeName}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer tip */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
          Phoenix AI also understands and replies in your preferred language!
        </div>
      </div>
    </div>
  );
};
