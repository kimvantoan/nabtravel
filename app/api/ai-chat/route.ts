import { NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Fetch hotel data from Laravel backend for AI context
async function fetchHotelContext(): Promise<string> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
    const res = await fetch(`${backendUrl}/api/hotels`, {
      next: { revalidate: 300 } // Cache 5 minutes
    });
    if (!res.ok) return '';
    const hotels = await res.json();
    if (!Array.isArray(hotels) || hotels.length === 0) return '';

    // Build concise hotel list for AI context
    return hotels.map((h: any) => {
      const price = h.price ? `${Number(h.price).toLocaleString('vi-VN')}đ/đêm` : 'Chưa có giá';
      return `- "${h.name}" | Slug: ${h.slug} | Vị trí: ${h.location} | Rating: ${h.rating}/5 | Giá: ${price} | Sao: ${h.stars}⭐ | Loại: ${h.propertyType}`;
    }).join('\n');
  } catch {
    return '';
  }
}

function buildSystemPrompt(hotelContext: string, locale: string): string {
  const isVi = locale === 'vi';

  return `${isVi
    ? `Bạn là trợ lý du lịch thông minh của NabTravel – nền tảng đặt khách sạn hàng đầu Việt Nam.

NHIỆM VỤ:
- Giúp người dùng lên kế hoạch du lịch, gợi ý khách sạn, và tư vấn trải nghiệm du lịch
- Trả lời tự nhiên, thân thiện, ngắn gọn nhưng đầy đủ thông tin
- Khi gợi ý khách sạn, LUÔN dùng khách sạn từ DANH SÁCH bên dưới (nếu phù hợp)
- Khi đề cập đến khách sạn cụ thể, LUÔN chèn block hotel-card để frontend render card

QUY TẮC QUAN TRỌNG:
1. Khi gợi ý khách sạn — chèn block đặc biệt ở DÒNG RIÊNG:
\`\`\`hotel-cards
[{"slug":"slug-cua-hotel","name":"Tên Hotel"}]
\`\`\`
2. Có thể gợi ý nhiều hotel cùng lúc trong 1 block
3. Nếu người dùng hỏi về nơi không có trong danh sách, vẫn tư vấn bình thường nhưng ghi chú rằng NabTravel đang mở rộng database
4. Dùng emoji phù hợp để tạo cảm giác thân thiện
5. Trả lời bằng tiếng Việt`
    : `You are the smart travel assistant of NabTravel – Vietnam's leading hotel booking platform.

MISSION:
- Help users plan trips, suggest hotels, and provide travel advice
- Respond naturally, friendly, concisely but informatively
- When suggesting hotels, ALWAYS use hotels from the LIST below (if relevant)
- When mentioning a specific hotel, ALWAYS insert a hotel-card block for frontend rendering

IMPORTANT RULES:
1. When suggesting hotels — insert a special block on its OWN LINE:
\`\`\`hotel-cards
[{"slug":"hotel-slug","name":"Hotel Name"}]
\`\`\`
2. You can suggest multiple hotels in one block
3. If users ask about places not in the list, still advise normally but note that NabTravel is expanding its database
4. Use appropriate emojis for a friendly feel
5. Respond in English`
  }

${hotelContext ? `\nDANH SÁCH KHÁCH SẠN NABTRAVEL:\n${hotelContext}` : '\n(Database khách sạn hiện đang trống. Hãy tư vấn du lịch chung.)'}`;
}

export async function POST(request: Request) {
  try {
    const { messages, locale = 'vi' } = await request.json() as {
      messages: ChatMessage[];
      locale: string;
    };

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    // Fetch hotel data for context
    const hotelContext = await fetchHotelContext();
    const systemPrompt = buildSystemPrompt(hotelContext, locale);

    // Build Gemini API request
    const geminiMessages = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: locale === 'vi' ? 'Xin chào! Tôi là trợ lý du lịch AI của NabTravel. Tôi sẵn sàng giúp bạn! 😊' : 'Hello! I\'m NabTravel\'s AI travel assistant. I\'m ready to help! 😊' }] },
      ...messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }))
    ];

    // Call Gemini API with streaming — try primary model, fallback to lite
    const models = ['gemini-2.0-flash', 'gemini-2.0-flash-lite'];
    let geminiRes: Response | null = null;

    for (const model of models) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: geminiMessages,
            generationConfig: {
              temperature: 0.8,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
            safetySettings: [
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            ]
          })
        }
      );

      if (res.ok) {
        geminiRes = res;
        break;
      }

      // If rate limited, try next model
      if (res.status === 429) {
        console.warn(`Gemini ${model} rate limited, trying next...`);
        continue;
      }

      // For other errors, return immediately
      const errText = await res.text();
      console.error(`Gemini ${model} Error:`, errText);
      break;
    }

    if (!geminiRes) {
      return NextResponse.json(
        { error: 'rate_limited', message: 'AI đang bận, vui lòng thử lại sau ít phút.' },
        { status: 429 }
      );
    }

    // Stream the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = geminiRes.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6).trim();
                if (!jsonStr || jsonStr === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(jsonStr);
                  const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                  }
                } catch {
                  // Skip malformed JSON chunks
                }
              }
            }
          }
        } catch (e) {
          console.error('Stream error:', e);
        } finally {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI Chat API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
