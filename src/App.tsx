/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { DutyType, DutyDetail } from "./types";
import { formatMonthThai, THAI_MONTHS, DUTY_INFO } from "./utils";
import CalendarGrid from "./components/CalendarGrid";
import ScheduleTable from "./components/ScheduleTable";
import DutySummary from "./components/DutySummary";
import FreeDaysFinder from "./components/FreeDaysFinder";
import MagicImport from "./components/MagicImport";
import TeddyChat from "./components/TeddyChat";
import { 
  Sparkles, 
  Calendar, 
  Heart, 
  Layers, 
  MessageSquare, 
  User, 
  Wand2, 
  Compass, 
  Clock, 
  HelpCircle,
  TrendingUp,
  PartyPopper
} from "lucide-react";
import { motion } from "motion/react";

export default function App() {
  // Let's default to July 2026 as per their Example Inputs ("1 ก.ค."), but also let them choose current or others
  const [yearMonth, setYearMonth] = useState("2026-07");
  const [daysData, setDaysData] = useState<Record<string, DutyDetail>>({});
  const [activeBrush, setActiveBrush] = useState<DutyType | null>(null);
  
  // Tab indicator for the right panel actions representation
  // 'table' | 'off-day' | 'magic' | 'chat'
  const [activeTab, setActiveTab] = useState<"table" | "off-day" | "magic" | "chat">("table");

  // Load schedule keys for the specified month from Local Storage
  useEffect(() => {
    const storageKey = `khowfang_schedule_${yearMonth}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setDaysData(JSON.parse(saved));
      } catch (e) {
        initDefaultWorkMonth();
      }
    } else {
      initDefaultWorkMonth();
    }
  }, [yearMonth]);

  // Set standard starting templates to make looking around fun
  const initDefaultWorkMonth = () => {
    const defaultData: Record<string, DutyDetail> = {
      "01": { dutyType: "M", note: "เวรเช้าตรู่" },
      "02": { dutyType: "M", note: "เวรเช้าตรู่" },
      "03": { dutyType: "N", note: "เวรดึกท้าทาย" },
      "04": { dutyType: "OFF", note: "พักผ่อนชาร์จพลังเตะขา" },
      "05": { dutyType: "MISSION", note: "ประชุมหลักสูตรตึก" },
      "10": { dutyType: "A", note: "เวรบ่ายรพ." },
      "11": { dutyType: "A", note: "เวรบ่ายรพ." },
      "12": { dutyType: "OFF", note: "ไปคาเฟ่ชานมคิ้วท์ๆ" },
    };
    setDaysData(defaultData);
    saveToStorage(yearMonth, defaultData);
  };

  const saveToStorage = (ym: string, data: Record<string, DutyDetail>) => {
    const storageKey = `khowfang_schedule_${ym}`;
    localStorage.setItem(storageKey, JSON.stringify(data));
  };

  const handleUpdateDay = (dayKey: string, detail: DutyDetail) => {
    const updated = {
      ...daysData,
      [dayKey]: detail
    };
    setDaysData(updated);
    saveToStorage(yearMonth, updated);
  };

  const handleClearMonth = () => {
    const empty: Record<string, DutyDetail> = {};
    setDaysData(empty);
    saveToStorage(yearMonth, empty);
  };

  // Import whole structured lists from MagicImport component
  const handleImportSchedules = (parsed: { day: number; dutyType: DutyType; note: string }[]) => {
    const updated = { ...daysData };
    parsed.forEach((item) => {
      const dayKey = item.day.toString().padStart(2, "0");
      updated[dayKey] = {
        dutyType: item.dutyType,
        note: item.note
      };
    });
    setDaysData(updated);
    saveToStorage(yearMonth, updated);
  };

  // Commands Bar click coordinators:
  // "เพิ่มเวร", "แก้ไขเวร", "ตารางเดือนนี้", "สรุปเวร", "หาวัน OFF", "เพิ่มภารกิจ"
  const handleCommandAction = (cmd: string) => {
    if (cmd === "เพิ่มเวร") {
      setActiveTab("magic");
      setActiveBrush(null);
      scrollToSection("right-panel-workspace");
    } else if (cmd === "แก้ไขเวร") {
      setActiveBrush(null); // resets brush to standard select/edit cursor mode
      scrollToSection("calendar-section");
      // Highlights grid to show interactive clicks
      const cell = document.getElementById("calendar-cell-1");
      cell?.classList.add("ring-2", "ring-brand-500", "scale-105");
      setTimeout(() => {
        cell?.classList.remove("ring-2", "ring-brand-500", "scale-105");
      }, 1500);
    } else if (cmd === "ตารางเดือนนี้") {
      setActiveTab("table");
      scrollToSection("right-panel-workspace");
    } else if (cmd === "สรุปเวร") {
      scrollToSection("summary-section");
    } else if (cmd === "หาวัน OFF") {
      setActiveTab("off-day");
      scrollToSection("right-panel-workspace");
    } else if (cmd === "เพิ่มภารกิจ") {
      setActiveBrush("MISSION");
      scrollToSection("calendar-section");
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const [y, m] = yearMonth.split("-").map(Number);
    let newY = y;
    let newM = m;
    
    if (direction === 'prev') {
      newM = m - 1;
      if (newM === 0) {
        newM = 12;
        newY = y - 1;
      }
    } else {
      newM = m + 1;
      if (newM === 13) {
        newM = 1;
        newY = y + 1;
      }
    }
    
    const newYm = `${newY}-${newM.toString().padStart(2, "0")}`;
    setYearMonth(newYm);
  };

  // Local Time check for Header clocks
  const currentThaiDate = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const thaiFormattedNow = currentThaiDate.toLocaleDateString('th-TH', options);

  return (
    <div className="min-h-screen pb-12 relative overflow-x-hidden selection:bg-brand-200 selection:text-brand-700 font-sans">
      
      {/* Floating Sparkles decorative */}
      <div className="absolute top-24 left-12 text-pink-400 select-none opacity-40 animate-teddy-float pointer-events-none"><Sparkles size={24} /></div>
      <div className="absolute top-40 right-16 text-rose-300 select-none opacity-40 animate-pulse-subtle pointer-events-none"><Sparkles size={20} /></div>

      <div className="w-full">
        
        {/* ================= HEADER BRANDING ================= */}
        <header className="bg-white border-b-4 border-brand-300 p-6 flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <motion.div 
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 bg-brand-200 rounded-full flex items-center justify-center text-3xl border-2 border-brand-400 select-none cursor-pointer"
            >
              🐻
            </motion.div>
            <div>
              <h1 className="text-brand-500 text-2xl sm:text-3xl font-bold tracking-tight">Khowfang's Duty Planner 🌸</h1>
              <p className="text-brand-400 font-medium text-sm">ผู้ช่วยจัดตารางเวรและการทำงานพยาบาลแสนรักของคุณข้าวฟ่าง 🧸✨</p>
            </div>
          </div>

          <div className="bg-brand-100 px-4 py-2 rounded-full border-2 border-brand-300 flex items-center gap-3 shrink-0 shadow-sm">
            <button
              onClick={() => handleMonthChange('prev')}
              className="w-8 h-8 rounded-full hover:bg-brand-200 text-brand-500 font-bold transition-colors flex items-center justify-center cursor-pointer"
              title="เดือนที่แล้ว"
            >
              ◀
            </button>
            <span className="text-brand-500 font-bold text-base sm:text-lg select-none">
              {formatMonthThai(yearMonth)}
            </span>
            <button
              onClick={() => handleMonthChange('next')}
              className="w-8 h-8 rounded-full hover:bg-brand-200 text-brand-500 font-bold transition-colors flex items-center justify-center cursor-pointer"
              title="เดือนถัดไป"
            >
              ▶
            </button>
            <div className="text-brand-400 text-xl leading-none">🗓️</div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-brand-400 font-bold bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-brand-200 shadow-sm inline-flex items-center gap-1.5 mb-6">
            <Clock size={12} className="text-brand-400" />
            <span>วันนี้: {thaiFormattedNow}</span>
          </p>

          {/* ================= TODAY'S SCHEDULE BANNER ================= */}
          {(() => {
            const today = new Date();
            const realYear = today.getFullYear();
            const realMonth = (today.getMonth() + 1).toString().padStart(2, "0");
            const realDay = today.getDate();
            
            const [viewY, viewM] = yearMonth.split("-");
            // Highlight of today's day sequence
            const targetDayNum = (realYear.toString() === viewY && realMonth === viewM) 
              ? realDay 
              : Math.min(realDay, new Date(parseInt(viewY), parseInt(viewM), 0).getDate());
            
            const targetDayKey = targetDayNum.toString().padStart(2, "0");
            const targetDetail = daysData[targetDayKey] || { dutyType: "OFF" as const, note: "พักผ่อนสบายๆ" };
            
            const primaryInfo = DUTY_INFO[targetDetail.dutyType];
            const secondaryInfo = targetDetail.dutyType2 ? DUTY_INFO[targetDetail.dutyType2] : null;
            
            const mObj = THAI_MONTHS.find(m => m.val === viewM);
            const shortMonth = mObj ? mObj.short : "ก.ค.";
            const targetDateStr = `${targetDayNum} ${shortMonth}`;

            // Cute message for the day
            let statusMessage = "พักผ่อนสบายๆ ชาร์จพลังเต็มที่นะฮะคุณข้าวฟ่าง 🏡🌸";
            if (targetDetail.dutyType === "M") statusMessage = "อรุณสวัสดิ์นะฮะ สู้ๆ กับเวรเช้าวันนี้! ☀️✨";
            if (targetDetail.dutyType === "A") statusMessage = "ส่งกำลังใจเวรรอบบ่ายน้า ดื่มน้ำเยอะๆ น้าฮะ 🌤️💖";
            if (targetDetail.dutyType === "N") statusMessage = "เวรดึกคืนนี้ ลุยเลยคนเก่ง แอบงีบเอาแรงเยอะๆ น้า 🌙💤";
            if (targetDetail.dutyType === "MISSION") statusMessage = `มีภารกิจ: ${targetDetail.note || "สู้ๆ นะฮะ"}`;

            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-brand-50 rounded-3xl p-5 border-2 border-brand-300 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden"
              >
                {/* Visual highlights decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-200/20 rounded-full -mr-12 -mt-12 pointer-events-none" />
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-brand-400 rounded-2xl flex flex-col justify-center items-center text-white shrink-0 shadow-sm font-bold">
                    <span className="text-[10px] leading-none uppercase tracking-wider opacity-85">วันที่</span>
                    <span className="text-xl leading-none mt-1 font-mono">{targetDayNum}</span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-brand-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                        🐻 ตารางเวรวันนี้ของคุณข้าวฟ่าง
                      </span>
                      {realYear.toString() === viewY && realMonth === viewM && (
                        <span className="text-[10px] text-brand-600 font-bold bg-brand-200/50 px-2 py-0.5 rounded-full">
                          (วันนี้)
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-slate-700 font-extrabold text-sm">
                        พิกัดตาราง {targetDayNum} {mObj?.name}:
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold border text-xs ${primaryInfo.badgeClass}`}>
                        <span>{primaryInfo.emoji}</span>
                        <span>{targetDetail.dutyType === "MISSION" ? "ภารกิจ" : primaryInfo.label.split(" (")[0]}</span>
                      </span>

                      {secondaryInfo && (
                        <>
                          <span className="text-slate-400 font-bold">+</span>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold border text-xs ${secondaryInfo.badgeClass}`}>
                            <span>{secondaryInfo.emoji}</span>
                            <span>{targetDetail.dutyType2 === "MISSION" ? "ภารกิจ" : secondaryInfo.label.split(" (")[0]}</span>
                          </span>
                        </>
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-500 mt-1.5 font-medium flex items-center gap-1">
                      {targetDetail.note ? (
                        <span>📝 บันทึก: <strong className="text-slate-700 font-bold">{targetDetail.note}</strong></span>
                      ) : (
                        <span>🧁 {statusMessage}</span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const cellEl = document.getElementById(`calendar-cell-${targetDayNum}`);
                    if (cellEl) {
                      cellEl.click();
                      scrollToSection("calendar-section");
                    }
                  }}
                  className="bg-white hover:bg-brand-100 text-brand-500 border border-brand-300 hover:border-brand-400 font-bold text-xs px-4 py-2.5 rounded-2xl cursor-pointer transition-all shrink-0 hover:shadow-xs flex items-center gap-1"
                >
                  <span>✎</span> ช็อตคัตแก้ไขเวรวันนี้
                </button>
              </motion.div>
            );
          })()}

          {/* ================= COMMANDS RIBBON BASKET ================= */}
          <section className="mb-8" id="commands-section">
            <div className="bg-white rounded-3xl p-5 border-2 border-brand-200 shadow-sm">
              <h4 className="text-brand-400 font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-1">
                <span>🎀</span> Commands
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { label: "เพิ่มเวร", color: "bg-brand-200 hover:bg-brand-300 text-brand-500" },
                  { label: "แก้ไขเวร", color: "bg-brand-200 hover:bg-brand-300 text-brand-500" },
                  { label: "ตารางเดือนนี้", color: "bg-brand-200 hover:bg-brand-300 text-brand-500" },
                  { label: "สรุปเวร", color: "bg-brand-200 hover:bg-brand-300 text-brand-500" },
                  { label: "หาวัน OFF", color: "bg-emerald-100 hover:bg-emerald-200 text-emerald-700" },
                  { label: "เพิ่มภารกิจ", color: "bg-sky-100 hover:bg-sky-200 text-sky-700" }
                ].map((cmd) => (
                  <button
                    key={cmd.label}
                    onClick={() => handleCommandAction(cmd.label)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors active:scale-95 shadow-sm hover:shadow cursor-pointer ${cmd.color}`}
                  >
                    {cmd.label === "เพิ่มเวร" && "+ "}
                    {cmd.label === "แก้ไขเวร" && "✎ "}
                    {cmd.label === "ตารางเดือนนี้" && "📅 "}
                    {cmd.label === "สรุปเวร" && "📄 "}
                    {cmd.label === "หาวัน OFF" && "🔍 "}
                    {cmd.label === "เพิ่มภารกิจ" && "📌 "}
                    {cmd.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ================= MAIN CONTENT GRID LAYOUT ================= */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SIDE WORKSPACE: CALENDAR GRID  (7/12 cols) */}
          <div className="lg:col-span-7 space-y-6" id="calendar-section">
            <CalendarGrid
              yearMonth={yearMonth}
              daysData={daysData}
              onUpdateDay={handleUpdateDay}
              activeBrush={activeBrush}
              setActiveBrush={setActiveBrush}
            />

            <div id="summary-section">
              <DutySummary
                yearMonth={yearMonth}
                daysData={daysData}
              />
            </div>
          </div>

          {/* RIGHT SIDE WORKSPACE: ACTIONS WORKSPACE BASKET (5/12 cols) */}
          <div className="lg:col-span-5 space-y-6" id="right-panel-workspace">
            
            {/* Tab selection ribbon for custom workspace action panels */}
            <div className="bg-white/80 p-1.5 rounded-2xl border-2 border-brand-100 flex gap-1">
              {[
                { id: "table", label: "รายการรายวัน", icon: <Layers size={14} /> },
                { id: "off-day", label: "หาวัน OFF", icon: <Compass size={14} /> },
                { id: "magic", label: "นำเข้าด่วน", icon: <Wand2 size={14} /> },
                { id: "chat", label: "คุยกับน้องหมี", icon: <MessageSquare size={14} /> },
              ].map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? "bg-brand-500 text-white shadow-sm scale-102"
                        : "text-slate-500 hover:text-brand-600 hover:bg-white"
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Render selected workspace module */}
            <div className="transition-all duration-300">
              {activeTab === "table" && (
                <ScheduleTable
                  yearMonth={yearMonth}
                  daysData={daysData}
                  onEditDayClick={(dayNum) => {
                    // Open the day note editor on the calendar by programmatic click
                    const cellEl = document.getElementById(`calendar-cell-${dayNum}`);
                    if (cellEl) {
                      cellEl.click();
                      scrollToSection("calendar-section");
                    }
                  }}
                  onClearAll={handleClearMonth}
                />
              )}

              {activeTab === "off-day" && (
                <FreeDaysFinder
                  yearMonth={yearMonth}
                  daysData={daysData}
                />
              )}

              {activeTab === "magic" && (
                <MagicImport
                  yearMonth={yearMonth}
                  onImportSchedules={handleImportSchedules}
                />
              )}

              {activeTab === "chat" && (
                <TeddyChat
                  yearMonth={yearMonth}
                  daysData={daysData}
                />
              )}
            </div>

          </div>

        </div>
      </div>

        {/* ================= HEARTWARMING PROFESSIONAL FOOTER ================= */}
        <footer className="mt-12 max-w-2xl mx-auto">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
            className="bg-gradient-to-r from-brand-100 via-rose-50 to-brand-100 rounded-3xl p-6 border-4 border-dashed border-brand-300 text-center relative overflow-hidden shadow-md"
            id="encouraging-footer"
          >
            {/* Corner flowers */}
            <div className="absolute top-2 left-2 text-brand-300">🌸</div>
            <div className="absolute top-2 right-2 text-brand-300">🌸</div>
            <div className="absolute bottom-2 left-2 text-brand-300">🌸</div>
            <div className="absolute bottom-2 right-2 text-brand-300">🌸</div>

            <p className="text-brand-700 font-extrabold text-sm sm:text-base tracking-wide animate-pulse-subtle">
              🐻💖 Khowfang, you're doing great!
            </p>
            <p className="text-xs text-brand-600 font-semibold mt-1">
              ขอบคุณที่ดูแลผู้ป่วยในทุกเวรนะ 🌸
            </p>
            
            <p className="text-[10px] text-zinc-400 font-sans mt-3">
              จัดทำด้วยหัวใจและความรัก 🦭 แสตนบายเคียงข้างเวรพยาบาลคุณข้าวฟ่าง 24 ชั่วโมง
            </p>
          </motion.div>
        </footer>

      </div>
    </div>
  );
}
