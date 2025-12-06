
import React, { useState } from 'react';
import { Sparkles, Loader2, Target, PenTool, BarChart3, Volume2 } from 'lucide-react';
import { PromptInputProps } from '../types';

export const PromptInput: React.FC<PromptInputProps> = ({ onGenerate, isGenerating }) => {
  const [idea, setIdea] = useState('');
  const [ageGroup, setAgeGroup] = useState('Tiểu học (6-10 tuổi)');
  const [difficulty, setDifficulty] = useState('Vừa');

  const difficultyLevels = [
    { value: 'Dễ', color: 'bg-kid-green', border: 'border-kid-greenDark', shadow: 'shadow-kid-greenDark' },
    { value: 'Vừa', color: 'bg-kid-yellow', border: 'border-kid-yellowDark', shadow: 'shadow-kid-yellowDark' },
    { value: 'Khó', color: 'bg-kid-pink', border: 'border-kid-pinkDark', shadow: 'shadow-kid-pinkDark' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim()) {
      onGenerate(idea, ageGroup, difficulty);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Age Group */}
      <div className="space-y-2">
        <label htmlFor="ageGroup" className="flex items-center gap-2 text-sm font-bold text-slate-600 ml-1">
          <Target className="w-4 h-4 text-kid-blue" />
          Độ tuổi người chơi
        </label>
        <div className="relative">
          <select
            id="ageGroup"
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            className="w-full appearance-none rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-kid-blue/20 focus:border-kid-blue transition-all cursor-pointer hover:bg-white"
          >
            <option>Mầm non (3-5 tuổi)</option>
            <option>Tiểu học (6-10 tuổi)</option>
            <option>Trung học cơ sở (11-15 tuổi)</option>
            <option>Trung học phổ thông (16+ tuổi)</option>
            <option>Mọi lứa tuổi</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-600 ml-1">
          <BarChart3 className="w-4 h-4 text-kid-purple" />
          Mức độ thử thách
        </label>
        <div className="grid grid-cols-3 gap-2">
            {difficultyLevels.map((level) => (
                <button
                    key={level.value}
                    type="button"
                    onClick={() => setDifficulty(level.value)}
                    className={`py-2 px-1 rounded-xl text-sm font-black border-b-4 transition-all
                        ${difficulty === level.value 
                            ? `${level.color} text-white ${level.border} border-b-4 translate-y-0.5 shadow-inner` 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                >
                    {level.value}
                </button>
            ))}
        </div>
      </div>

      {/* Idea Input */}
      <div className="space-y-2">
        <label htmlFor="idea" className="flex items-center gap-2 text-sm font-bold text-slate-600 ml-1">
          <PenTool className="w-4 h-4 text-kid-pink" />
          Mô tả trò chơi
        </label>
        <textarea
          id="idea"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Ví dụ: Game tính nhẩm nhanh, trả lời đúng thì phi thuyền bay lên cao. Giao diện vũ trụ màu tối, có sao lấp lánh..."
          className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm min-h-[140px] font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-kid-pink/20 focus:border-kid-pink transition-all resize-none placeholder:text-slate-400 placeholder:font-normal"
          required
        />
      </div>

      {/* Audio Indicator */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-500 border border-slate-200">
          <Volume2 className="w-4 h-4 text-kid-green" />
          <span>Hệ thống đã tự động tích hợp Âm thanh & Nhạc nền</span>
      </div>

      <button
        type="submit"
        disabled={isGenerating || !idea.trim()}
        className={`w-full group relative flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-black text-white text-lg transition-all transform 
          ${isGenerating || !idea.trim() 
            ? 'bg-slate-300 cursor-not-allowed shadow-none translate-y-0' 
            : 'bg-gradient-to-r from-kid-pink to-kid-pinkDark shadow-[0_6px_0_#9D174D] hover:shadow-[0_4px_0_#9D174D] hover:translate-y-[2px] active:shadow-none active:translate-y-[6px]'
          }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" strokeWidth={3} />
            Đang "Nấu" Game...
          </>
        ) : (
          <>
            <Sparkles className="w-6 h-6 group-hover:animate-ping" fill="currentColor" />
            Tạo Game Ngay!
          </>
        )}
      </button>
    </form>
  );
};
