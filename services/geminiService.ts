
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

// Fixed Audio Assets (Google Drive Direct Links)
const DEFAULT_AUDIO = {
  WRONG: "https://drive.google.com/uc?export=download&id=18dwx0EDlzbYDds0PupqxmR03ux_QH4zn",
  CORRECT: "https://drive.google.com/uc?export=download&id=1wxYH5-gSbJwFxBHy-oXfT2w64cJLa5Vl",
  BG: "https://drive.google.com/uc?export=download&id=1j0NFTSkaWtntRRbrExcAkx3_we07ZusE"
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

  // Xác định nguồn âm thanh (Placeholder nếu có Custom, hoặc Default Link)
  // Lưu ý: AI sẽ được yêu cầu điền PLACEHOLDER, sau đó ta sẽ replace bằng Base64 thật ở cuối
  const bgSrc = customAudio.bgMusic ? "__CUSTOM_BG_MUSIC_TOKEN__" : DEFAULT_AUDIO.BG;
  const correctSrc = customAudio.correctSound ? "__CUSTOM_CORRECT_TOKEN__" : DEFAULT_AUDIO.CORRECT;
  const wrongSrc = customAudio.wrongSound ? "__CUSTOM_WRONG_TOKEN__" : DEFAULT_AUDIO.WRONG;

  try {
    const ai = getClient(apiKey);
    const prompt = `
      Bạn là MỘT ENGINE TẠO GAME TỰ ĐỘNG (AI Game Generator).
      NHIỆM VỤ: Trả về code HTML5 Single-file CHẠY ĐƯỢC 100%.

      🚨 **FAIL-SAFE PROTOCOLS:**
      1. **Error Handling:** Chèn script \`window.onerror\` đầu thẻ body.
      2. **Variable Safety:** Khai báo toàn bộ biến đầu script.
      3. **Asset Priority:** Sử dụng link âm thanh được cung cấp dưới đây. Nếu là token __CUSTOM...__ thì cứ điền y nguyên vào src.
      4. **Loop Protection:** Try-catch trong gameLoop.
      5. **Autoplay Bypass:** Cần màn hình CLICK TO START.
      6. **Mute Button:** Có nút bật/tắt âm thanh.

      🎨 **VISUAL STYLE:** Hoạt hình 3D rực rỡ, EMOJI làm sprite, Nút bấm to. Canvas full màn hình.

      🎮 **GAME INFO:**
      - Ý tưởng: "${idea}"
      - Chi tiết: "${userClarification}"
      - Tuổi: ${ageGroup}. Độ khó: ${difficulty}.
      - Điều khiển: Chuột & Phím.

      🔗 **ÂM THANH (Sử dụng chính xác các link này):**
      - Nhạc nền: "${bgSrc}"
      - Đúng: "${correctSrc}"
      - Sai: "${wrongSrc}"

      🛠️ **CẤU TRÚC CODE (TEMPLATE):**
      \`\`\`html
      <!DOCTYPE html>
      <html>
      <head><style>body{margin:0;overflow:hidden;background:#333}</style></head>
      <body>
        <script>window.onerror=function(m,u,l){document.body.innerHTML+='<div style="position:fixed;top:0;background:red;color:white;z-index:9999">⚠️ '+m+'</div>'}</script>
        <canvas id="gameCanvas"></canvas>
        <script>
            // Biến toàn cục
            const canvas = document.getElementById('gameCanvas');
            const ctx = canvas.getContext('2d');
            let gameState = 'START';
            let isMuted = false;
            
            // Âm thanh
            const sounds = {
                bg: new Audio('${bgSrc}'),
                correct: new Audio('${correctSrc}'),
                wrong: new Audio('${wrongSrc}')
            };
            sounds.bg.loop = true; sounds.bg.volume = 0.6;

            function playSound(t) {
                if(isMuted) return;
                try {
                    const s = t==='bg'?sounds.bg:(t==='correct'?sounds.correct:sounds.wrong);
                    if(t!=='bg') s.currentTime=0;
                    s.play().catch(e=>console.log(e));
                } catch(e){}
            }

            // Logic Game
            function init(){ canvas.width=innerWidth; canvas.height=innerHeight; }
            function loop(){ 
                requestAnimationFrame(loop);
                ctx.clearRect(0,0,canvas.width,canvas.height);
                // Vẽ UI, Game Logic...
                // VẼ NÚT MUTE, REPLAY, START...
            }
            
            window.addEventListener('mousedown', (e) => { /* Xử lý click */ });
            init(); loop();
        </script>
      </body></html>
      \`\`\`
    `;

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.6, thinkingConfig: { thinkingBudget: 0 } }
    });

    for await (const chunk of responseStream) {
      const chunkText = chunk.text || '';
      fullText += chunkText;
      onUpdate(fullText); // Stream code thô (chứa token placeholder) cho preview
    }

    let finalCode = cleanGeneratedCode(fullText);

    // POST-PROCESSING: Thay thế Token bằng Base64 thật
    // Bước này làm cho file HTML cuối cùng chứa toàn bộ dữ liệu âm thanh
    if (customAudio.bgMusic) finalCode = finalCode.replace('__CUSTOM_BG_MUSIC_TOKEN__', customAudio.bgMusic);
    if (customAudio.correctSound) finalCode = finalCode.replace('__CUSTOM_CORRECT_TOKEN__', customAudio.correctSound);
    if (customAudio.wrongSound) finalCode = finalCode.replace('__CUSTOM_WRONG_TOKEN__', customAudio.wrongSound);

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
    const ai = getClient(apiKey);
    const prompt = `CODE HTML: \`\`\`html\n${currentCode}\n\`\`\`\nYÊU CẦU: "${userMessage}". Hãy sửa code. Giữ nguyên các link âm thanh Base64 nếu có.`;
    try {
        const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { thinkingConfig: { thinkingBudget: 0 } } });
        const raw = res.text || "";
        const newCode = cleanGeneratedCode(raw);
        return { text: newCode.startsWith('<!DOCTYPE') ? 'Đã sửa code!' : raw, newCode: newCode.startsWith('<!DOCTYPE') ? newCode : undefined };
    } catch (e) { return { text: "Lỗi khi sửa code." }; }
}
