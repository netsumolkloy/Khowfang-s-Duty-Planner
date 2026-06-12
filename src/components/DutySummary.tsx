/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { DutyDetail, DutyType } from "../types";
import { DUTY_INFO, generateShareText } from "../utils";
import { Clipboard, Check, Sparkles, Trophy, Flame } from "lucide-react";
import { motion } from "motion/react";

interface DutySummaryProps {
  yearMonth: string;
  daysData: Record<string, DutyDetail>;
}

export default function DutySummary({ yearMonth, daysData }: DutySummaryProps) {
  const [copied, setCopied] = useState(false);
  const [yearStr, monthStr] = yearMonth.split("-");
  const totalDays = new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate();

  // Counts
  let countM = 0;
  let countA = 0;
  let countN = 0;
  let countOFF = 0;
  let countMission = 0;

  for (let i = 1; i <= totalDays; i++) {
    const dayKey = i.toString().padStart(2, "0");
    const detail: DutyDetail = daysData[dayKey] || { dutyType: "OFF", note: "" };
    
    // Count primary duty
    if (detail.dutyType === "M") countM++;
    else if (detail.dutyType === "A") countA++;
    else if (detail.dutyType === "N") countN++;
    else if (detail.dutyType === "OFF") countOFF++;
    else if (detail.dutyType === "MISSION") countMission++;

    // Count secondary duty if exists
    if (detail.dutyType2) {
      if (detail.dutyType2 === "M") countM++;
      else if (detail.dutyType2 === "A") countA++;
      else if (detail.dutyType2 === "N") countN++;
      else if (detail.dutyType2 === "OFF") countOFF++;
      else if (detail.dutyType2 === "MISSION") countMission++;
    }
  }

  const handleCopyMarkdown = () => {
    const text = generateShareText(yearMonth, daysData);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shiftStats = [
    { type: "M", title: "เวรเช้า", count: countM, total: totalDays, bg: "bg-brand-50", border: "border-brand-200", text: "text-brand-500", label: "🌅" },
    { type: "A", title: "เวรบ่าย", count: countA, total: totalDays, bg: "bg-brand-50", border: "border-brand-200", text: "text-brand-500", label: "🌤️" },
    { type: "N", title: "เวรดึก", count: countN, total: totalDays, bg: "bg-brand-50", border: "border-brand-200", text: "text-brand-500", label: "🌙" },
    { type: "OFF", title: "วันหยุด OFF", count: countOFF, total: totalDays, bg: "bg-[#E9F7EF]", border: "border-[#D1F2EB]", text: "text-[#27AE60]", label: "🏡" },
    { type: "MISSION", title: "ภารกิจ", count: countMission, total: totalDays, bg: "bg-[#FEF9E7]", border: "border-[#FAD7A0]", text: "text-[#D4AC0D]", label: "📌" },
  ];

  // Sweet nursing career encouragement based on total shift density!
  const totalDuties = countM + countA + countN;
  let teddyAdvice = "สู้ๆ นะคะคุณพยาบาลข้าวฟ่าง 🐻💖 น้าหมีคอยเคียงข้างเสมอน้า";
  if (totalDuties > 20) {
    teddyAdvice = "โอ้โฮฮฮ เดือนนี้คุณข้าวฟ่างขึ้นเวรแน่นปังมากถึง " + totalDuties + " เวร! ทำงานหนักมากๆ เลยนะฮะคุณพยาบาลคนเก่ง น้าหมีเป็นห่วงเป็นใยที่สุด ต้องหาเวลาแอบงีบและกินของอร่อยบ่อยๆ น้าฮะ! 🐻🍰🩷✨";
  } else if (totalDuties > 12) {
    teddyAdvice = "กําลังพอดีเลยฮะ ขึ้นเวร " + totalDuties + " วัน ได้มีเวลาดูแลคุณไข้และได้ชาร์จแบตส่วนตัวไปกินชานมไข่มุกแสนหวานปังๆ สู้ๆ นะฮะหมีข้าวฟ่างสุดคิ้วท์! 🐻🧋🌸✨ ";
  } else if (totalDuties > 0) {
    teddyAdvice = "เย้ เดือนนี้ค่อนข้างชิลล์เลยนะฮะคุณข้าวฟ่าง มีขึ้นเวรทุ่มเทแรงกาย " + totalDuties + " วันเท่านั้น พาน้องหมีไปดินเนอร์และเที่ยวคาเฟ่ให้ฟินๆ ชุ่มฉ่ำหัวใจเลยน้าา 🐻🧁🏞️";
  }

  return (
    <div className="bg-white rounded-3xl p-6 border-2 border-brand-200 shadow-sm overflow-hidden relative">
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-dashed border-brand-200">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-500">
            <Flame size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-brand-500 flex items-center gap-1">
              Teddy Summary 📊
            </h3>
            <p className="text-xs text-slate-500">สรุปจำนวนวันขึ้นเวรและวิเคราะห์ตารางน้าหมี</p>
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopyMarkdown}
          className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm border transition-all ${
            copied
              ? "bg-brand-500 text-white border-brand-500 scale-105"
              : "bg-brand-50 text-brand-500 border-brand-200 hover:bg-brand-100"
          }`}
        >
          {copied ? (
            <>
              <Check size={14} /> คัดลอกสำเร็จแล้วฮะ!
            </>
          ) : (
            <>
              <Clipboard size={14} /> คัดลอกแชร์เวร 📋
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Progress list of duties counts in Geometric Balance layout */}
        <div className="space-y-3">
          {shiftStats.map((stat) => {
            return (
              <div 
                key={stat.type} 
                className={`flex items-center justify-between p-3 ${stat.bg} rounded-2xl border ${stat.border} transition-all hover:scale-[1.01]`}
              >
                <span className="flex items-center font-medium text-slate-700 text-sm">
                  <span className="mr-2.5 text-lg select-none">{stat.label}</span>
                  <span>{stat.title}</span>
                </span>
                <span className={`font-bold ${stat.text} text-sm`}>
                  {stat.count} {stat.type === "MISSION" ? "รายการ" : "วัน"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Teddy Bear Encouragement Quote Box */}
        <div className="flex flex-col gap-3 h-full justify-between">
          <div className="bg-brand-400 rounded-3xl p-5 text-white text-center shadow-md relative overflow-hidden flex-1 flex flex-col justify-center items-center">
            {/* Background elements */}
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full pointer-events-none" />
            <motion.div
              animate={{
                y: [0, -3, 0],
                rotate: [0, 2, -2, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-4xl mb-3 select-none"
            >
              🐻🌸
            </motion.div>
            <p className="text-sm font-semibold tracking-wide italic max-w-xs leading-relaxed">
              "{teddyAdvice}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
