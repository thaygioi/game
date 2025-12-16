
import React, { useState } from 'react';
import { X, BookOpen, Key, PlayCircle, Settings, FileText, CheckCircle2 } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'usage' | 'api'>('usage');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border-4 border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Hướng Dẫn & Trợ Giúp</h2>
              <p className="text-xs text-orange-100">Cẩm nang cho giáo viên sáng tạo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
            <button 
                onClick={() => setActiveTab('usage')}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'usage' ? 'text-orange-600 border-b-4 border-orange-500 bg-orange-50' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                <PlayCircle className="w-4 h-4" /> Hướng dẫn Sử dụng
            </button>
            <button 
                onClick={() => setActiveTab('api')}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'api' ? 'text-blue-600 border-b-4 border-blue-500 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                <Key className="w-4 h-4" /> Cách lấy API Key
            </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {activeTab === 'usage' ? (
            <div className="space-y-6">
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-kid-pink text-white flex items-center justify-center font-bold shrink-0">1</div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Lên ý tưởng</h3>
                        <p className="text-slate-600 text-sm mt-1">Nhập ý tưởng trò chơi của bạn vào ô mô tả. Ví dụ: "Game giúp học sinh lớp 3 ôn tập bảng cửu chương, chủ đề phi hành gia".</p>
                    </div>
                </div>
                
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-kid-blue text-white flex items-center justify-center font-bold shrink-0">2</div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Tải tài liệu (Tùy chọn)</h3>
                        <p className="text-slate-600 text-sm mt-1 flex items-start gap-2">
                             <FileText className="w-4 h-4 mt-0.5 text-slate-400" />
                             Nếu bạn có sẵn file PDF chứa câu hỏi trắc nghiệm, hãy tải lên. AI sẽ tự động đọc và đưa câu hỏi vào game.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-kid-green text-white flex items-center justify-center font-bold shrink-0">3</div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Tương tác & Chỉnh sửa</h3>
                        <p className="text-slate-600 text-sm mt-1">
                            Sau khi tạo game, bạn có thể chat với AI ở góc phải dưới để yêu cầu sửa đổi. Ví dụ: "Hãy đổi màu nền thành màu xanh", "Thêm hiệu ứng pháo hoa khi thắng".
                        </p>
                    </div>
                </div>
            </div>
          ) : (
            <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800 mb-4">
                    <strong>Tại sao cần API Key?</strong><br/>
                    Để sử dụng trí tuệ nhân tạo Google Gemini miễn phí và không giới hạn tốc độ, bạn cần một chiếc "chìa khóa" riêng. Nó hoàn toàn miễn phí!
                </div>

                <div className="space-y-4">
                    <div className="group border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                        <h4 className="font-bold text-slate-700 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" /> Bước 1: Lấy Key
                        </h4>
                        <p className="text-sm text-slate-500 mt-1 ml-6">
                            Truy cập <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-blue-600 font-bold hover:underline">Google AI Studio</a>. Đăng nhập Gmail và nhấn nút <b>"Create API Key"</b>.
                        </p>
                    </div>

                    <div className="group border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                        <h4 className="font-bold text-slate-700 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" /> Bước 2: Mở Cài đặt
                        </h4>
                        <p className="text-sm text-slate-500 mt-1 ml-6 flex items-center gap-1">
                            Tại ứng dụng này, nhấn vào nút <Settings className="w-4 h-4 inline bg-slate-100 p-0.5 rounded" /> <b>Cài đặt</b> ở góc trên bên phải màn hình.
                        </p>
                    </div>

                    <div className="group border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                        <h4 className="font-bold text-slate-700 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" /> Bước 3: Nhập Key
                        </h4>
                        <p className="text-sm text-slate-500 mt-1 ml-6">
                            Dán đoạn mã API Key vừa copy vào ô trống và nhấn <b>"Lưu Key vào máy"</b>.
                        </p>
                    </div>
                </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
             <button onClick={onClose} className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors">
                Đã hiểu
             </button>
        </div>
      </div>
    </div>
  );
};
