import React, { useState, useRef } from 'react';
import { askNoor } from '../api/ai.js';
import type { ChatMessage } from '../api/ai.js';
import { Sparkles, X, Send, Bot } from 'lucide-react';

interface AskNoorWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'noor';
  text: string;
  isGuardrailRefusal?: boolean;
}

export const AskNoorWidget: React.FC<AskNoorWidgetProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'noor',
      text: 'Namaste! I am Noor, your MediWise 24/7 Rx & Generic Bioequivalence Assistant. Ask me about generic formulations, CDSCO compliance, or your current order tracking.'
    }
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatHistoryRef = useRef<ChatMessage[]>([]);

  const quickPrompts = [
    'Is generic Atorvastatin bioequivalent to Lipitor?',
    'Should I take 2 tablets if I missed yesterday?',
    'How does the escrow payment guarantee work?',
    'Can I buy Schedule H1 medicines without an Rx?'
  ];

  const handleSendMessage = async (textToSend?: string): Promise<void> => {
    const text = (textToSend ?? inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');

    setIsLoading(true);

    try {
      const result = await askNoor(text, chatHistoryRef.current);

      // Update chat history for context continuity
      const newTurns: ChatMessage[] = [
        { role: 'user', parts: [{ text }] },
        { role: 'model', parts: [{ text: result.response }] },
      ];
      chatHistoryRef.current = [...chatHistoryRef.current, ...newTurns].slice(-8);

      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'noor',
          text: result.response,
          isGuardrailRefusal: result.guardrailFired,
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'noor',
          text: '⚠️ Noor is temporarily unavailable. Please ensure the MediWise server is running (`npm run server`) and try again.',
          isGuardrailRefusal: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[520px]">
      {/* Widget Header */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm flex items-center gap-1.5">
              <span>Noor 24/7 Rx AI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="text-[10px] text-slate-400">Clinical Safety Shield Enabled</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="grow p-4 overflow-y-auto space-y-3 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'noor' && (
              <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`p-3 rounded-xl max-w-[82%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-br-xs'
                  : m.isGuardrailRefusal
                  ? 'bg-rose-50 border border-rose-300 text-rose-950 font-medium'
                  : 'bg-slate-100 text-slate-800 rounded-bl-xs'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex gap-1.5 overflow-x-auto scrollbar-none">
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-700 whitespace-nowrap shrink-0 transition cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask Noor about medicines, doses, orders..."
          className="grow px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputValue.trim()}
          aria-label="Send message to Noor"
          className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 text-white transition cursor-pointer"
        >
          <Send className={`w-4 h-4 ${isLoading ? 'animate-pulse' : ''}`} />
        </button>
      </div>
    </div>
  );
};
