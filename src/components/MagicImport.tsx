/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { DutyType, DutyDetail } from "../types";
import { parseScheduleClientHeuristic, DUTY_INFO, getShortMonthName } from "../utils";
import { Sparkles, Clipboard, Wand2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MagicImportProps {
  yearMonth: string;
  onImportSchedules: (parsedSchedules: { day: number; dutyType: DutyType; note: string }[]) => void;
}

export default function MagicImport({ yearMonth, onImportSchedules }: MagicImportProps) {
  const [inputText, setInputText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<{ day: number; dutyType: DutyType; note: string }[]>([]);
  const [teddyMessage, setTeddyMessage] = useState("");
  const [error, setError] = useState("");

  const handlePasteExample = () => {
    const example = `1 ก.ค. เช้า
2 ก.ค. เช้า
3 ก.ค. ดึก
4 ก.ค. OFF
5 ก.ค. ภารกิจ : ประชุมหลักสูตร
7 ก.ค. บ่าย
8 ก.ค. OFF : พักผ่อนเหนื่อยล้าดึก`;
    setInputText(example);
  };

  const handleParseText = async () => {
    if (!inputText.trim()) {
      setError("โปรดก๊อปปี้ตารางเวรมาวางใส่กล่องแสนหวานก่อนน้าฮะ 🐻");
      return;
    }

    setError("");
    setParsing(true);
    setTeddyMessage("");
    setParsedPreview([]);

    try {
      const response = await fetch("/api/parse-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          currentYearMonth: yearMonth
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.schedules && Array.isArray(result.schedules)) {
          setParsedPreview(result.schedules);
          setTeddyMessage(result.themeMessage || "น้าหมีสแกนเวรเรียบร้อยแล้วฮะคุณข้าวฟ่าง! ✨");
        } else {
          fallbackLocalParsing();
        }
      } else {
        fallbackLocalParsing();
      }
    } catch (err) {
      console.warn("API parsing unavailable, using local client heuristics:", err);
      fallbackLocalParsing();
    } finally {
      setParsing(false);
    }
  };

  const fallbackLocalParsing = () => {
    const result = parseScheduleClientHeuristic(inputText, yearMonth);
    setParsedPreview(result.schedules);
    setTeddyMessage(result.themeMessage);
  };

  const handleApplySchedules = () => {
    if (parsedPreview.length === 0) return;
    onImportSchedules(parsedPreview);
    setParsedPreview([]);
    setInputText("");
    setTeddyMessage("นำขึ้นปฏิทินเรียบร้อยล้าวว! พาลุยปฏิทินให้ฟินสุดๆ เลยนะฮะคุณข้าวฟ่าง 🐻🌸💖");
  };

  const [, monthStr] = yearMonth.split("-");
  const shortMonth = getShortMonthName(monthStr);

  return (
    <div className="bg-white rounded-3xl p-6 border-2 border-brand-200 shadow-sm overflow-hidden relative flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-dashed border-brand-200 shrink-0">
        <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-500">
          <Wand2 size={20} />
        </div>
        <div>
          <h3 className="font-bold text-lg text-brand-500">นำเข้าเวยเวทย์มนตร์ 🪄✨</h3>
          <p className="text-xs text-slate-500">พิมพ์/วางเวรรายวันแบบย่อ เช่น “1 เช้า 2 ดึก 4 OFF” เพื่อนำเข้าทันใจ</p>
        </div>
      </div>

      <div className="space-y-4 flex-1 flex flex-col justify-between">
        {/* Input box */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-500">วางตารางเวรของคุณที่นี่ 👇</label>
            <button
              onClick={handlePasteExample}
              className="text-[10px] font-bold text-brand-500 bg-brand-50 hover:bg-brand-100 cursor-pointer border border-brand-200 px-2 py-1 rounded-xl transition-all"
            >
              📋 จิ้มเพื่อสุ่มตัวอย่างเวรพยาบาล
            </button>
          </div>

          <textarea
            className="w-full h-32 bg-slate-50 font-sans focus:bg-white text-slate-800 border border-slate-200 hover:border-brand-300 focus:border-brand-400 focus:ring-1 focus:ring-brand-400 rounded-2xl p-4 text-xs outline-none transition-all resize-none"
            placeholder={`พิมพ์หรือก็อปปี้คำสั่งของเวรพยาบาลมาวางได้เลยครับ เช่น:
1 ก.ค. เช้า
2 ก.ค. เช้า
3 ก.ค. ดึก
4 ก.ค. OFF
5 ก.ค. ภารกิจ : ประชุมหลักสูตร`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          {error && (
            <div className="text-[11px] text-red-600 bg-red-50 p-2 rounded-xl border border-red-200 flex items-center gap-1">
              <AlertCircle size={12} /> {error}
            </div>
          )}

          <button
            onClick={handleParseText}
            disabled={parsing}
            className="w-full py-3 bg-gradient-to-r from-brand-400 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {parsing ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="text-sm"
                >
                  🪄
                </motion.span>
                น้องหมีกำลังร่ายเวทมนตร์วิเคราะห์...
              </>
            ) : (
              <>
                <Sparkles size={14} className="animate-pulse" />
                วิเคราะห์ตารางเวรด้วย AI น้องหมี 🐻✨
              </>
            )}
          </button>
        </div>

        {/* Parsing result view */}
        <AnimatePresence>
          {teddyMessage && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-brand-100 overflow-hidden"
            >
              {/* Teddy banner message */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-start gap-2.5 mb-3">
                <span className="text-2xl select-none leading-none pt-0.5">🧸</span>
                <p className="text-[11px] text-amber-900 leading-relaxed font-sans">{teddyMessage}</p>
              </div>

              {parsedPreview.length > 0 && (
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  <span className="text-[10px] font-bold text-slate-500 block">ผลการสแกนเวรด่วนของ {shortMonth}:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {parsedPreview.map((item, idx) => {
                      const info = DUTY_INFO[item.dutyType];
                      return (
                        <div
                          key={`pre-${idx}`}
                          className="bg-slate-50/70 border border-slate-100 rounded-xl p-1.5 flex items-center gap-2 text-[10px] text-slate-700 font-sans"
                        >
                          <span className="w-5 h-5 bg-slate-200 text-slate-800 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0">
                            {item.day}
                          </span>
                          <span className="shrink-0">{info.emoji}</span>
                          <span className="truncate max-w-[80px]" title={item.note}>
                            {item.note || info.label.split(" (")[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleApplySchedules}
                    className="w-full mt-3 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 size={13} />
                    ยืนยันการนำขึ้นปฏิทินเวร 🚀
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
