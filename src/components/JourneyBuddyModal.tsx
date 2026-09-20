import React, { useState, useEffect, useRef } from 'react';
import { PhoenixAvatar } from './PhoenixAvatar';
import { ChatMessage, JourneyBuddyAction, TravelContextMemory } from '../types';
import { Send, Sparkles, X, RotateCcw, Mic, MicOff, Compass, ArrowRight, CornerDownLeft, Volume2, VolumeX } from 'lucide-react';
import { getInteractiveAssistantReply, extractConversationalContext } from '../utils/aiTravelCompanion';
import { useTranslation } from '../context/TranslationContext';
import { speakPhoenix, stopPhoenixSpeech } from '../utils/phoenixVoice';

export interface JourneyBuddyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreenContext?: {
    screenName: string;
    destinationName?: string;
    contextId?: string;
  };
  currentScreen?: string;
  activeDestinationName?: string;
  onExecuteAction?: (actionKey: string, data?: any) => void;
  onNavigateToTab?: (tab: any) => void;
  onOpenLifeline?: () => void;
  onOpenTripPlanner?: () => void;
  initialPrompt?: string;
}

// Session-level persistent conversation memory
let sessionMessageBuffer: ChatMessage[] = [];
let sessionTravelMemory: TravelContextMemory = {
  userName: 'Sreeshma',
  budget: 5000,
};

export const JourneyBuddyModal: React.FC<JourneyBuddyModalProps> = ({
  isOpen,
  onClose,
  currentScreenContext,
  currentScreen = 'HOME',
  activeDestinationName,
  onExecuteAction,
  onNavigateToTab,
  onOpenLifeline,
  onOpenTripPlanner,
  initialPrompt,
}) => {
  const { t, language } = useTranslation();

  const [messages, setMessages] = useState<ChatMessage[]>(sessionMessageBuffer);
  const [memoryBuffer, setMemoryBuffer] = useState<TravelContextMemory>(sessionTravelMemory);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [autoVoice, setAutoVoice] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Stop speech synthesis when modal closes or unmounts
  useEffect(() => {
    if (!isOpen) {
      stopPhoenixSpeech();
      setSpeakingMessageId(null);
    }
    return () => {
      stopPhoenixSpeech();
    };
  }, [isOpen]);

  // Handle Phoenix speaking a message
  const handleSpeakMessage = (msgId: string, text: string) => {
    if (speakingMessageId === msgId) {
      stopPhoenixSpeech();
      setSpeakingMessageId(null);
      return;
    }

    setSpeakingMessageId(msgId);
    speakPhoenix(text, {
      lang: language,
      onStart: () => setSpeakingMessageId(msgId),
      onEnd: () => setSpeakingMessageId(null),
      onError: () => setSpeakingMessageId(null),
    });
  };

  // Derive stable effective context
  const effectiveContext = currentScreenContext || {
    screenName: currentScreen,
    destinationName: activeDestinationName,
    contextId: undefined,
  };

  // Keep session buffers synced
  useEffect(() => {
    sessionMessageBuffer = messages;
  }, [messages]);

  useEffect(() => {
    sessionTravelMemory = memoryBuffer;
  }, [memoryBuffer]);

  // Sync destination if context changed
  useEffect(() => {
    if (effectiveContext.destinationName && memoryBuffer.destination !== effectiveContext.destinationName) {
      setMemoryBuffer((prev) => ({
        ...prev,
        destination: effectiveContext.destinationName,
        destinationId: effectiveContext.contextId,
      }));
    }
  }, [effectiveContext.destinationName]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'ml' ? 'ml-IN' : language === 'hi' ? 'hi-IN' : 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  // Safe action dispatcher that routes action keys
  const handleExecuteAction = (actionKey: string, data?: any) => {
    if (onExecuteAction) {
      onExecuteAction(actionKey, data);
      return;
    }

    if (actionKey === 'OPEN_PLANNER' || actionKey === 'PLAN_TRIP') {
      if (onOpenTripPlanner) onOpenTripPlanner();
      else if (onNavigateToTab) onNavigateToTab('MY_TRIP');
      onClose();
    } else if (actionKey === 'OPEN_LIFELINE') {
      if (onOpenLifeline) onOpenLifeline();
      else if (onNavigateToTab) onNavigateToTab('SAFETY');
      onClose();
    } else if (actionKey === 'VIEW_SAFETY' || actionKey === 'VIEW_ALERTS') {
      if (onNavigateToTab) onNavigateToTab('SAFETY');
      onClose();
    } else if (actionKey === 'VIEW_MY_TRIP' || actionKey === 'VIEW_PLAN_B') {
      if (onNavigateToTab) onNavigateToTab('MY_TRIP');
      onClose();
    } else if (actionKey === 'VIEW_EXPLORE' || actionKey === 'VIEW_LAST_MILE' || actionKey === 'VIEW_DESTINATION') {
      if (onNavigateToTab) onNavigateToTab('EXPLORE');
      onClose();
    }
  };

  // Core suggested shortcuts as specified in user prompt Section 1
  const CORE_SUGGESTIONS = [
    'Plan my trip',
    'Find places to visit',
    'Help me with my budget',
    'What should I pack?',
    'Tell me about local food',
    'Safety tips',
    'Find transport',
    'Build a 3-day itinerary',
  ];

  // Dynamic contextual shortcuts if destination is active
  const getContextualShortcuts = () => {
    if (memoryBuffer.destination) {
      return [
        `Plan a 3-day itinerary for ${memoryBuffer.destination}`,
        `What local food should I try in ${memoryBuffer.destination}?`,
        `How do I reach ${memoryBuffer.destination} safely?`,
        `What temple dress codes apply in ${memoryBuffer.destination}?`,
        ...CORE_SUGGESTIONS.slice(2, 6),
      ];
    }
    return CORE_SUGGESTIONS;
  };

  // Reset conversation
  const handleResetConversation = () => {
    const freshMemory: TravelContextMemory = {
      userName: 'Sreeshma',
      destination: effectiveContext.destinationName,
      destinationId: effectiveContext.contextId,
      budget: 5000,
    };
    setMemoryBuffer(freshMemory);
    sessionTravelMemory = freshMemory;

    const initialGreeting = effectiveContext.destinationName
      ? `Hey! 🦊💙 I'm Phoenix, your JourneyBuddy. I'm ready to guide you around ${effectiveContext.destinationName}! What would you like to explore—day plans, authentic food, crowd timings, or safe transit?`
      : `Hey! 🦊💙 I'm Phoenix, your JourneyBuddy. Where are we heading today?`;

    const freshMessages: ChatMessage[] = [
      {
        id: `welcome-${Date.now()}`,
        sender: 'phoenix',
        text: initialGreeting,
        timestamp: 'Just now',
      },
    ];

    setMessages(freshMessages);
    sessionMessageBuffer = freshMessages;
  };

  // Initialize welcoming message on first open
  useEffect(() => {
    if (!isOpen) return;
    if (messages.length === 0) {
      handleResetConversation();
    }
  }, [isOpen]);

  // Handle initialPrompt if passed in
  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // SEND MESSAGE (MULTI-TURN MEMORY BUFFER ENGINE)
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    // Stop previous voice playback
    stopPhoenixSpeech();
    setSpeakingMessageId(null);

    // 1. Update conversational memory buffer locally from natural language
    const updatedMem = extractConversationalContext(text, memoryBuffer);
    setMemoryBuffer(updatedMem);
    sessionTravelMemory = updatedMem;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: 'Just now',
    };

    const currentHistory = [...messages, userMessage];
    setMessages(currentHistory);
    sessionMessageBuffer = currentHistory;
    setInputValue('');
    setIsThinking(true);

    // 2. Call backend /api/chat with full multi-turn history & memory buffer
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          context: {
            ...effectiveContext,
            destinationName: updatedMem.destination || effectiveContext.destinationName,
          },
          messages: currentHistory.slice(-8).map((m) => ({ sender: m.sender, text: m.text })),
          memory: updatedMem,
          language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.reply) {
          const companionLocal = getInteractiveAssistantReply(
            text,
            effectiveContext,
            currentHistory,
            updatedMem,
            language
          );

          const newId = `phoenix-${Date.now()}`;
          setMessages((prev) => [
            ...prev,
            {
              id: newId,
              sender: 'phoenix',
              text: data.reply,
              timestamp: 'Just now',
              actions: data.actions || companionLocal.actions,
            },
          ]);
          setIsThinking(false);

          if (autoVoice) {
            handleSpeakMessage(newId, data.reply);
          }
          return;
        }
      }
    } catch {
      // Graceful fallback to local conversational engine
    }

    // 3. Fallback: Intelligent Multi-Turn Conversational Travel Engine
    setTimeout(() => {
      const companionReply = getInteractiveAssistantReply(
        text,
        effectiveContext,
        currentHistory,
        updatedMem,
        language
      );

      if (companionReply.updatedMemory) {
        setMemoryBuffer(companionReply.updatedMemory);
        sessionTravelMemory = companionReply.updatedMemory;
      }

      const newId = `phoenix-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: newId,
          sender: 'phoenix',
          text: companionReply.reply,
          timestamp: 'Just now',
          actions: companionReply.actions,
        },
      ]);
      setIsThinking(false);

      if (autoVoice) {
        handleSpeakMessage(newId, companionReply.reply);
      }
    }, 450);
  };

  if (!isOpen) return null;

  return (
    <div
      id="journey-buddy-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="journey-buddy-modal-container"
        className="w-full max-w-lg bg-slate-50 h-[92vh] sm:h-[640px] rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modern Header with Phoenix Persona branding */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-4 py-3.5 flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <PhoenixAvatar size="sm" mood={speakingMessageId ? 'speaking' : 'happy'} animate withGlow />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-blue-900" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-black text-sm tracking-tight text-white">
                  Phoenix
                </h2>
                <span className="text-[10px] bg-blue-800/80 border border-blue-600/50 text-blue-200 px-2 py-0.2 rounded-full font-bold">
                  {t('chat.subtitle', 'AI Travel Companion')}
                </span>
              </div>
              <p className="text-[11px] text-blue-200/90 truncate max-w-[210px]">
                {memoryBuffer.destination
                  ? `Guiding for ${memoryBuffer.destination}`
                  : 'Always online • Natural conversation'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="journey-buddy-voice-mode-btn"
              onClick={() => {
                if (autoVoice) {
                  stopPhoenixSpeech();
                  setSpeakingMessageId(null);
                }
                setAutoVoice(!autoVoice);
              }}
              className={`p-1.5 rounded-xl transition-colors flex items-center gap-1 ${
                autoVoice
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white'
              }`}
              title={autoVoice ? "Auto-voice active: Phoenix reads answers aloud" : "Click to enable auto-voice"}
              aria-label="Toggle auto voice mode"
            >
              {autoVoice ? <Volume2 className="w-4 h-4 text-slate-950 animate-pulse" /> : <VolumeX className="w-4 h-4 text-blue-200" />}
            </button>
            <button
              id="journey-buddy-reset-btn"
              onClick={handleResetConversation}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white transition-colors"
              title={t('chat.reset', 'Reset conversation')}
              aria-label="Reset conversation history"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              id="journey-buddy-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white transition-colors ml-1"
              aria-label="Close Phoenix chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Context Memory Pill Bar (if destination or duration is known) */}
        {memoryBuffer.destination && (
          <div className="px-3.5 py-1.5 bg-blue-50/90 border-b border-blue-100 flex items-center justify-between text-[11px] text-blue-900 font-bold shrink-0">
            <div className="flex items-center gap-1.5 truncate">
              <Compass className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span className="truncate">
                Focus: {memoryBuffer.destination}
                {memoryBuffer.durationDays ? ` (${memoryBuffer.durationDays} days)` : ''}
                {memoryBuffer.travelGroup ? ` • with ${memoryBuffer.travelGroup}` : ''}
              </span>
            </div>
            <button
              onClick={() => {
                setMemoryBuffer({ userName: 'Sreeshma' });
                handleSendMessage('Suggest a new destination to visit');
              }}
              className="text-[10px] text-blue-700 hover:text-blue-900 underline shrink-0 ml-2"
            >
              Change
            </button>
          </div>
        )}

        {/* Chat Messages Body with smooth auto-scroll */}
        <div
          id="journey-buddy-messages-container"
          className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-gradient-to-b from-slate-100/50 to-slate-50"
        >
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 items-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isUser && (
                  <div className="shrink-0 mt-0.5">
                    <PhoenixAvatar
                      size="xs"
                      mood={speakingMessageId === m.id ? 'speaking' : 'calm'}
                      animate={speakingMessageId === m.id}
                      withGlow={speakingMessageId === m.id}
                    />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3.5 shadow-2xs leading-relaxed ${
                    isUser
                      ? 'bg-blue-900 text-white rounded-tr-none font-medium'
                      : 'bg-white text-slate-900 border border-slate-200/90 rounded-tl-none font-normal'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>

                  {/* Contextual Action Buttons */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {m.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleExecuteAction(act.actionKey, act.data)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors active:scale-95"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3 h-3 text-blue-600" />
                        </button>
                      ))}
                    </div>
                  )}

                  {isUser ? (
                    <div className="text-[9px] mt-1.5 font-semibold text-right text-blue-200">
                      {m.timestamp}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                      <button
                        onClick={() => handleSpeakMessage(m.id, m.text)}
                        className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                          speakingMessageId === m.id
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-800'
                        }`}
                        title={speakingMessageId === m.id ? "Stop voice" : "Listen to Phoenix's voice"}
                        aria-label="Listen to message in Phoenix voice"
                      >
                        {speakingMessageId === m.id ? (
                          <>
                            <VolumeX className="w-3 h-3 text-amber-700 shrink-0" />
                            <span>Stop</span>
                            <span className="flex gap-0.5 items-end h-2 ml-0.5">
                              <span className="w-0.5 h-1 bg-amber-600 animate-bounce" />
                              <span className="w-0.5 h-2 bg-amber-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-0.5 h-1.5 bg-amber-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>Voice</span>
                          </>
                        )}
                      </button>
                      <div className="text-[9px] font-semibold text-slate-400">
                        {m.timestamp}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator: "Phoenix is thinking..." */}
          {isThinking && (
            <div className="flex items-center gap-2 text-slate-500 text-xs py-1">
              <PhoenixAvatar size="xs" mood="thinking" animate />
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-3 py-2 flex items-center gap-2 shadow-2xs">
                <span className="font-semibold text-slate-700">
                  {t('chat.thinking', 'Phoenix is thinking...')}
                </span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* SUGGESTED PROMPTS SHORTCUT BAR (Sends as real user messages) */}
        <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-200/80 shrink-0">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Suggested questions (tap to ask)
            </span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {getContextualShortcuts().map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-900 hover:border-blue-300 border border-slate-200 text-slate-700 font-bold rounded-xl whitespace-nowrap transition-colors shadow-2xs shrink-0 text-[11px]"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar with Text Field, Mic Button, and Send Button */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Optional Microphone Button */}
            {speechSupported && (
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
                title={isListening ? t('chat.micOn', 'Listening...') : t('chat.micTooltip', 'Voice speech input')}
                aria-label="Voice input"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            <input
              id="journey-buddy-chat-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                isListening
                  ? t('chat.micOn', 'Listening to voice...')
                  : t('chat.placeholder', 'Ask anything (e.g. 3-day plan, food, budget)...')
              }
              className="flex-1 bg-slate-100 text-slate-900 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 border border-slate-200"
            />

            <button
              id="journey-buddy-send-btn"
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-transform active:scale-95 shadow-xs"
              aria-label="Send message to Phoenix"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
