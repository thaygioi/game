
import React, { useState, useEffect } from 'react';
import { Gamepad2, Wand2, Rocket, Star, Heart, Settings, Users } from 'lucide-react';
import { PromptInput } from './components/PromptInput';
import { GameDisplay } from './components/GameDisplay';
import { ChatBot } from './components/ChatBot';
import { SettingsModal } from './components/SettingsModal';
import { generateGameCodeStream, consultGameLogic } from './services/geminiService';
import { GameGenerationState, PendingGameRequest } from './types';

const App: React.FC = () => {
  const [generationState, setGenerationState] = useState<GameGenerationState>({
    status: 'idle',
    code: '',
    error: undefined,
  });

  // API Key Management
  const [apiKey, setApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Logic Consultation (The "Logical Thinking" Flow)
  const [proactiveMessage, setProactiveMessage] = useState<string | null>(null);
  const [pendingRequest, setPendingRequest] = useState<PendingGameRequest | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('GEMINI_API_KEY');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('GEMINI_API_KEY', key);
    setIsSettingsOpen(false);
  };

  // Step 1: User submits idea -> System triggers Consultation
  const handleInitialRequest = async (idea: string, ageGroup: string, difficulty: string) => {
    // Save the request for later
    setPendingRequest({ idea, ageGroup, difficulty });
    setGenerationState({ status: 'loading', code: '', error: undefined });
    setProactiveMessage(null);

    try {
        // AI Architect thinks of a question
        const consultationQuestion = await consultGameLogic(idea, ageGroup, apiKey);
        
        // Switch to Consulting Mode
        setGenerationState({ status: 'consulting', code: '', error: undefined });
        setProactiveMessage(consultationQuestion); // Trigger ChatBot to open
        
    } catch (error) {
        // Failover: Just generate the game if consultation fails
        handleStartGeneration(idea, ageGroup, difficulty, "Hãy tự quyết định logic game phù hợp nhất.");
    }
  };

  // Step 2: User answers the question -> System starts Coding
  const handleConsultationReply = (userReply: string) => {
      if (pendingRequest) {
          handleStartGeneration(pendingRequest.idea, pendingRequest.ageGroup, pendingRequest.difficulty, userReply);
          // Clear pending state
          setProactiveMessage(null);
          setPendingRequest(null);
      }
  };

  // Step 3: Core Generation Logic
  const handleStartGeneration = async (idea: string, ageGroup: string, difficulty: string, userClarification: string) => {
    setGenerationState({ status: 'loading', code: '', error: undefined });
    
    try {
      const finalCode = await generateGameCodeStream(
        idea, 
        ageGroup, 
        difficulty, 
        userClarification, // Pass the user's answer to the coder AI
        apiKey, 
        (partialCode) => {
          setGenerationState(prev => ({
            ...prev,
            status: 'streaming',
            code: partialCode
          }));
        }
      );

      setGenerationState({ status: 'success', code: finalCode, error: undefined });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Đã có lỗi xảy ra khi tạo game.';
      setGenerationState({ 
        status: 'error', 
        code: '', 
        error: errorMessage 
      });
    }
  };

  const handleCodeUpdate = (newCode: string) => {
    setGenerationState({
      status: 'success',
      code: newCode,
      error: undefined
    });
  };

  return (
    <div className="min-h-screen bg-polka flex flex-col relative font-sans text-slate-700">
      {/* Colorful Header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b-4 border-kid-blue shadow-sm">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-kid-blue to-kid-blueDark p-3 rounded-2xl shadow-lg rotate-3 transform hover:rotate-6 transition-transform">
              <Gamepad2 className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 hidden sm:block">
                Làm Game <span className="text-transparent bg-clip-text bg-gradient-to-r from-kid-blueDark to-kid-purpleDark">Cực Dễ</span>
              </h1>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-800 sm:hidden">
                Làm Game AI
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             {/* Zalo Community Button - PROMINENT */}
             <a
                href="https://zalo.me/g/zickyw266"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 sm:px-5 py-2 bg-[#0068FF] hover:bg-[#0054cc] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 mr-1 border-b-4 border-[#0041a3] active:border-b-0 active:translate-y-1"
                title="Tham gia nhóm Zalo"
             >
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Cộng đồng & Hướng dẫn</span>
                <span className="sm:hidden">Cộng đồng</span>
             </a>

             <div className="hidden lg:flex px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold border-2 border-yellow-200 shadow-sm items-center gap-1">
                <Star className="w-3 h-3 fill-current" /> Thầy Giới
             </div>
             <div className="hidden xl:flex px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-xs font-bold border-2 border-purple-200 shadow-sm items-center gap-1">
                <Rocket className="w-3 h-3 fill-current" /> Bal Digitech
             </div>
             
             {/* Settings Button */}
             <button 
                onClick={() => setIsSettingsOpen(true)}
                className={`p-2.5 rounded-xl border-2 transition-all ${apiKey ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-red-100 text-red-500 border-red-200 animate-pulse'}`}
                title="Cài đặt API Key"
             >
                <Settings className="w-6 h-6" />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content - Full Width Expansion */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto px-4 py-6 pb-32">
        <div className="flex flex-col lg:flex-row gap-6 h-full">
          
          {/* Left Column: Input - Fixed width on large screens */}
          <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 space-y-6">
            <div className="bg-white rounded-3xl shadow-[0_8px_0_rgba(0,0,0,0.05)] border-2 border-slate-100 p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-kid-yellow/20 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
              
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <div className="bg-orange-100 p-2 rounded-xl text-orange-500">
                  <Wand2 className="w-6 h-6" strokeWidth={3} />
                </div>
                <h2 className="font-black text-xl text-slate-700">Ý Tưởng Mới</h2>
              </div>
              
              <p className="text-slate-500 text-sm mb-6 font-medium leading-relaxed">
                Nhập ý tưởng của bạn vào đây, AI sẽ tư vấn để bạn có một trò chơi logic nhất! ✨
              </p>
              
              <PromptInput 
                onGenerate={handleInitialRequest} 
                isGenerating={generationState.status === 'loading' || generationState.status === 'streaming' || generationState.status === 'consulting'} 
              />
            </div>
          </div>

          {/* Right Column: Display - Flex Grow to take remaining space */}
          <div className="flex-1 h-full min-h-[600px] flex flex-col">
            <GameDisplay state={generationState} />
          </div>
        </div>
      </main>

      {/* Chat Bot with Proactive Trigger and Consultation Mode */}
      <ChatBot 
        currentCode={generationState.code} 
        onCodeUpdate={handleCodeUpdate}
        hasGame={generationState.status === 'success' || generationState.status === 'streaming'}
        apiKey={apiKey}
        triggerMessage={proactiveMessage}
        onReply={handleConsultationReply}
        isConsulting={generationState.status === 'consulting'}
      />

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveApiKey}
        currentKey={apiKey}
      />

      {/* Cute Footer */}
      <footer className="mt-auto bg-white border-t-4 border-kid-green py-10 relative">
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center justify-center p-3 bg-kid-green/10 rounded-full mb-4">
             <Heart className="w-6 h-6 text-kid-greenDark fill-current animate-pulse" />
          </div>
          <p className="font-black text-slate-800 text-xl mb-3 tracking-tight">Trung tâm Tin học ứng dụng Bal Digitech</p>
          
          <div className="flex flex-wrap justify-center gap-4 text-slate-600 text-sm font-medium mb-6">
            <span className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">🎓 Đào tạo AI & E-learning</span>
            <span className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">🎨 Canva & Công cụ giáo viên</span>
            <span className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">☎️ 0972.300.864 (Thầy Giới)</span>
          </div>

          <div className="text-slate-400 text-xs font-bold border-t border-slate-100 pt-6 max-w-lg mx-auto">
            <p>Phát triển với ❤️ bởi Thầy Giới</p>
            <p className="mt-1 font-normal opacity-70">Powered by Google Gemini 2.5</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
