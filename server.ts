/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily to prevent crashing on boot if no API key is set
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

// API: Parse nursing duty from natural text using Gemini Flash
app.post("/api/parse-schedule", async (req, res) => {
  const { text, currentYearMonth } = req.body;
  if (!text) {
    return res.status(400).json({ error: "โปรดระบุข้อความเพื่อนำเข้าเวร" });
  }

  const ai = getAiClient();
  if (!ai) {
    // Fallback parsing (using regex heuristics) if no Gemini key is set
    return res.json(parseScheduleHeuristic(text, currentYearMonth || "2026-07"));
  }

  try {
    const prompt = `You are "Nong Mee", a super cute Thai teddy bear scheduling assistant for "Khowfang" (คุณข้าวฟ่าง), a hard-working nurse.
Khowfang has pasted her duty details or schedule. Your job is to extract her nursing schedule into a structured JSON array.

Context current month selection: ${currentYearMonth || "2026-07"}
User schedule text to parse:
"""
${text}
"""

Duty codes definitions:
- "M" : เวรเช้า / เช้า / เช้าตรู่ (M)
- "A" : เวรบ่าย / บ่าย / บ่ายแก่ (A)
- "N" : เวรดึก / ดึก / ค้างคืน (N)
- "OFF" : OFF / วันหยุด / พักผ่อน / off
- "MISSION" : ภารกิจ / ประชุม / สัมมนา / เทรนนิ่ง / ทำธุระ (Anything with a specific task or mission note)

Rules for parsing:
1. Identify the day of the month. If it mentions "1 July" or "1 ก.ค." or "1", extract day = 1.
2. Identify the duty type.
3. If it is "MISSION", put dutyType as "MISSION" and summarize the description in "note".
4. If it has extra notes (e.g. OFF พักผ่อน), map dutyType appropriately and put "พักผ่อน" in "note".
5. Return ONLY a JSON matching the requested schema. Do not include markdown codeblocks wrappers in your output. Just pure stringified JSON.

Format the output strictly as a JSON object of this schema:
{
  "themeMessage": "A cute 1-sentence supportive Thai blessing with teddy bear emojis (e.g. 'น้าหมีนำเข้าเวรให้คุณข้าวฟ่างเรียบร้อยแล้วนะฮะ สู้ๆ น้าคนดี! 🐻🩷🌸')",
  "schedules": [
    {
      "day": 1,
      "dutyType": "M" | "A" | "N" | "OFF" | "MISSION",
      "note": "string (optional detail like 'ประชุมหลักสูตร' or 'พักผ่อน')"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json(parsedData);
  } catch (err: any) {
    console.error("Gemini Parse Error, falling back to heuristic:", err);
    return res.json(parseScheduleHeuristic(text, currentYearMonth || "2026-07"));
  }
});

// API: Cute teddy bear chat conversation
app.post("/api/chat", async (req, res) => {
  const { messages, currentScheduleSummary } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages format" });
  }

  const ai = getAiClient();
  if (!ai) {
    // Elegant fallback simulated chat with Nong Mee
    const lastUserMessage = messages[messages.length - 1]?.text || "";
    return res.json({
      reply: getHeuristicTeddyChatReply(lastUserMessage, currentScheduleSummary)
    });
  }

  try {
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

    // We can feed the conversion history except the last message, then send the last message
    const lastMsg = formattedHistory[formattedHistory.length - 1];
    let responseText = "สู้ๆ นะฮะคุณข้าวฟ่าง! น้าหมีเป็นกำลังใจให้ทุกเมื่อเลยนะฮะ 🐻🩷";

    if (formattedHistory.length > 1) {
      // Re-initialize custom history or use standard generateContent with history
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

    return res.json({ reply: responseText });
  } catch (err: any) {
    console.error("Gemini Chat Error, fallback used:", err);
    const lastMsg = messages[messages.length - 1]?.text || "";
    return res.json({
      reply: getHeuristicTeddyChatReply(lastMsg, currentScheduleSummary) + " ʕ•ᴥ•ʔ (โหมดประหยัดพลังงานน้าหมี)"
    });
  }
});

/**
 * Robust Client-side Regex Parsing Heuristic when Gemini is unavailable
 */
function parseScheduleHeuristic(text: string, yearMonth: string) {
  const lines = text.split("\n");
  const schedules: any[] = [];
  
  // Clean text and check line by line
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Regex to match date at beginning (e.g., "1", "1 ก.ค.", "วันที่ 1")
    const dateMatch = trimmed.match(/^([0-9]+)\s*(?:ก\.?\ค\.?|กุมภาพันธ์|กรกฎาคม|ส\.?\ค\.?|สิงหาคม|off|เช้า|บ่าย|ดึก|เวร)?/i);
    if (dateMatch) {
      const dayNum = parseInt(dateMatch[1]);
      if (dayNum >= 1 && dayNum <= 31) {
        let dutyType: string = "OFF";
        let note = "";

        // Check duty keywords
        const lowerText = trimmed.toLowerCase();
        if (lowerText.includes("เช้า") || lowerText.match(/\b(m)\b/i)) {
          dutyType = "M";
        } else if (lowerText.includes("บ่าย") || lowerText.match(/\b(a)\b/i)) {
          dutyType = "A";
        } else if (lowerText.includes("ดึก") || lowerText.match(/\b(n)\b/i)) {
          dutyType = "N";
        } else if (lowerText.includes("ภารกิจ") || lowerText.includes("ประชุม") || lowerText.includes("สัมมนา") || lowerText.includes("เรียน") || lowerText.includes("ธุระ")) {
          dutyType = "MISSION";
          // Try to extract note after "ภารกิจ :" or "ภารกิจ" or "ประชุม"
          const noteParts = trimmed.split(/ภารกิจ\s*:\s*|ประชุม\s*:\s*|:\s*/);
          if (noteParts.length > 1) {
            note = noteParts[1].trim();
          } else {
            // Find keyword to capture note
            const colonIndex = trimmed.indexOf(":");
            if (colonIndex !== -1) {
              note = trimmed.substring(colonIndex + 1).trim();
            } else {
              note = trimmed;
            }
          }
        } else if (lowerText.includes("off") || lowerText.includes("หยุด") || lowerText.includes("พัก")) {
          dutyType = "OFF";
          const offParts = trimmed.split(/off\s*:\s*|หยุด\s*:\s*|:\s*/i);
          if (offParts.length > 1) {
            note = offParts[1].trim();
          } else {
            note = "พักผ่อน";
          }
        } else {
          // If no keyword found but there's a colon, classify as MISSION
          if (trimmed.includes(":")) {
            dutyType = "MISSION";
            const index = trimmed.indexOf(":");
            note = trimmed.substring(index + 1).trim();
          } else {
            // Unidentified is offline/off by default
            dutyType = "OFF";
          }
        }

        schedules.push({
          day: dayNum,
          dutyType,
          note: note || ""
        });
      }
    }
  });

  return {
    themeMessage: "น้าหมีสแกนตัวหนังสือและนำเข้าเวรให้เรียบร้อยแล้วฮะ! เก่งสุดๆ เลยคุณพยาบาลข้าวฟ่าง 🐻🌸🩷",
    schedules
  };
}

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

// Serves Vite client app
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode with Vite Middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // Fallback to SPA index.html
    app.get('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        res.sendFile(path.resolve(process.cwd(), "index.html"));
      } catch (e) {
        next(e);
      }
    });
  } else {
    // Production Mode with static file server
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🐻 Khowfang's Duty Planner server running on port ${PORT}`);
  });
}

startServer();
