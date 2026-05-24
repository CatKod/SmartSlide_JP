const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper to query Gemini API
async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini API key not configured');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}

// Helper to query OpenAI API
async function callOpenAI(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API key not configured');

  const url = 'https://api.openai.com/v1/chat/completions';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from OpenAI');
  return text;
}

// Helper: Smart fallback response generator for Japanese teachers
function generateMockResponse(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('n5') || lowerPrompt.includes('vocab') || lowerPrompt.includes('từ vựng')) {
    return `### [AI gợi ý] Mẫu từ vựng tiếng Nhật N5 - Chủ đề trường học
1. **教室 (きょうしつ)**: Lớp học
2. **つくえ**: Bàn học
3. **いす**: Ghế
4. **こくばん**: Bảng đen
5. **えんぴつ**: Bút chì

*Gợi ý cách dạy: Cho học sinh thực hành chỉ vào đồ vật xung quanh lớp và hỏi "これは何ですか" (Đây là cái gì?).*`;
  }
  
  if (lowerPrompt.includes('n3') || lowerPrompt.includes('grammar') || lowerPrompt.includes('ngữ pháp')) {
    return `### [AI gợi ý] Ngữ pháp N3: 〜てくる và 〜ていく
- **〜てくる (Te-kuru)**: Hành động hướng về phía người nói hoặc sự thay đổi diễn ra từ quá khứ đến nay.
  *Ví dụ: 寒くなってきました (Trời đã lạnh dần lên rồi).*
- **〜ていく (Te-iku)**: Hành động hướng ra xa người nói hoặc sự thay đổi tiếp diễn từ nay về tương lai.
  *Ví dụ: これからも日本語を勉強していきます (Từ nay tôi cũng sẽ tiếp tục học tiếng Nhật).*

*Gợi ý slide: Slide 1: Khái niệm & Sơ đồ hướng. Slide 2: Ví dụ với động từ di chuyển. Slide 3: Ví dụ với động từ trạng thái.*`;
  }

  return `### [AI Trợ lý học tập] Ý tưởng bài giảng cho chủ đề: "${prompt}"

1. **Mục tiêu bài học (Target):**
   - Giúp học sinh hiểu và vận dụng đúng cấu trúc ngữ pháp / từ vựng chính liên quan đến chủ đề.

2. **Gợi ý bố cục Slide (7 slide chuẩn):**
   - **Slide 1:** Tiêu đề & Giới thiệu
   - **Slide 2:** Khởi động (Warm-up) - Đặt câu hỏi thực tế
   - **Slide 3:** Ngữ pháp / Từ vựng chính (Giải thích chi tiết)
   - **Slide 4:** Ví dụ cụ thể (Có hình ảnh minh họa)
   - **Slide 5:** Luyện tập tương tác (Bài tập ngắn hoặc trò chơi nhỏ)
   - **Slide 6:** Hoạt động nhóm hoặc thảo luận tự do
   - **Slide 7:** Tổng kết & Bài tập về nhà

*Gợi ý thêm: Bạn có thể sao chép văn bản này và dán trực tiếp vào slide để tùy chỉnh thêm.*`;
}

/**
 * POST /api/ai/chat
 * Nhận prompt từ giáo viên và gọi dịch vụ AI (Gemini/OpenAI) hoặc trả về gợi ý giáo án.
 */
router.post(
  '/chat',
  auth,
  [
    body('prompt').trim().notEmpty().withMessage('Prompt is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { prompt } = req.body;

    try {
      // 1. Try Gemini first if key exists
      if (process.env.GEMINI_API_KEY) {
        const result = await callGemini(prompt);
        return res.json({ response: result });
      }

      // 2. Try OpenAI next if key exists
      if (process.env.OPENAI_API_KEY) {
        const result = await callOpenAI(prompt);
        return res.json({ response: result });
      }

      // 3. Fallback to smart local template response
      const fallback = generateMockResponse(prompt);
      return res.json({ response: fallback, isMock: true });
    } catch (err) {
      console.error('AI integration error:', err.message);
      // Even if AI service fails, return fallback so the teacher can continue their lesson preparation smoothly
      const fallback = generateMockResponse(prompt);
      return res.json({
        response: fallback,
        isMock: true,
        warning: 'AIサービスへの接続に失敗したため、ローカルのデータベースから推奨内容を自動生成しました。'
      });
    }
  }
);

module.exports = router;
