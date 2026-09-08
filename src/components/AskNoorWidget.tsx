import React, { useState } from 'react';
import { MEDICINES_CATALOG } from '../data/mockData';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  ShieldAlert, 
  CheckCircle2, 
  User, 
  AlertTriangle,
  ChevronDown
} from 'lucide-react';

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

  const quickPrompts = [
    'Is generic Atorvastatin bioequivalent to Lipitor?',
    'Should I take 2 tablets if I missed yesterday?',
    'How does the escrow payment guarantee work?',
    'Can I buy Schedule H1 medicines without an Rx?'
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');

    // Simulate intelligent response with safety guardrail detection
    setTimeout(() => {
      let botResponse: Message;

      const lower = text.toLowerCase();
      
      // Check if user is asking about medicine presence or stock
      const matchedMed = MEDICINES_CATALOG.find(m => 
        lower.includes(m.genericName.toLowerCase()) || 
        lower.includes(m.brandName.toLowerCase()) ||
        lower.includes(m.bioequivalentTo.toLowerCase().split(' ')[0]) ||
        (m.id === 'med-paracetamol-650' && (lower.includes('dolo') || lower.includes('paracetamol') || lower.includes('calpol'))) ||
        (m.id === 'med-panto-40' && (lower.includes('pan 40') || lower.includes('pantoprazole'))) ||
        (m.id === 'med-metformin-500' && lower.includes('metformin')) ||
        (m.id === 'med-amoxyclav-625' && (lower.includes('augmentin') || lower.includes('amoxicillin'))) ||
        (m.id === 'med-telmi-40' && (lower.includes('telmisartan') || lower.includes('telma'))) ||
        (m.id === 'med-azithro-500' && (lower.includes('azithromycin') || lower.includes('azee')))
      );

      if (lower.includes('2 tablets') || lower.includes('double') || lower.includes('missed yesterday')) {
        botResponse = {
          id: `msg-${Date.now() + 1}`,
          sender: 'noor',
          text: '⚠️ Statutory Clinical Safety Directive (FR-SUP-02): Never double up on your statin dosage. Taking two 20mg tablets together (40mg unmonitored) carries a risk of acute rhabdomyolysis and hepatic enzyme elevation. Take only your regular 20mg dose tonight at bedtime, and consult Dr. Rajesh Iyer if you experience ongoing missed doses.',
          isGuardrailRefusal: true
        };
      } else if (matchedMed) {
        if (matchedMed.inStock) {
          botResponse = {
            id: `msg-${Date.now() + 1}`,
            sender: 'noor',
            text: `✅ Yes! ${matchedMed.brandName} (${matchedMed.genericName}) is PRESENT in our local marketplace. There are ${matchedMed.stockCount} units available across ${matchedMed.hubCount} verified pharmacy hubs in Indiranagar, starting at ₹${matchedMed.startingPrice.toFixed(2)} (${matchedMed.discountPercent}% discount vs standard MRP ₹${matchedMed.mrpReference.toFixed(2)}). It is 100% bioequivalent to ${matchedMed.bioequivalentTo}.`
          };
        } else {
          botResponse = {
            id: `msg-${Date.now() + 1}`,
            sender: 'noor',
            text: `⚠️ ${matchedMed.brandName} is cataloged under ${matchedMed.schedule}, but is currently OUT OF STOCK across local Bengaluru micro-hubs. You can request a priority hub procurement dispatch directly from the Marketplace screen.`
          };
        }
      } else if (lower.includes('bioequivalent') || lower.includes('lipitor') || lower.includes('generic')) {
        botResponse = {
          id: `msg-${Date.now() + 1}`,
          sender: 'noor',
          text: 'Yes! Generic Atorvastatin IP 20mg is 100% bioequivalent to Lipitor / Atorva. It undergoes identical in-vivo pharmacokinetic testing (Cmax and AUC within 80-125% confidence interval) approved under CDSCO Form 28 GMP standards.'
        };
      } else if (lower.includes('escrow') || lower.includes('guarantee')) {
        botResponse = {
          id: `msg-${Date.now() + 1}`,
          sender: 'noor',
          text: 'With MediWise Escrow, your payment is locked in a clearinghouse account and is NOT transferred to the pharmacy until you inspect the tamper-proof hologram seal at your doorstep and share the 4-digit Delivery OTP with the rider.'
        };
      } else if (lower.includes('without rx') || lower.includes('prescription')) {
        botResponse = {
          id: `msg-${Date.now() + 1}`,
          sender: 'noor',
          text: 'Atorvastatin is a Schedule H medication under the Drugs & Cosmetics Act, 1940. It strictly cannot be dispensed without a valid registered medical practitioner prescription.'
        };
      } else {
        botResponse = {
          id: `msg-${Date.now() + 1}`,
          sender: 'noor',
          text: `Thank you for your question regarding "${text}". MediWise coordinates directly with licensed physical hubs like MedPlus Indiranagar (Hub #KA-1204) to provide verified generic medicines with full tamper-evident custody.`
        };
      }

      setMessages(prev => [...prev, botResponse]);
    }, 600);
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
          className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
