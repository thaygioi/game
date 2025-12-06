
import React, { useState, useEffect } from 'react';
import { X, Key, ExternalLink, Save, ShieldCheck, Plus, Trash2, HardDrive } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  currentKey: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentKey }) => {
  const [keys, setKeys] = useState<string[]>(['', '', '', '']);

  useEffect(() => {
    if (isOpen) {
      try {
        // Cố gắng parse nếu là JSON array
        const parsed = JSON.parse(currentKey);
        if (Array.isArray(parsed)) {
          // Fill cho đủ 4 ô
          const loadedKeys = [...parsed, '', '', '', ''].slice(0, 4);
          setKeys(loadedKeys);
        } else {
          // Nếu là string thường (legacy)
          setKeys([currentKey, '', '', '']);
        }
      } catch {
        // Nếu lỗi parse (hoặc rỗng), coi như là string đơn
        setKeys([currentKey, '', '', '']);
      }
    }
  }, [currentKey, isOpen]);

  const handleChange = (index: number, value: string) => {
    const newKeys = [...keys];
    newKeys[index] = value;
    setKeys(newKeys);
  };

  const handleSave = () => {
    // Lọc bỏ các key rỗng
    const validKeys = keys.filter(k => k.trim() !== '');
    
    if (validKeys.length === 0) {
      onSave('');
    } else if (validKeys.length === 1) {
      // Nếu chỉ có 1 key, lưu dạng string thường cho gọn
      onSave(validKeys[0]);
    } else {
      // Nếu nhiều key, lưu dạng JSON array string
      onSave(JSON.stringify(validKeys));
    }
  };

  const handleClear = () => {
      setKeys(['', '', '', '']);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border-4 border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-xl">
              <Key className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Cài đặt API (Multi-Key)</h2>
              <p className="text-xs text-slate-300">Nhập nhiều Key để chạy mượt hơn</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex gap-3 text-emerald-800 text-sm">
             <HardDrive className="w-5 h-5 shrink-0 mt-0.5" />
             <div>
                <p className="font-bold mb-1">Lưu trữ cục bộ an toàn</p>
                <p>Các API Key này được lưu trực tiếp trên trình duyệt của bạn (LocalStorage). Chúng không bao giờ được gửi đi đâu khác ngoài Google.</p>
             </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-700">
                Danh sách Google Gemini API Key
                </label>
                <button 
                    onClick={handleClear} 
                    className="text-xs text-red-400 hover:text-red-600 font-bold flex items-center gap-1"
                >
                    <Trash2 className="w-3 h-3" /> Xóa tất cả
                </button>
            </div>
            
            <div className="space-y-3">
                {keys.map((k, index) => (
                    <div key={index} className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-bold text-slate-500 border border-slate-200">
                            {index + 1}
                        </div>
                        <input
                            type="password"
                            value={k}
                            onChange={(e) => handleChange(index, e.target.value)}
                            placeholder={`Nhập API Key số ${index + 1}...`}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-kid-blue focus:ring-4 focus:ring-kid-blue/20 transition-all font-mono text-slate-600 text-sm"
                        />
                    </div>
                ))}
            </div>
            <p className="text-xs text-slate-400 italic text-center">
                Mẹo: Nhập nhiều key giúp bạn tránh bị giới hạn lượt dùng (Rate Limit). Hệ thống sẽ chọn ngẫu nhiên 1 key mỗi lần tạo game.
            </p>
          </div>

          <div className="flex justify-end">
             <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-kid-blue hover:underline"
             >
                <ExternalLink className="w-3.5 h-3.5" />
                Lấy API Key miễn phí tại đây
             </a>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-2 bg-white border-t border-slate-100 shrink-0">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-kid-blue hover:bg-kid-blueDark shadow-[0_4px_0_#0284C7] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Lưu Key vào Máy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
