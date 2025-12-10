
import { GoogleGenAI } from "@google/genai";
import { ChatMessage, CustomAudioAssets } from "../types";

const getClient = (userApiKey?: string) => {
    let rawKey = userApiKey || process.env.API_KEY;
    if (!rawKey) throw new Error("Chưa có API Key! Vui lòng nhấn vào nút Cài đặt (⚙️) ở góc trên màn hình để nhập Google Gemini API Key.");
    let finalKey = rawKey;
    try {
        if (rawKey.trim().startsWith('[') && rawKey.trim().endsWith(']')) {
            const parsedKeys = JSON.parse(rawKey);
            if (Array.isArray(parsedKeys) && parsedKeys.length > 0) {
                const validKeys = parsedKeys.filter(k => k && typeof k === 'string' && k.trim().length > 0);
                if (validKeys.length > 0) finalKey = validKeys[Math.floor(Math.random() * validKeys.length)];
            }
        }
    } catch (e) { console.warn("API Key không phải dạng mảng JSON, sử dụng như Single Key."); }
    return new GoogleGenAI({ apiKey: finalKey });
};

const cleanGeneratedCode = (rawText: string): string => {
  let cleanText = rawText.replace(/<!-- 🚀.*?-->/gs, '');
  const markdownMatch = cleanText.match(/```html([\s\S]*?)```/);
  if (markdownMatch && markdownMatch[1]) cleanText = markdownMatch[1];
  const htmlStart = cleanText.indexOf('<!DOCTYPE html>');
  const htmlEnd = cleanText.lastIndexOf('</html>');
  if (htmlStart !== -1 && htmlEnd !== -1) cleanText = cleanText.substring(htmlStart, htmlEnd + 7);
  else if (htmlStart !== -1) cleanText = cleanText.substring(htmlStart) + '</html>';
  return cleanText.trim();
};

export const analyzePdfContent = async (pdfText: string, fileName: string, apiKey: string | undefined): Promise<string> => {
    const ai = getClient(apiKey);
    const truncatedText = pdfText.length > 50000 ? pdfText.substring(0, 50000) + "..." : pdfText;
    
    const prompt = `
    Bạn là trợ lý giáo dục AI thông minh của thầy Giới.
    Người dùng vừa tải lên tài liệu: "${fileName}".
    
    NỘI DUNG TÀI LIỆU:
    """
    ${truncatedText}
    """

    NHIỆM VỤ CỦA BẠN (QUAN TRỌNG - CHẾ ĐỘ XỬ LÝ DỮ LIỆU):
    1. Đọc và **ĐẾM** xem có bao nhiêu câu hỏi trắc nghiệm hoặc câu hỏi kiến thức trong văn bản trên.
    2. Xác nhận rằng bạn đã "nhìn thấy" nội dung chi tiết của từng câu hỏi và đáp án.
    3. Trả lời người dùng theo mẫu sau:
       "Dạ, em đã đọc xong file [Tên File] ạ! 
       Em tìm thấy khoảng [Số lượng] câu hỏi trong tài liệu.
       Thầy cô có muốn em tạo game trắc nghiệm sử dụng **toàn bộ** danh sách câu hỏi này không ạ? Hay thầy cô muốn làm dạng game nào khác (Đua xe, Ai là triệu phú...)?"
    
    YÊU CẦU TRẢ LỜI:
    - Giọng điệu hào hứng, lễ phép.
    - Tuyệt đối không cần tóm tắt nội dung file. Hãy tập trung vào việc xác nhận số lượng câu hỏi để đưa vào game.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.7, thinkingConfig: { thinkingBudget: 0 } }
        });
        return response.text || "Em đã đọc xong file PDF và thấy có rất nhiều câu hỏi hay. Thầy cô muốn em đưa toàn bộ vào game trắc nghiệm luôn nhé?";
    } catch (error) {
        console.error("PDF Analysis Error:", error);
        return "Em đã đọc được file nhưng gặp chút trục trặc khi phân tích. Thầy cô cứ nhập ý tưởng game trắc nghiệm muốn làm nhé!";
    }
};

export const consultGameLogic = async (idea: string, ageGroup: string, apiKey: string | undefined): Promise<string> => {
    const ai = getClient(apiKey);
    const prompt = `Bạn là GAME DESIGNER chuyên nghiệp. Ý tưởng: "${idea}" (Tuổi: ${ageGroup}). Hãy đặt **MỘT CÂU HỎI DUY NHẤT** để làm rõ cơ chế game. Chỉ trả về câu hỏi.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.7, thinkingConfig: { thinkingBudget: 0 } }
        });
        return response.text || "Bạn muốn cách chơi cụ thể như thế nào?";
    } catch (error) { return "Bạn muốn game này chơi như thế nào?"; }
};

export const generateGameCodeStream = async (
  idea: string, 
  ageGroup: string,
  difficulty: string,
  userClarification: string, 
  customAudio: CustomAudioAssets,
  apiKey: string | undefined,
  onUpdate: (chunkText: string) => void
): Promise<string> => {
  let fullText = '<!-- 🚀 Đang khởi tạo Engine Game HTML5 Canvas (Custom Audio Enabled)... -->\n';
  onUpdate(fullText);

  // Xác định nguồn âm thanh (Placeholder nếu có Custom, hoặc Empty String)
  const bgSrc = customAudio.bgMusic ? "__CUSTOM_BG_MUSIC_TOKEN__" : "";
  const correctSrc = customAudio.correctSound ? "__CUSTOM_CORRECT_TOKEN__" : "";
  const wrongSrc = customAudio.wrongSound ? "__CUSTOM_WRONG_TOKEN__" : "";

  try {
    const ai = getClient(apiKey);
    const prompt = `
      Bạn là MỘT ENGINE TẠO GAME TỰ ĐỘNG (AI Game Generator).
      NHIỆM VỤ: Trả về code HTML5 Single-file CHẠY ĐƯỢC 100%.

      🚨 **QUY TẮC AN TOÀN (BẮT BUỘC):**
      1. **Error Handling:** Luôn có \`try...catch\` cho logic chính và xử lý âm thanh.
      2. **Variable Check:** TUYỆT ĐỐI KHÔNG truy cập thuộc tính của biến nếu chưa kiểm tra khác undefined/null.
      
      🚫 **QUY TẮC ÂM THANH "KHÔNG KHOAN NHƯỢNG" (STRICT NO-HALLUCINATION):**
      - **TUYỆT ĐỐI KHÔNG** được tự ý điền link URL vào biến âm thanh.
      - Code Javascript MẪU ở dưới sử dụng biến \`AUDIO_SOURCE\`. Bạn **KHÔNG ĐƯỢC PHÉP SỬA** giá trị trong biến này.
      - Sử dụng token: __PH_BG_MUSIC__, __PH_CORRECT__, __PH_WRONG__ làm giá trị cho AUDIO_SOURCE.
      - Hệ thống TypeScript bên ngoài sẽ thay thế token bằng dữ liệu thật sau.

      📚 **QUY TẮC XỬ LÝ DỮ LIỆU CÂU HỎI (DATA EXTRACTION - QUAN TRỌNG NHẤT):**
      - Nếu trong phần "Ý tưởng" có chứa nội dung file PDF/Văn bản câu hỏi:
        1. Bạn phải **TRÍCH XUẤT TOÀN BỘ** câu hỏi và đáp án đó.
        2. Chuyển đổi thành một mảng đối tượng JavaScript trong code game.
        3. Ví dụ: \`const questions = [{ question: "...", options: ["A", "B", "C", "D"], correct: 0 }, ...];\`
        4. KHÔNG ĐƯỢC TÓM TẮT. KHÔNG ĐƯỢC TỰ BỊA. Phải dùng chính xác dữ liệu được cung cấp.

      4. **UI Requirement:** Bắt buộc giữ nguyên phần HTML/CSS điều khiển âm thanh (Volume Controls) trong template.

      🎨 **VISUAL STYLE:** Hoạt hình 3D rực rỡ, EMOJI làm sprite, Nút bấm to, Hiệu ứng nổ/bay.

      🎮 **GAME INFO:**
      - Ý tưởng: "${idea}"
      - Chi tiết: "${userClarification}"
      - Tuổi: ${ageGroup}. Độ khó: ${difficulty}.
      - Điều khiển: Chuột/Cảm ứng & Phím.

      🛠️ **CẤU TRÚC CODE (TEMPLATE):**
      \`\`\`html
      <!DOCTYPE html>
      <html>
      <head>
        <style>
            body{margin:0;overflow:hidden;background:#222;font-family:sans-serif;touch-action:none;}
            #ui-controls { position: fixed; top: 10px; right: 10px; z-index: 9999; display: flex; gap: 8px; }
            .ui-btn { background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.4); color: white; border-radius: 8px; padding: 6px 10px; cursor: pointer; font-size: 14px; font-weight: bold; user-select: none; transition: all 0.2s; }
            .ui-btn:hover { background: rgba(255,255,255,0.4); transform: scale(1.05); }
        </style>
      </head>
      <body>
        <div id="ui-controls">
            <button id="btnVolDown" class="ui-btn">🔉 -</button>
            <button id="btnMute" class="ui-btn">🔊</button>
            <button id="btnVolUp" class="ui-btn">🔊 +</button>
        </div>
        <script>window.onerror=function(m){console.error(m);}</script>
        <canvas id="gameCanvas"></canvas>
        <script>
            const canvas = document.getElementById('gameCanvas');
            const ctx = canvas.getContext('2d');
            let gameState = 'START';
            let masterVolume = 1.0;
            let isMuted = false;

            // --- AUDIO CONFIGURATION (DO NOT MODIFY TOKENS) ---
            const AUDIO_SOURCE = {
                bg: "__PH_BG_MUSIC__",
                correct: "__PH_CORRECT__",
                wrong: "__PH_WRONG__"
            };
            // ----------------------------------------------------

            // Audio System (Safe Init)
            const sounds = {
                bg: AUDIO_SOURCE.bg ? new Audio(AUDIO_SOURCE.bg) : null,
                correct: AUDIO_SOURCE.correct ? new Audio(AUDIO_SOURCE.correct) : null,
                wrong: AUDIO_SOURCE.wrong ? new Audio(AUDIO_SOURCE.wrong) : null
            };
            
            if(sounds.bg) { sounds.bg.loop = true; }

            function updateAllVolumes() {
                const vol = isMuted ? 0 : masterVolume;
                if(sounds.bg) sounds.bg.volume = Math.max(0, Math.min(1, vol * 0.8)); 
                if(sounds.correct) sounds.correct.volume = Math.max(0, Math.min(1, vol));
                if(sounds.wrong) sounds.wrong.volume = Math.max(0, Math.min(1, vol));
                const muteBtn = document.getElementById('btnMute');
                if(muteBtn) muteBtn.innerText = (isMuted || masterVolume === 0) ? '🔇' : (masterVolume < 0.5 ? '🔉' : '🔊');
            }

            function playSound(type) {
                if(isMuted) return;
                try {
                    const s = sounds[type];
                    if (s) {
                        if(type!=='bg') s.currentTime=0;
                        s.play().catch(e => {});
                    }
                } catch(e){ }
            }
            
            // UI Button Events
            document.getElementById('btnVolDown').onclick = (e) => { e.stopPropagation(); masterVolume = Math.max(0, masterVolume - 0.1); if(masterVolume>0) isMuted=false; updateAllVolumes(); };
            document.getElementById('btnVolUp').onclick = (e) => { e.stopPropagation(); masterVolume = Math.min(1, masterVolume + 0.1); isMuted=false; updateAllVolumes(); };
            document.getElementById('btnMute').onclick = (e) => { e.stopPropagation(); isMuted = !isMuted; updateAllVolumes(); };
            
            updateAllVolumes();

            // Game Logic
            // ... (AI implements game logic here)

            function init(){ canvas.width=innerWidth; canvas.height=innerHeight; }
            function loop(){ 
                try {
                    requestAnimationFrame(loop);
                    ctx.clearRect(0,0,canvas.width,canvas.height);
                    if(gameState === 'START') {
                        ctx.fillStyle = '#00000088'; ctx.fillRect(0,0,canvas.width, canvas.height);
                        ctx.fillStyle = 'white'; ctx.font = 'bold 30px Arial'; ctx.textAlign = 'center';
                        ctx.fillText('NHẤN ĐỂ BẮT ĐẦU', canvas.width/2, canvas.height/2);
                    } else if (gameState === 'PLAY') {
                         // Game Loop
                    }
                } catch(e) {}
            }
            
            function handleInputStart() {
                if(gameState === 'START') {
                    gameState = 'PLAY';
                    if(sounds.bg) sounds.bg.play().catch(e => {});
                }
            }
            window.addEventListener('mousedown', (e) => { if(!e.target.closest('#ui-controls')) handleInputStart(); });
            window.addEventListener('touchstart', (e) => { if(!e.target.closest('#ui-controls')) { e.preventDefault(); handleInputStart(); } }, {passive: false});
            window.addEventListener('keydown', handleInputStart);
            window.addEventListener('resize', () => { canvas.width=innerWidth; canvas.height=innerHeight; });

            init(); loop();
        </script>
      </body></html>
      \`\`\`
    `;

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.5, thinkingConfig: { thinkingBudget: 0 } }
    });

    for await (const chunk of responseStream) {
      const chunkText = chunk.text || '';
      fullText += chunkText;
      onUpdate(fullText);
    }

    let finalCode = cleanGeneratedCode(fullText);

    // Replace Audio Tokens with Real Data or Empty Strings
    finalCode = finalCode.replace('__PH_BG_MUSIC__', customAudio.bgMusic || "");
    finalCode = finalCode.replace('__PH_CORRECT__', customAudio.correctSound || "");
    finalCode = finalCode.replace('__PH_WRONG__', customAudio.wrongSound || "");
    
    // Fallback: Nếu AI quên dùng token mà dùng __CUSTOM... thì replace nốt
    if (customAudio.bgMusic) finalCode = finalCode.split('__CUSTOM_BG_MUSIC_TOKEN__').join(customAudio.bgMusic);
    if (customAudio.correctSound) finalCode = finalCode.split('__CUSTOM_CORRECT_TOKEN__').join(customAudio.correctSound);
    if (customAudio.wrongSound) finalCode = finalCode.split('__CUSTOM_WRONG_TOKEN__').join(customAudio.wrongSound);

    return finalCode;

  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};

export const sendChatMessage = async (
    history: ChatMessage[], 
    currentCode: string, 
    userMessage: string,
    apiKey: string | undefined
): Promise<{ text: string, newCode?: string }> => {
    // OPTIMIZATION: Tách dữ liệu Base64 ra khỏi code để giảm tải cho AI
    // Nếu gửi nguyên cả file MP3 base64 lên, prompt sẽ quá dài và gây timeout/chậm.
    const assetMap = new Map<string, string>();
    let optimizedCode = currentCode.replace(/data:([a-zA-Z0-9/.-]+);base64,([A-Za-z0-9+/=]+)/g, (match) => {
        const token = `__ASSET_TOKEN_${assetMap.size}__`;
        assetMap.set(token, match);
        return token;
    });

    const ai = getClient(apiKey);
    const prompt = `
    CODE HTML HIỆN TẠI (Đã ẩn các dữ liệu âm thanh/ảnh nặng bằng __ASSET_TOKEN__): 
    \`\`\`html
    ${optimizedCode}
    \`\`\`
    
    YÊU CẦU CỦA NGƯỜI DÙNG: "${userMessage}". 
    
    NHIỆM VỤ:
    Hãy sửa code HTML trên theo yêu cầu.
    
    QUY TẮC BẮT BUỘC (TUÂN THỦ 100%):
    1. **Audio Integrity:** GIỮ NGUYÊN các token \`__ASSET_TOKEN_...\`. KHÔNG ĐƯỢC thay đổi hay xóa chúng. Hệ thống sẽ tự điền lại dữ liệu sau.
    2. **UI Integrity:** KHÔNG ĐƯỢC XÓA khối \`<div id="ui-controls">...</div>\`.
    3. **Safe Audio:** Nếu người dùng yêu cầu thêm âm thanh mới, KHÔNG được tự bịa link. Hãy dùng lại các biến âm thanh có sẵn hoặc báo người dùng cần tải file mới lên và tạo lại game.
    
    Trả về Full Code HTML đã sửa (chứa các token).
    `;
    try {
        const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { thinkingConfig: { thinkingBudget: 0 } } });
        const raw = res.text || "";
        let newCode = cleanGeneratedCode(raw);
        
        // RESTORE: Điền lại dữ liệu Base64 vào code mới
        if (newCode.startsWith('<!DOCTYPE')) {
            assetMap.forEach((value, token) => {
                newCode = newCode.replace(token, value);
            });
            return { text: 'Đã sửa code theo yêu cầu! (Đã tối ưu tốc độ xử lý)', newCode };
        } else {
            return { text: raw };
        }
    } catch (e) { 
        console.error(e);
        return { text: "Lỗi khi sửa code. Có thể code quá dài hoặc mất kết nối." }; 
    }
}
