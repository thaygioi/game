
import React, { useState, useEffect, useRef } from 'react';
import { Play, Code2, Download, RefreshCw, Terminal, Gamepad, MessageSquareText } from 'lucide-react';
import { GameDisplayProps } from '../types';

interface TabButtonProps {
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  active: boolean;
  disabled?: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({ onClick, icon: Icon, label, active, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-b-4 
        ${active 
          ? 'bg-white text-kid-blueDark border-kid-blue shadow-sm -translate-y-0.5' 
          : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
    >
      <Icon className={`w-5 h-5 ${active ? 'fill-current' : ''}`} />
      {label}
    </button>
  );
};

export const GameDisplay: React.FC<GameDisplayProps> = ({ state }) => {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const codeEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === 'streaming' || state.status === 'loading') {
      setViewMode('code');
    }
  }, [state.status]);

  useEffect(() => {
    if ((state.status === 'streaming' || state.status === 'loading' || state.status === 'success') && codeEndRef.current) {
      codeEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [state.code, state.status]);

  const handleDownload = () => {
    if (!state.code) return;
    const blob = new Blob([state.code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game-giao-duc.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reloadGame = () => {
    if (iframeRef.current && state.code) {
        iframeRef.current.srcdoc = '';
        setTimeout(() => {
            if (iframeRef.current) iframeRef.current.srcdoc = state.code;
        }, 100);
    }
  };

  const isPureLoading = state.status === 'loading' && (!state.code || state.code.length === 0);

  // IDLE STATE
  if (state.status === 'idle') {
    return (
      <div className="flex-1 bg-white rounded-3xl border-4 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center h-full min-h-[500px] group">
        <div className="bg-sky-50 p-8 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
          <Gamepad className="w-16 h-16 text-sky-300" strokeWidth={1.5} />
        </div>
        <h3 className="text-3xl font-black text-slate-700 mb-3">Chưa có gì ở đây cả! 🙈</h3>
        <p className="text-slate-500 max-w-md text-lg font-medium">
          Bạn hãy nhập ý tưởng bên trái để AI bắt đầu "xây dựng" trò chơi nhé.
        </p>
      </div>
    );
  }

  // CONSULTING STATE
  if (state.status === 'consulting') {
    return (
      <div className="flex-1 bg-white rounded-3xl border-4 border-amber-200 flex flex-col items-center justify-center p-8 text-center h-full min-h-[500px] relative overflow-hidden">
        <div className="absolute inset-0 bg-amber-50/50"></div>
        <div className="relative z-10 flex flex-col items-center">
            <div className="bg-amber-100 p-6 rounded-full mb-6 animate-pulse">
                <MessageSquareText className="w-12 h-12 text-amber-500" strokeWidth={2} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-3">AI Đang Thảo Luận Với Bạn...</h3>
            <p className="text-slate-600 max-w-md text-lg">
                Vui lòng kiểm tra <b>hộp thoại Chat</b> ở góc dưới phải. AI có một câu hỏi quan trọng để làm game hay hơn! 👇
            </p>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (state.status === 'error') {
    return (
      <div className="flex-1 bg-white rounded-3xl border-4 border-red-100 flex flex-col items-center justify-center p-8 text-center h-full min-h-[500px]">
        <div className="bg-red-50 p-6 rounded-full mb-6 animate-bounce">
          <span className="text-5xl">💥</span>
        </div>
        <h3 className="text-2xl font-black text-red-500 mb-2">Úi, có lỗi rồi!</h3>
        <p className="text-slate-500 max-w-md mb-8 font-medium">{state.error}</p>
        <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-100 hover:bg-red-200 text-red-600 font-black rounded-2xl transition-colors"
        >
            Thử lại nha
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-100 rounded-3xl border-4 border-white shadow-xl overflow-hidden ring-4 ring-slate-100 w-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-50 border-b-2 border-slate-200">
        <div className="flex items-center gap-2 bg-slate-200/60 p-1.5 rounded-2xl">
          <TabButton 
            onClick={() => setViewMode('preview')}
            icon={Play} 
            label={state.status === 'success' ? 'Chơi Luôn!' : 'Xem Trước'} 
            active={viewMode === 'preview'} 
            disabled={state.status === 'streaming' || state.status === 'loading'}
          />
          <TabButton 
            onClick={() => setViewMode('code')}
            icon={state.status === 'streaming' || state.status === 'loading' ? Terminal : Code2} 
            label={state.status === 'streaming' || state.status === 'loading' ? 'Đang Viết Code...' : 'Xem Code'} 
            active={viewMode === 'code'} 
          />
        </div>

        <div className="flex items-center gap-3">
          {viewMode === 'preview' && state.status === 'success' && (
            <button 
                onClick={reloadGame}
                className="p-3 text-slate-400 hover:text-kid-blue hover:bg-white rounded-xl transition-all font-bold"
                title="Chơi lại"
            >
                <RefreshCw className="w-5 h-5" strokeWidth={3} />
            </button>
          )}
          
          <button
            onClick={handleDownload}
            disabled={!state.code || state.status !== 'success'}
            className="flex items-center gap-2 px-5 py-2.5 bg-kid-green hover:bg-kid-greenDark disabled:bg-slate-300 disabled:shadow-none text-white rounded-xl text-sm font-black transition-all shadow-[0_4px_0_#16A34A] hover:translate-y-[2px] hover:shadow-[0_2px_0_#16A34A] active:translate-y-[4px] active:shadow-none"
          >
            <Download className="w-5 h-5" strokeWidth={3} />
            <span className="hidden sm:inline">Tải về máy</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative bg-slate-200/50 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden w-full">
        
        {viewMode === 'preview' ? (
           <div className="w-full max-w-7xl aspect-video bg-black rounded-[2rem] shadow-2xl overflow-hidden border-[12px] border-slate-800 relative group mx-auto transition-all duration-300">
              {state.status === 'success' ? (
                <iframe
                    ref={iframeRef}
                    title="Game Preview"
                    srcDoc={state.code}
                    className="w-full h-full bg-white"
                    sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-kid-blue rounded-full animate-spin mb-4"></div>
                    <p className="font-bold">Đang tải trò chơi...</p>
                </div>
              )}
           </div>
        ) : (
          <div className="w-full max-w-7xl aspect-video bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden border-b-[8px] border-r-[8px] border-slate-700/50 flex flex-col mx-auto relative transform transition-all duration-300">
            {/* Terminal Header */}
            <div className="bg-[#333] px-4 py-3 flex items-center gap-3 border-b border-black/30 shrink-0">
                <div className="flex gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f]"></div>
                </div>
                <div className="flex-1 text-center pr-12">
                   <span className="text-xs text-slate-400 font-mono font-bold tracking-wider">SUPER_AI_CODER.exe</span>
                </div>
            </div>
            
            {/* Terminal Content */}
            <div className="flex-1 overflow-auto p-6 font-mono text-sm sm:text-base leading-relaxed custom-scrollbar relative bg-[#1e1e1e]">
                <pre className="whitespace-pre-wrap break-all text-blue-300 font-medium">
                    {isPureLoading ? (
                        <div className="flex flex-col gap-2 text-emerald-400">
                            <div><span className="text-pink-500">➜</span>  <span className="text-sky-400">~</span> khởi_tạo_thế_giới_game <span className="text-yellow-400">"{state.code ? 'update' : 'new'}"</span></div>
                            <div className="text-slate-500 mt-2 flex items-center gap-2">
                                &gt; Đang kết nối máy chủ AI...
                                <span className="animate-pulse">_</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {state.code}
                            {state.status === 'streaming' && (
                                <span className="inline-block w-3 h-6 bg-kid-pink ml-1 align-middle animate-pulse"></span>
                            )}
                            {state.status === 'success' && (
                                <div className="mt-10 text-emerald-400 font-bold border-t-2 border-dashed border-emerald-500/30 pt-6 pb-12">
                                    <div className="flex items-center gap-3 text-lg">
                                        <span className="text-2xl animate-bounce">🎉</span>
                                        <span>XONG RỒI! GAME ĐÃ SẴN SÀNG!</span>
                                    </div>
                                    <div className="mt-2 text-slate-400 font-normal">
                                        &gt; Nhấn nút <span className="text-white bg-kid-blue px-2 py-0.5 rounded mx-1 font-bold">Chơi Luôn!</span> ở trên để chiến nhé!
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </pre>
                <div ref={codeEndRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
