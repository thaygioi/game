import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

const getClient = (userApiKey?: string) => {
    // 1. Xác định nguồn Key (User Input hoặc Env)
    let rawKey = userApiKey || process.env.API_KEY;

    if (!rawKey) {
      throw new Error("Chưa có API Key! Vui lòng nhấn vào nút Cài đặt (⚙️) ở góc trên màn hình để nhập Google Gemini API Key.");
    }

    let finalKey = rawKey;

    // 2. Xử lý Multi-Key (Nếu là chuỗi JSON array)
    try {
        if (rawKey.trim().startsWith('[') && rawKey.trim().endsWith(']')) {
            const parsedKeys = JSON.parse(rawKey);
            if (Array.isArray(parsedKeys) && parsedKeys.length > 0) {
                // Lọc key rỗng
                const validKeys = parsedKeys.filter(k => k && typeof k === 'string' && k.trim().length > 0);
                if (validKeys.length > 0) {
                    // Chọn ngẫu nhiên 1 key
                    finalKey = validKeys[Math.floor(Math.random() * validKeys.length)];
                }
            }
        }
    } catch (e) {
        // Nếu lỗi parse JSON, coi như là string key bình thường
        console.warn("API Key không phải dạng mảng JSON, sử dụng như Single Key.");
    }

    return new GoogleGenAI({ apiKey: finalKey });
};

// Fixed Audio Assets (Google Drive Direct Links)
const AUDIO_ASSETS = {
  WRONG: "https://drive.google.com/uc?export=download&id=18dwx0EDlzbYDds0PupqxmR03ux_QH4zn",
  CORRECT: "https://drive.google.com/uc?export=download&id=1wxYH5-gSbJwFxBHy-oXfT2w64cJLa5Vl",
  BG_MUSIC: "https://drive.google.com/uc?export=download&id=1j0NFTSkaWtntRRbrExcAkx3_we07ZusE"
};

const cleanGeneratedCode = (rawText: string): string => {
  let cleanText = rawText.replace(/<!-- 🚀.*?-->/gs, '');

  const markdownMatch = cleanText.match(/```html([\s\S]*?)```/);
  if (markdownMatch && markdownMatch[1]) {
      cleanText = markdownMatch[1];
  }

  const htmlStart = cleanText.indexOf('<!DOCTYPE html>');
  const htmlEnd = cleanText.lastIndexOf('</html>');

  if (htmlStart !== -1 && htmlEnd !== -1) {
      cleanText = cleanText.substring(htmlStart, htmlEnd + 7);
  } else if (htmlStart !== -1) {
       // Nếu AI quên đóng thẻ html, tự động đóng giúp
       cleanText = cleanText.substring(htmlStart) + '</html>';
  }

  return cleanText.trim();
};

export const consultGameLogic = async (
    idea: string,
    ageGroup: string,
    apiKey: string | undefined
): Promise<string> => {
    const ai = getClient(apiKey);
    
    const prompt = `
        Bạn là GAME DESIGNER chuyên nghiệp.
        Ý tưởng người dùng: "${idea}" (Tuổi: ${ageGroup}).
        
        Nhiệm vụ: Hãy đặt **MỘT CÂU HỎI DUY NHẤT** để làm rõ cơ chế game (Gameplay) hoặc Phong cách (Visual).
        Mục tiêu: Giúp game sau này lập trình chính xác hơn.
        
        Ví dụ: "Bạn muốn game dạng trắc nghiệm chọn đáp án hay dạng hành động né chướng ngại vật?"
        
        Chỉ trả về câu hỏi.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.7, thinkingConfig: { thinkingBudget: 0 } }
        });
        return response.text || "Bạn muốn cách chơi cụ thể như thế nào?";
    } catch (error) {
        return "Bạn muốn game này chơi như thế nào?";
    }
};

export const generateGameCodeStream = async (
  idea: string, 
  ageGroup: string,
  difficulty: string,
  userClarification: string, 
  apiKey: string | undefined,
  onUpdate: (chunkText: string) => void
): Promise<string> => {
  // Fake log để kích hoạt UI ngay lập tức
  let fullText = '<!-- 🚀 Đang khởi tạo Engine Game HTML5 Canvas (Fail-safe Mode)... -->\n';
  onUpdate(fullText);

  try {
    const ai = getClient(apiKey);
    
    const prompt = `
      Bạn là MỘT ENGINE TẠO GAME TỰ ĐỘNG (AI Game Generator).
      NHIỆM VỤ TỐI THƯỢNG: Trả về code HTML5 Single-file CHẠY ĐƯỢC 100% (Runnable). KHÔNG ĐƯỢC PHÉP LỖI CÚ PHÁP.

      🚨 **BỘ LUẬT AN TOÀN TUYỆT ĐỐI (FAIL-SAFE PROTOCOLS):**
      1. **Error Handling:** Bắt buộc chèn script \`window.onerror\` ở ngay đầu thẻ \`<body>\` để hứng mọi lỗi và hiện lên màn hình.
      2. **Variable Safety:** Khai báo TOÀN BỘ biến toàn cục (canvas, ctx, score, state...) ở ngay dòng đầu tiên của thẻ \`<script>\`. Không dùng biến trước khi khai báo.
      3. **Asset Priority:** **ƯU TIÊN TUYỆT ĐỐI** link nhạc Google Drive được cung cấp. Chỉ dùng \`OscillatorNode\` khi link bị lỗi mạng (Network Error).
      4. **Loop Protection:** Bên trong \`gameLoop()\`, hãy bọc nội dung bằng \`try { ... } catch (e) { console.error(e); }\`. Nếu 1 frame lỗi, game vẫn chạy frame tiếp theo.
      5. **Autoplay Bypass:** Game KHÔNG ĐƯỢC chạy ngay. Phải có màn hình "CLICK TO START" để kích hoạt AudioContext.

      🎨 **GIAO DIỆN (VISUAL STYLE):**
      - **Phong cách:** Hoạt hình 3D rực rỡ, màu sắc tươi sáng (Vivid Colors).
      - **Assets:** Sử dụng **EMOJI** (🤡, 🚗, 🍎, 🚀) vẽ lên Canvas thay vì tải ảnh ngoài (để tránh lỗi 404).
      - **UI:** Nút bấm phải RẤT TO, bo tròn, có đổ bóng 3D. Font chữ to, đậm, vui nhộn.
      - **Responsive:** Canvas luôn full màn hình (\`width: 100%; height: 100%\`), tự resize khi xoay máy.

      🎮 **THÔNG TIN GAME:**
      - **Ý tưởng:** "${idea}"
      - **Chi tiết thêm:** "${userClarification}"
      - **Độ tuổi:** ${ageGroup}.
      - **Độ khó:** ${difficulty}.
      - **Điều khiển:** CHỈ HỖ TRỢ CHUỘT (Click) và BÀN PHÍM.

      🔗 **ÂM THANH CỐ ĐỊNH (NGUỒN CHÍNH - BẮT BUỘC DÙNG):**
      - Nhạc nền (ƯU TIÊN CAO NHẤT): "${AUDIO_ASSETS.BG_MUSIC}"
      - Đúng (ƯU TIÊN CAO NHẤT): "${AUDIO_ASSETS.CORRECT}"
      - Sai (ƯU TIÊN CAO NHẤT): "${AUDIO_ASSETS.WRONG}"

      🛠️ **CẤU TRÚC CODE BẮT BUỘC (TEMPLATE):**
      \`\`\`html
      <!DOCTYPE html>
      <html>
      <head>
        <style>body { margin: 0; overflow: hidden; background: #333; font-family: sans-serif; }</style>
      </head>
      <body>
        <!-- 1. Bẫy lỗi -->
        <script>
            window.onerror = function(msg, url, line) {
                const d = document.createElement('div');
                d.style.cssText = 'position:fixed;top:0;left:0;width:100%;background:red;color:white;padding:10px;z-index:9999;';
                d.innerHTML = '⚠️ Lỗi Game: ' + msg + ' (Dòng ' + line + ')';
                document.body.appendChild(d);
            };
        </script>

        <canvas id="gameCanvas"></canvas>

        <script>
            // 2. Khai báo biến toàn cục
            const canvas = document.getElementById('gameCanvas');
            const ctx = canvas.getContext('2d');
            let gameState = 'START'; // START, PLAY, GAMEOVER
            let score = 0;
            // ... khai báo các biến khác ở đây ...

            // 3. Hệ thống âm thanh (ƯU TIÊN GOOGLE DRIVE MP3)
            const sounds = {
                bg: new Audio('${AUDIO_ASSETS.BG_MUSIC}'),
                correct: new Audio('${AUDIO_ASSETS.CORRECT}'),
                wrong: new Audio('${AUDIO_ASSETS.WRONG}')
            };
            sounds.bg.loop = true;
            sounds.bg.volume = 0.6; // Âm lượng vừa phải
            
            // Hàm phát âm thanh an toàn
            function playSound(type) {
                try {
                    const s = type === 'bg' ? sounds.bg : (type === 'correct' ? sounds.correct : sounds.wrong);
                    
                    if (type !== 'bg') s.currentTime = 0;
                    
                    const playPromise = s.play();
                    
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            // Chỉ khi lỗi mạng thật sự mới fallback sang Beep
                            // Lỗi NotAllowedError (chưa click) thì bỏ qua, chờ user click
                            if (error.name !== 'NotAllowedError') {
                                console.warn("Audio MP3 failed, using fallback:", error);
                                if (type === 'correct') playBeep(600, 'square');
                                else if (type === 'wrong') playBeep(200, 'sawtooth');
                            }
                        });
                    }
                } catch(e) { playBeep(440, 'sine'); }
            }

            function playBeep(freq, type) {
                // ... code tạo tiếng bíp dùng AudioContext ...
            }

            // 4. Logic Game
            function init() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                // ... khởi tạo đối tượng game ...
            }

            function update() {
                // ... cập nhật logic (di chuyển, va chạm) ...
            }

            function draw() {
                // ... vẽ mọi thứ (dùng EMOJI làm hình ảnh) ...
                // Vẽ UI (Nút Start, Nút Replay, Điểm số)
            }

            // 5. Vòng lặp an toàn
            function loop() {
                try {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    if (gameState === 'PLAY') {
                        update();
                    }
                    draw();
                } catch (e) {
                    console.error("Frame Error:", e);
                }
                requestAnimationFrame(loop);
            }

            // Input Handling (Mouse & Keyboard)
            window.addEventListener('mousedown', (e) => {
                // Xử lý click chuột
                if (gameState === 'START') { 
                    gameState = 'PLAY'; 
                    playSound('bg'); // Kích hoạt nhạc nền ngay khi click Start
                    init(); 
                }
                else if (gameState === 'GAMEOVER') { gameState = 'START'; }
                else { 
                    // Logic chơi game
                }
            });
            
            window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });

            // Bắt đầu
            init();
            loop();
        </script>
      </body>
      </html>
      \`\`\`

      HÃY VIẾT CODE DỰA TRÊN TEMPLATE TRÊN. CHỈ TRẢ VỀ CODE HTML.
    `;

    const apiCallPromise = ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.6, // Giảm sáng tạo để tăng độ ổn định logic
        maxOutputTokens: 8192,
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    // Timeout an toàn 90s
    const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("AI đang tính toán logic phức tạp, vui lòng đợi thêm...")), 90000)
    );

    const responseStream = await Promise.race([apiCallPromise, timeoutPromise]);

    let isFirstChunk = true;
    for await (const chunk of responseStream) {
      const chunkText = chunk.text || '';
      if (isFirstChunk) {
         if (fullText.includes('<!-- 🚀')) fullText = ''; 
         isFirstChunk = false;
      }
      fullText += chunkText;
      onUpdate(fullText);
    }

    return cleanGeneratedCode(fullText);

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
    
    if (!currentCode) {
         return { text: "Hãy tạo một trò chơi trước, sau đó tôi sẽ giúp bạn sửa lỗi hoặc thêm tính năng!" };
    }
    
    const prompt = `
        MÃ NGUỒN HTML HIỆN TẠI:
        \`\`\`html
        ${currentCode}
        \`\`\`
        YÊU CẦU NGƯỜI DÙNG: "${userMessage}"
        
        NHIỆM VỤ: Sửa code HTML trên để đáp ứng yêu cầu.
        QUY TẮC AN TOÀN:
        - KHÔNG xóa phần window.onerror.
        - KHÔNG xóa phần fallback âm thanh (playBeep).
        - Đảm bảo cú pháp đóng mở thẻ chính xác.
        - Trả về toàn bộ code HTML đã sửa.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { thinkingConfig: { thinkingBudget: 0 } }
        });

        const rawText = response.text || "";
        const newCode = cleanGeneratedCode(rawText);

        if (newCode && newCode.startsWith('<!DOCTYPE html>')) {
            return { text: 'Đã cập nhật code theo yêu cầu của bạn! Hãy nhấn "Chơi Luôn" để thử nhé.', newCode: newCode };
        } else {
            return { text: rawText };
        }

    } catch (error) {
        return { text: "Xin lỗi, tôi gặp chút trục trặc khi sửa code. Bạn thử lại nhé." };
    }
}