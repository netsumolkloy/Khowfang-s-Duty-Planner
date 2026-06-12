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
    const { text, currentYearMonth } = JSON.parse(event.body || "{}");
    if (!text) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "โปรดระบุข้อความเพื่อนำเข้าเวร" })
      };
    }

    const ai = getAiClient();
    if (!ai) {
      const result = parseScheduleHeuristic(text, currentYearMonth || "2026-07");
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result)
      };
    }

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
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedData)
    };

  } catch (err: any) {
    console.error("Gemini Netlify Parse Error, falling back to heuristic:", err);
    try {
      const { text, currentYearMonth } = JSON.parse(event.body || "{}");
      const result = parseScheduleHeuristic(text || "", currentYearMonth || "2026-07");
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result)
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
 * Heuristic parsing handler when Gemini is off
 */
function parseScheduleHeuristic(text: string, yearMonth: string) {
  const lines = text.split("\n");
  const schedules: any[] = [];
  
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const dateMatch = trimmed.match(/^([0-9]+)\s*(?:ก\.?\ค\.?|กุมภาพันธ์|กรกฎาคม|ส\.?\ค\.?|สิงหาคม|off|เช้า|บ่าย|ดึก|เวร)?/i);
    if (dateMatch) {
      const dayNum = parseInt(dateMatch[1]);
      if (dayNum >= 1 && dayNum <= 31) {
        let dutyType: string = "OFF";
        let note = "";

        const lowerText = trimmed.toLowerCase();
        if (lowerText.includes("เช้า") || lowerText.match(/\b(m)\b/i)) {
          dutyType = "M";
        } else if (lowerText.includes("บ่าย") || lowerText.match(/\b(a)\b/i)) {
          dutyType = "A";
        } else if (lowerText.includes("ดึก") || lowerText.match(/\b(n)\b/i)) {
          dutyType = "N";
        } else if (lowerText.includes("ภารกิจ") || lowerText.includes("ประชุม") || lowerText.includes("สัมมนา") || lowerText.includes("เรียน") || lowerText.includes("ธุระ")) {
          dutyType = "MISSION";
          const noteParts = trimmed.split(/ภารกิจ\s*:\s*|ประชุม\s*:\s*|:\s*/);
          if (noteParts.length > 1) {
            note = noteParts[1].trim();
          } else {
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
          if (trimmed.includes(":")) {
            dutyType = "MISSION";
            const index = trimmed.indexOf(":");
            note = trimmed.substring(index + 1).trim();
          } else {
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
