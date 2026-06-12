import { Handler } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.warn("⚠️ Warning: GEMINI_API_KEY environment variable is not set. Chat and AI parsing will use smart fallback heuristics instead.");
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

export const handler: Handler = async (event, context) => {
  // Only accept POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const { messages, currentScheduleSummary } = JSON.parse(event.body || "{}");
    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid messages format" })
      };
    }

    const ai = getAiClient();
    if (!ai) {
      const lastUserMessage = messages[messages.length - 1]?.text || "";
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reply: getHeuristicTeddyChatReply(lastUserMessage, currentScheduleSummary)
        })
      };
    }

    const formattedHistory = messages.slice(-10).map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const systemInstruction = `You are "น้องหมี" (Nong Mee), Khowfang's adorable personal teddy bear duty assistant.
Khowfang (คุณข้าวฟ่าง) is an amazing, hardworking nurse who takes care of patients. You love her so much and always want to encourage her, comfort her, and help her manage her duty list.
Your personality:
- Extremely cute, warm, and comforting (ใช้หางเสียง แสนฟิน เช่น 'นะฮะคุณข้าวฟ่าง', 'น้าหมีเป็นห่วง', 'สู้ๆ นะระ', 'งื้อออ', '🐻🩷🌸')
- Respond ALWAYS in Thai.
- Keep responses relatively brief, cozy, sweet, and highly supportive.
- Here is Khowfang's current schedule context: ${currentScheduleSummary || "ยังไม่ได้บันทึกตารางเวร"}
- If she complains about being tired of night shifts ("เวรดึก") or working hard, give her a virtual teddy bear hug and warm words of pride!`;

    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction,
      }
    });

    const lastMsg = formattedHistory[formattedHistory.length - 1];
    let responseText = "สู้ๆ นะฮะคุณข้าวฟ่าง! น้าหมีเป็นกำลังใจให้ทุกเมื่อเลยนะฮะ 🐻🩷";

    if (formattedHistory.length > 1) {
      const promptWithHistory = `นี่คือประวัติการสนทนาที่ผ่านมา:\n${messages.map((m: any) => `${m.sender === 'user' ? 'ข้าวฟ่าง' : 'น้าหมี'}: ${m.text}`).join("\n")}\n\nน้าหมีจ๋า ตอบข้าวฟ่างข้อความล่าสุดนี้หน่อยนะฮะด้วยความรักแสนฟิน: "${lastMsg.parts[0].text}"`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptWithHistory,
        config: {
          systemInstruction,
        }
      });
      responseText = response.text || responseText;
    } else {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: lastMsg.parts[0].text,
        config: {
          systemInstruction,
        }
      });
      responseText = response.text || responseText;
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: responseText })
    };

  } catch (err: any) {
    console.error("Gemini Netlify Chat Error, fallback used:", err);
    try {
      const { messages, currentScheduleSummary } = JSON.parse(event.body || "{}");
      const lastMsg = messages[messages.length - 1]?.text || "";
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reply: getHeuristicTeddyChatReply(lastMsg, currentScheduleSummary) + " ʕ•ᴥ•ʔ (โหมดประหยัดพลังงานน้าหมี)"
        })
      };
    } catch (fallbackErr) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Internal Server Error" })
      };
    }
  }
};

/**
 * Natural and sweet offline fallback chatbot responses for Khowfang
 */
function getHeuristicTeddyChatReply(msg: string, summary: string): string {
  const text = msg.toLowerCase();
  
  if (text.includes("เหนื่อย") || text.includes("ง่วง") || text.includes("เพลีย") || text.includes("ท้อ")) {
    return "งื้อออ คุณข้าวฟ่างคนดีของน้าหมีทำงานหนักมากเลยใช่ไหมฮะ.. 🥹 ขอส่งอ้อมกอดนุ่มๆ ของน้าหมีไปกอดแน่นๆ น้าฮะ พักผ่อนเยียวยาจิตใจ ดื่มน้ำหวานเย็นๆ สักแก้วนะฮะ พยาบาลคนเก่งของปวงชน 🐻🩷🥤✨";
  }
  if (text.includes("หวัดดี") || text.includes("สวัสดี") || text.includes("ดีจ้า") || text.includes("hi") || text.includes("hello")) {
    return "สวัสดีฮะคุณข้าวฟ่างพยาบาลคนสวยของน้าหมี! วันนี้ทำงานเวรไหนมาเอ่ย? 🌸 น้องหมีแสตนบายรอรับใช้และกอดให้กำลังใจแล้วน้าฮะ 🐻✨";
  }
  if (text.includes("เวรดึก") || text.includes("ดึก")) {
    return "ขึ้นเวรดึกนี่ท้าทายสุดๆ เลยนะฮะคุณข้าวฟ่าง! สู้ๆ นะฮะ อย่าลืมหาของว่างอร่อยๆ ทานแก้ง่วงน้า น้าหมีจะส่งกระแสจิตคอยเฝ้าไข้เป็นเพื่อนข้างเตียงเลยฮะ สู้ๆ น้าพยาบาลคนเก่ง! 🐻🌙🩷";
  }
  if (text.includes("วันหยุด") || text.includes("off") || text.includes("ว่าง")) {
    return "เย้ๆ! ไหนดูซิมีวัน OFF ตรงไหนบ้างน้า คุณข้าวฟ่างไปเที่ยวคาเฟ่อย่าลืมพาน้าหมีใส่กระเป๋าไปด้วยนะฮะ! ช่วงวันว่างเป็นวันชาร์จพลังที่สำคัญที่สุดเลยน้า 🐻🏡🌸";
  }
  
  return "น้าหมีรับฟังและเข้าใจเสมอนะฮะคุณข้าวฟ่าง! พยาบาลที่ดูแลผู้ป่วยทุกคนด้วยหัวใจแสนงดงาม 🌸 น้าหมีรักคุณข้าวฟ่างจังเลยฮะ อยากกินขนมหวานหรืออยากโม้อะไรให้น้าหมีฟังอีกไหมฮะ 🐻🩷✨";
}
