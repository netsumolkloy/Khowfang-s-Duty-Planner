/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, DutyDetail } from "../types";
import { MessageSquareShare, Send, RefreshCw, MessageCircleHeart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TeddyChatProps {
  yearMonth: string;
  daysData: Record<string, DutyDetail>;
}

export default function TeddyChat({ yearMonth, daysData }: TeddyChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize with sweet welcome message or localStorage save
  useEffect(() => {
    const saved = localStorage.getItem("khowfang_teddy_chats");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        initDefaultChat();
      }
    } else {
      initDefaultChat();
    }
  }, []);

  const initDefaultChat = () => {
    const defaultMsg: ChatMessage = {
      id: "welcome",
      sender: "teddy",
      text: "สวัสดีฮะคุณข้าวฟ่างพยาบาลคนเก่งของน้าหมี! 🐻🧸🩷 วันนี้เหนื่อยไหมฮะ? มีเวรอะไรทับตัวอยู่รึเปล่าเอ่ย? บ่นหรือเล่าตารางเวรท้าทายหัวใจให้น้าหมีฟังได้ทุกยามเลยน้า น้องมีอยู่เคียงข้างเสมอฮะ ✨🌸",
      timestamp: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
    };
    setMessages([defaultMsg]);
  };

  // Auto-scroll inside chat box
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || sending) return;

    const userMsgText = inputValue;
    setInputValue("");
    setSending(true);

    const userMessage: ChatMessage = {
      id: `m-user-${Date.now()}`,
      sender: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    localStorage.setItem("khowfang_teddy_chats", JSON.stringify(updatedMessages));

    // Summarize active schedules to feed Nong Mee's brain
    let countM = 0; let countA = 0; let countN = 0; let countOFF = 0; let countMission = 0;
    Object.values(daysData).forEach((detail) => {
      if (detail.dutyType === "M") countM++;
      else if (detail.dutyType === "A") countA++;
      else if (detail.dutyType === "N") countN++;
      else if (detail.dutyType === "OFF") countOFF++;
      else if (detail.dutyType === "MISSION") countMission++;
    });
    const currentScheduleSummary = `เวรเช้า: ${countM} วัน, เวรบ่าย: ${countA} วัน, เวรดึก: ${countN} วัน, วันหยุด OFF: ${countOFF} วัน, ภารกิจ: ${countMission} รายการ`;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          currentScheduleSummary
        })
      });

      if (response.ok) {
        const result = await response.json();
        const responseMessage: ChatMessage = {
          id: `m-teddy-${Date.now()}`,
          sender: "teddy",
          text: result.reply,
          timestamp: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
        };
        const finalMessages = [...updatedMessages, responseMessage];
        setMessages(finalMessages);
        localStorage.setItem("khowfang_teddy_chats", JSON.stringify(finalMessages));
      } else {
        throw new Error("Chat response failed");
      }
    } catch (err) {
      console.warn("Chat API error, fallback to mock response:", err);
      // Simulate cute fallback
      const responseMessage: ChatMessage = {
        id: `m-teddy-${Date.now()}`,
        sender: "teddy",
        text: getTeddyFallbackResponse(userMsgText, currentScheduleSummary),
        timestamp: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
      };
      const finalMessages = [...updatedMessages, responseMessage];
      setMessages(finalMessages);
      localStorage.setItem("khowfang_teddy_chats", JSON.stringify(finalMessages));
    } finally {
      setSending(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("คุณข้าวฟ่างแน่ใจใช่ไหมครับว่าต้องการล้างหน้าแชทคุยกับน้าหมีเริ่มใหม่เอ่ย? 🐻🌱")) {
      initDefaultChat();
      localStorage.removeItem("khowfang_teddy_chats");
    }
  };

  function getTeddyFallbackResponse(msg: string, summary: string): string {
    const text = msg.toLowerCase();
    if (text.includes("เหนื่อย") || text.includes("ง่วง") || text.includes("ล้า") || text.includes("เพลีย")) {
      return "งื้อออ บีบมือนะคนเก่ง คุณข้าวฟ่างเหนื่อยขนาดนี้เอาหน้ามาซุกไหล่นุ่มฟูของน้าหมีได้ทั้งวันเลยนะฮะ! ดื่มชานม พักผ่อนเอาแรง สู้ๆ น้าพยาบาลสุดพลังหัวใจของเค้า! 🐻🥛🩷✨";
    }
    if (text.includes("ดึก") || text.includes("เวรดึก")) {
      return "เวรดึกมันหนาวและง่วงสุดๆ เลยน้า น้าหมีจะคอยกวาดขนมและแชร์ความอบอุ่นเคียงข้างเวรตลอดคืนฮะ อดทนนิดหนึ่งนะระ คุณข้าวฟ่างคนเก่งของปวงชน! 🌙🐻🌸✨";
    }
    if (text.includes("ไปเที่ยว") || text.includes("หมูกระทะ") || text.includes("คาเฟ่") || text.includes("เที่ยว")) {
      return "กรี๊ดดด มีไอเดียชาร์จพลังดีเยี่ยมมากๆ เลยฮะ! ได้วันหยุดปุ๊บต้องพาตัวและหัวใจฟลูออฟไปจอยกับของอร่อยจุใจเล้ย! พาน้าหมีใส่ในเป้เกาะตูดไปด้วยน้าา 🐻🥓🍰✨";
    }
    return "น้าหมีกำลังอ่านอย่างตั้งใจนะระคุณข้าวฟ่างเจ้าใจงาม ขอบคุณที่เป็นพยาบาลที่ทุ่มเทดูแลคุณไข้ทุกคนอย่างแข็งแกร่งน้าฮะ มีความสุขอารมณ์ดีในทุกเวรนะคุณข้าวฟ่าง คิคิ 🐻🎈🌸";
  }

  return (
    <div className="bg-white rounded-3xl p-6 border-2 border-brand-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-brand-200 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-500 font-sans text-xl animate-bounce">
            🧸
          </div>
          <div>
            <h3 className="font-bold text-sm text-brand-500">คู่หูน้าหมีเพื่อนคู่เวร 🐻💬</h3>
            <p className="text-[10px] text-slate-500">คุยปรับใจ ปลอบโยน และบ่นเวรเหนื่อยได้เต็มพิกัด</p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="text-[9px] font-bold text-slate-400 hover:text-brand-500 bg-slate-50 hover:bg-brand-50 px-2 py-1 rounded-xl cursor-pointer border border-slate-200 transition-all flex items-center gap-1 shrink-0"
          title="ล้างแชทปุกลุกใหม่"
        >
          <RefreshCw size={10} /> ล้างห้องแชท
        </button>
      </div>

      {/* Message Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1 bg-brand-50/30 p-3 rounded-2xl border border-dashed border-brand-200 scrollbar-thin"
      >
        {messages.map((m) => {
          const isUser = m.sender === "user";
          return (
            <div
              key={m.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"} items-end gap-1.5`}
            >
              {!isUser && <span className="text-xl select-none leading-none pb-1 shrink-0">🐻</span>}

              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed font-sans shadow-sm border ${
                  isUser
                    ? "bg-brand-500 text-white border-brand-500 rounded-br-none"
                    : "bg-white text-slate-800 border-rose-100 rounded-bl-none"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                <span className={`block text-[8px] text-right mt-1 opacity-60 ${isUser ? "text-white" : "text-slate-400"}`}>
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {sending && (
          <div className="flex justify-start items-center gap-2 text-slate-400 text-xs">
            <span className="text-xl animate-bounce">🐻</span>
            <span className="bg-white border border-slate-100 px-3 py-1.5 rounded-full shadow-sm blink text-[10px]">
              น้าหมีกุมขมับคิดตำราฟินตอบคุณข้าวฟ่าง...
            </span>
          </div>
        )}
      </div>

      {/* Input Submit */}
      <form onSubmit={handleSendMessage} className="flex gap-1.5 shrink-0 pt-1">
        <input
          type="text"
          className="flex-1 bg-slate-50 focus:bg-white text-slate-800 font-sans border border-slate-200 focus:border-brand-400 focus:ring-1 focus:ring-brand-400 rounded-2xl px-4 py-3 text-xs outline-none transition-all"
          maxLength={150}
          placeholder="เวรคืนนี้ดึกมากเลยน้าหมี... / แนะนำคาเฟ่ทีจ้า"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !inputValue.trim()}
          className="w-10 h-10 bg-brand-500 hover:bg-brand-600 active:scale-95 disabled:opacity-40 disabled:scale-100 text-white rounded-2xl flex items-center justify-center cursor-pointer transition-all shadow-md shrink-0"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
