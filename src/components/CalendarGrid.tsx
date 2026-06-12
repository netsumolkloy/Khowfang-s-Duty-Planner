/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { DutyType, DutyDetail } from "../types";
import { getDaysForMonthView, DUTY_INFO, formatMonthThai } from "../utils";
import { Paintbrush, CalendarDays, HelpCircle, Heart, Star, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CalendarGridProps {
  yearMonth: string; // "YYYY-MM"
  daysData: Record<string, DutyDetail>;
  onUpdateDay: (dayKey: string, detail: DutyDetail) => void;
  activeBrush: DutyType | null;
  setActiveBrush: (duty: DutyType | null) => void;
}

export default function CalendarGrid({
  yearMonth,
  daysData,
  onUpdateDay,
  activeBrush,
  setActiveBrush
}: CalendarGridProps) {
  const days = getDaysForMonthView(yearMonth);
  const [selectedDay, setSelectedDay] = useState<{ dayNum: number; dayKey: string; detail: DutyDetail } | null>(null);
  const [editingNote, setEditingNote] = useState("");

  const handleCellClick = (dayNum: number, dayKey: string, currentDetail: DutyDetail) => {
    if (activeBrush) {
      // Paint mode: paint instantly
      onUpdateDay(dayKey, {
        dutyType: activeBrush,
        note: activeBrush === "OFF" ? "พักผ่อน" : currentDetail.note
      });
    } else {
      // Edit mode: open modal
      setSelectedDay({ dayNum, dayKey, detail: currentDetail });
      setEditingNote(currentDetail.note);
    }
  };

  const handleSaveDetail = () => {
    if (selectedDay) {
      onUpdateDay(selectedDay.dayKey, {
        ...selectedDay.detail,
        note: editingNote
      });
      setSelectedDay(null);
    }
  };

  const weekdays = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."];

  return (
    <div className="bg-white rounded-3xl p-6 border-2 border-brand-200 shadow-sm relative overflow-hidden">
      {/* Decorative stars / bear ears */}
      <div className="absolute top-2 left-6 text-brand-300 pointer-events-none opacity-50"><Star size={20} className="fill-brand-200 animate-spin" style={{ animationDuration: '6s' }} /></div>
      <div className="absolute top-2 right-6 text-brand-300 pointer-events-none opacity-50"><Star size={16} className="fill-brand-200 animate-bounce" /></div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-dashed border-brand-200">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-500">
            <CalendarDays size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-brand-500 flex items-center gap-1">
              ตารางเดือนนี้ 🐻🌸
            </h3>
            <p className="text-xs text-slate-500">คลิกขุ่นแม่หมีบนปฏิทินเพื่อบันทึก/แก้ไขรายละเอียดเวร</p>
          </div>
        </div>

        {/* Brush Selector */}
        <div className="flex flex-wrap items-center gap-2 bg-brand-50 p-2 rounded-2xl border border-brand-100">
          <span className="text-xs font-semibold text-brand-600 flex items-center gap-1 px-2">
            <Paintbrush size={14} /> โหมดระบายเวรด่วน:
          </span>
          <div className="flex gap-1">
            {(["M", "A", "N", "OFF", "MISSION"] as DutyType[]).map((duty) => {
              const info = DUTY_INFO[duty];
              const isSelected = activeBrush === duty;
              return (
                <button
                  key={duty}
                  onClick={() => setActiveBrush(isSelected ? null : duty)}
                  className={`px-2 py-1 rounded-xl text-xs font-medium border font-sans select-none cursor-pointer transition-all flex items-center gap-1 ${
                    isSelected
                      ? "bg-brand-500 text-white shadow-md border-brand-500 scale-105"
                      : "bg-white text-slate-700 hover:bg-brand-100 border-slate-200 hover:border-brand-300"
                  }`}
                  title={`คลิกที่นี่แล้วไปจิ้มในตารางด่วนๆ เล้ย!`}
                >
                  <span>{info.emoji}</span>
                  <span>{duty === "MISSION" ? "ภารกิจ" : duty}</span>
                </button>
              );
            })}
            {activeBrush && (
              <button
                onClick={() => setActiveBrush(null)}
                className="px-2 py-1 rounded-xl text-xs font-medium bg-red-100 text-red-600 border border-red-200 hover:bg-red-200 cursor-pointer"
                title="ปิดโหมดระบายสี"
              >
                ปิด 🎨
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 text-center text-xs font-bold text-slate-500">
        {weekdays.map((w, idx) => (
          <div
            key={w}
            className={`py-2 rounded-xl bg-slate-50 ${
              idx >= 5 ? "text-brand-500 bg-brand-50" : "text-slate-600"
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Calendar Grid Cells */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {days.map((cell, idx) => {
          if (cell.pad) {
            return (
              <div
                key={`pad-${idx}`}
                className="aspect-square bg-slate-50/50 rounded-2xl opacity-30 border border-transparent"
              />
            );
          }

          const dayKey = cell.dayNum.toString().padStart(2, "0");
          const detail = daysData[dayKey] || { dutyType: "OFF", note: "พักผ่อน" };
          const info = DUTY_INFO[detail.dutyType];

          return (
            <motion.div
              key={cell.dateStr}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              onClick={() => handleCellClick(cell.dayNum, dayKey, detail)}
              className={`aspect-square p-1 relative flex flex-col justify-between rounded-2xl border-2 transition-all cursor-pointer ${info.bgClass} ${info.textClass}`}
              id={`calendar-cell-${cell.dayNum}`}
            >
              {/* Day Number */}
              <span className="absolute top-1 right-1 text-xs font-bold font-sans opacity-70">
                {cell.dayNum}
              </span>

              {/* Duty Icon and Label */}
              <div className="flex flex-col items-center justify-center h-full pt-1">
                {!detail.dutyType2 ? (
                  <>
                    <span className="text-xl md:text-2xl mt-1 select-none">{info.emoji}</span>
                    <span className="text-[10px] md:text-xs font-bold tracking-tight mt-1">
                      {detail.dutyType === "MISSION" ? "ภารกิจ" : info.label.split(" ")[0]}
                    </span>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full mt-0.5">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-lg md:text-xl select-none" title={info.label}>{info.emoji}</span>
                      <span className="text-[9px] text-slate-400 font-bold select-none">+</span>
                      <span className="text-lg md:text-xl select-none" title={DUTY_INFO[detail.dutyType2].label}>{DUTY_INFO[detail.dutyType2].emoji}</span>
                    </div>
                    <span className="text-[9px] md:text-[10px] font-extrabold tracking-tight mt-1 text-slate-600 leading-none">
                      {detail.dutyType === "MISSION" ? "ภารกิจ" : info.label.split(" ")[0]}+{detail.dutyType2 === "MISSION" ? "ภารกิจ" : DUTY_INFO[detail.dutyType2].label.split(" ")[0]}
                    </span>
                  </div>
                )}
              </div>

              {/* Note Dot Indicator */}
              {detail.note && (
                <div className="absolute bottom-1 left-1 flex items-center gap-1 max-w-[90%]">
                  <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                  <span className="text-[8px] truncate max-w-[40px] md:max-w-[60px] opacity-70">
                    {detail.note}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Detail Modal / Edit Card */}
      <AnimatePresence>
        {selectedDay && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border-4 border-brand-200 shadow-2xl relative"
            >
              {/* Teddy Bear ears on top */}
              <div className="absolute -top-10 left-8 w-14 h-14 bg-brand-200 rounded-full border-4 border-white -z-10" />
              <div className="absolute -top-10 right-8 w-14 h-14 bg-brand-200 rounded-full border-4 border-white -z-10" />

              <h4 className="text-center font-bold text-lg text-brand-700 mb-4 flex items-center justify-center gap-2">
                <span>🐻</span> บันทึกรายละเอียดเวร วันที่ {selectedDay.dayNum} {formatMonthThai(yearMonth).split(" ")[0]} <span>🌸</span>
              </h4>

              {/* Duty Picker inside Modal */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">เลือกประเภทเวร (หลัก)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["M", "A", "N", "OFF", "MISSION"] as DutyType[]).map((duty) => {
                      const info = DUTY_INFO[duty];
                      const isSelected = selectedDay.detail.dutyType === duty;
                      return (
                        <button
                          key={duty}
                          type="button"
                          onClick={() => {
                            setSelectedDay({
                              ...selectedDay,
                              detail: {
                                ...selectedDay.detail,
                                dutyType: duty,
                                note: duty === "OFF" && !selectedDay.detail.note ? "พักผ่อน" : selectedDay.detail.note
                              }
                            });
                          }}
                          className={`p-2 rounded-2xl border-2 font-medium text-xs flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? `${info.badgeClass} border-brand-500 scale-[1.02] shadow-sm`
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <span className="text-lg">{info.emoji}</span>
                          <span>{info.label.split(" (")[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Secondary Duty Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">เวรที่ 2 ในวันเดียวกัน (เพิ่มเติม - ไม่บังคับ) 🐻🌸</label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDay({
                          ...selectedDay,
                          detail: {
                            ...selectedDay.detail,
                            dutyType2: null
                          }
                        });
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                        !selectedDay.detail.dutyType2
                          ? "bg-brand-500 text-white border-brand-500"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      ไม่มี (เวรเดียว)
                    </button>
                    {(["M", "A", "N", "OFF", "MISSION"] as DutyType[]).map((duty) => {
                      const info = DUTY_INFO[duty];
                      const isSelected = selectedDay.detail.dutyType2 === duty;
                      return (
                        <button
                          key={`duty2-modal-${duty}`}
                          type="button"
                          onClick={() => {
                            setSelectedDay({
                              ...selectedDay,
                              detail: {
                                ...selectedDay.detail,
                                dutyType2: duty
                              }
                            });
                          }}
                          className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? `${info.badgeClass} border-brand-500 scale-102`
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <span>{info.emoji}</span>
                          <span>{duty === "MISSION" ? "ภารกิจ" : duty}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Detail text input */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">รายละเอียดเพิ่มเติม / บันทึกเวร</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-800 font-sans border border-slate-200 focus:border-brand-400 focus:ring-1 focus:ring-brand-400 rounded-2xl px-4 py-3 text-xs outline-none transition-all pr-10"
                      placeholder={selectedDay.detail.dutyType === "OFF" ? "พักเตะขา, ไปคาเฟ่..." : "เช่น ประชุมตึก, เฝ้าไข้พิเศษ, สลับเวรกับเปิ้ล..."}
                      value={editingNote}
                      onChange={(e) => setEditingNote(e.target.value)}
                    />
                    <Edit3 size={16} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Confirm actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl text-xs transition-all cursor-pointer"
                  >
                    ยกเลิก ʕ·ᴥ·ʔ
                  </button>
                  <button
                    onClick={handleSaveDetail}
                    className="flex-1 py-3 bg-gradient-to-r from-brand-400 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white font-bold rounded-2xl text-xs transition-all shadow-md cursor-pointer"
                  >
                    บันทึกเวร 💖
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
