'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  Loader2,
  ChevronDown
} from 'lucide-react';
import { RTConfig, LetterType } from '@/lib/types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIAssistantProps {
  rtConfig: RTConfig;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ rtConfig }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Halo! 👋 Saya SmartWarga AI, asisten digital ${rtConfig.appName || 'RT 03 Kp. Jati'}.\n\nSaya bisa membantu Anda:\n• 📄 Informasi layanan surat dan dokumen\n• 📋 Persyaratan dan prosedur administrasi\n• 🔍 Mencari informasi layanan publik terkini\n• ❓ Menjawab pertanyaan seputar kependudukan\n\nSilakan ketik pertanyaan Anda!` }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Call API backend for AI response
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          rtName: rtConfig.rtName,
          rtWhatsapp: rtConfig.rtWhatsapp
        })
      });

      const data = await response.json();
      
      if (data.success && data.data?.text) {
        setMessages(prev => [...prev, { role: 'model', text: data.data.text }]);
      } else {
        throw new Error('No response from AI');
      }
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'model', text: "Maaf, layanan asisten sedang sibuk. Silakan coba lagi nanti atau hubungi Pak RT langsung di WhatsApp." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 lg:bottom-8 right-6 z-[100] w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <div className="absolute -top-2 -right-2 bg-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white animate-bounce">AI</div>
        <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
      </button>

      {/* Chat Interface */}
      <div className={`fixed bottom-6 right-6 z-[110] w-[90vw] sm:w-[380px] h-[500px] bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-slate-100 transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/30">
              <Bot size={22} />
            </div>
            <div>
              <h4 className="font-bold text-sm leading-none">SmartWarga AI</h4>
              <p className="text-[10px] text-blue-100 mt-1 uppercase tracking-widest font-bold">Asisten Digital RT</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scrollbar-hide">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
              <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-3.5 rounded-2xl rounded-tl-none border border-slate-100 flex items-center space-x-2 shadow-sm">
                <Loader2 size={14} className="text-blue-600 animate-spin" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI sedang berpikir...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Tanya syarat dokumen, prosedur layanan..."
              className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-center text-[9px] text-slate-400 mt-3 font-medium">Powered by SmartWarga AI • RT 03 Kp. Jati</p>
        </div>
      </div>
    </>
  );
};

export default AIAssistant;
