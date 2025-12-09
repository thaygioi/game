
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendChatMessage } from '../services/geminiService';

interface ChatBotProps {
  currentCode: string;
  onCodeUpdate: (newCode: string) => void;
  hasGame: boolean;
  apiKey: string;
  triggerMessage: string | null;
  onReply?: (userReply: string) => void; // New prop for consultation reply
  isConsulting?: boolean; // New prop to indicate consultation mode
}

export const ChatBot: React.FC<ChatBotProps> = ({ 
    currentCode, 
    onCodeUpdate, 
    hasGame, 
    apiKey, 
    triggerMessage,
    onReply,
    isConsulting 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Xin chào thầy cô! tôi là trợ lí của thầy Giới sẽ giúp thầy cô chỉnh sửa lại game cho phù hợp nhé! Bất kỳ yêu cầu nào tôi cũng có thể giúp thầy cô! Trân trọng! he he!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle external trigger (Proactive AI Question)
  useEffect(() => {
    if (triggerMessage) {
        setMessages(prev => {
            if (prev.some(m => m.text === triggerMessage)) return prev;
            return [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: triggerMessage
            }];
        });
        setIsOpen(true);
    }
  }, [triggerMessage]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // 1. Handle Consultation Mode
    if (isConsulting && onReply) {
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        
        // Gửi tin nhắn trả lời về App để bắt đầu tạo game
        onReply(userMsg.text);
        return;
    }

    // 2. Handle Normal Chat Mode
    if (!hasGame) {
        setMessages(prev => [...prev, 
            { id: Date.now().toString(), role: 'user', text: input },
            { id: (Date.now() + 1).toString(), role: 'model', text: 'Bạn hãy tạo một trò chơi trước, sau đó tôi sẽ giúp bạn chỉnh sửa nó nhé!' }
        ]);
        setInput('');
        return;
    }

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      const response = await sendChatMessage(messages, currentCode, userMsg.text, apiKey);
      
      if (response.newCode) {
        onCodeUpdate(response.newCode);
      }

      const aiMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: response.text 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: 'Xin lỗi, có lỗi xảy ra. Vui lòng kiểm tra lại kết nối mạng hoặc API Key.' 
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none ${isOpen ? 'pointer-events-auto' : ''}`}>
      
      {/* Chat Window */}
      <div 
        className={`bg-white w-[350px] sm:w-[400px] h-[500px] rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 transform origin-bottom-right mb-4 border border-white/20 pointer-events-auto
          ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10'}`}
      >
        {/* Header - Colorful Gradient */}
        <div className={`p-4 flex items-center justify-between text-white shadow-md
            ${isConsulting ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500'}`}>
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm">{isConsulting ? 'Kiến Trúc Sư Game' : 'Trợ Lý Sáng Tạo'}</h3>
              <p className="text-xs text-white/80">{isConsulting ? 'Đang thảo luận ý tưởng...' : 'Sẵn sàng hỗ trợ'}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm
                ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gradient-to-br from-fuchsia-500 to-purple-600'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-5 h-5 text-white" />
               </div>
               <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-fuchsia-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-fuchsia-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-fuchsia-400 rounded-full animate-bounce delay-150"></span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-slate-100">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={isConsulting ? "Trả lời câu hỏi của AI..." : "Nhập yêu cầu sửa đổi..."}
              disabled={isThinking}
              className="w-full bg-slate-100 text-slate-700 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:bg-white transition-all border border-transparent focus:border-fuchsia-200"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              className="absolute right-1.5 p-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white rounded-full hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all transform active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 z-50
          ${isOpen ? 'bg-slate-200 rotate-90' : 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 animate-pulse-slow'}`}
      >
        {isOpen ? (
          <X className="w-6 h-6 sm:w-7 sm:h-7 text-slate-600" />
        ) : (
          <>
            <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
          </>
        )}
      </button>
    </div>
  );
};
