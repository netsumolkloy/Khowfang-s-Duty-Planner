/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { DutyDetail, DutyType } from "../types";
import { THAI_MONTHS, DUTY_INFO, getShortMonthName } from "../utils";
import { ListTodo, HelpCircle, Heart, Trash2, Edit } from "lucide-react";

interface ScheduleTableProps {
  yearMonth: string; // "YYYY-MM"
  daysData: Record<string, DutyDetail>;
  onEditDayClick: (dayNum: number) => void;
  onClearAll: () => void;
}

export default function ScheduleTable({
  yearMonth,
  daysData,
  onEditDayClick,
  onClearAll
}: ScheduleTableProps) {
  const [yearStr, monthStr] = yearMonth.split("-");
  const shortMonth = getShortMonthName(monthStr);
  const totalDays = new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate();

  const daysArray = Array.from({ length: totalDays }, (_, idx) => {
    const dayNum = idx + 1;
    const dayKey = dayNum.toString().padStart(2, "0");
    const detail = daysData[dayKey] || { dutyType: "OFF", note: "พักผ่อน" };
    return { dayNum, dayKey, detail };
  });

  return (
    <div className="bg-white rounded-3xl border-2 border-brand-200 shadow-sm overflow-hidden flex flex-col h-full max-h-[600px]">
      
      {/* Table Header Section with specific Geometric styling */}
      <div className="bg-brand-200 p-4 flex justify-between items-center shrink-0 border-b border-brand-200">
        <span className="font-bold text-brand-500 text-lg flex items-center gap-2">
          <span>🗓️</span> รายการเวรปฏิบัติงาน
        </span>
        <button
          onClick={() => {
            if (window.confirm("คุณข้าวฟ่างชัวร์ใช่ไหมฮะว่าต้องการเคลียร์ตารางเวรทั้งหมดของเดือนนี้มั้ยฮะ? 🐻🥺")) {
              onClearAll();
            }
          }}
          className="text-[10px] bg-white/90 hover:bg-white text-brand-500 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all border border-brand-300"
        >
          <Trash2 size={11} /> รีเซ็ตเดือนนี้
        </button>
      </div>

      <div className="overflow-y-auto flex-1 pr-1">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-brand-50 border-b border-brand-200 text-brand-500 font-bold sticky top-0">
              <th className="py-3 px-4 border-r border-brand-200 text-center w-24">วันที่</th>
              <th className="py-3 px-4 border-r border-brand-200 w-32">เวร</th>
              <th className="py-3 px-4">รายละเอียด</th>
              <th className="py-3 px-2 text-center w-16">แก้ไข</th>
            </tr>
          </thead>
          <tbody>
            {daysArray.map(({ dayNum, dayKey, detail }) => {
              const info = DUTY_INFO[detail.dutyType];
              return (
                <tr
                  key={dayNum}
                  className="hover:bg-brand-50/40 border-b border-brand-100 transition-colors"
                >
                  {/* Date */}
                  <td className="py-3 px-4 border-r border-brand-100 text-center font-bold text-slate-500">
                    {dayNum} {shortMonth}
                  </td>

                  {/* Duty Badge */}
                  <td className="py-3 px-4 border-r border-brand-100 font-semibold">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold border text-[11px] ${info.badgeClass}`}
                      >
                        <span className="text-xs select-none leading-none">{info.emoji}</span>
                        <span>{detail.dutyType === "MISSION" ? "ภารกิจ" : info.label.split(" ")[0]}</span>
                      </span>

                      {detail.dutyType2 && (
                        <>
                          <span className="text-xs text-brand-400 font-extrabold">+</span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold border text-[11px] ${DUTY_INFO[detail.dutyType2].badgeClass}`}
                          >
                            <span className="text-xs select-none leading-none">{DUTY_INFO[detail.dutyType2].emoji}</span>
                            <span>{detail.dutyType2 === "MISSION" ? "ภารกิจ" : DUTY_INFO[detail.dutyType2].label.split(" ")[0]}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Detail note string */}
                  <td className="py-3 px-4 text-slate-600 font-sans max-w-[200px] truncate">
                    {detail.note ? (
                      <span className="text-slate-800 font-medium whitespace-pre-wrap">
                        {detail.note}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">
                        {detail.dutyType === "OFF" ? "พักผ่อน" : "—"}
                      </span>
                    )}
                  </td>

                  {/* Edit Icon Button */}
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => onEditDayClick(dayNum)}
                      className="p-1.5 rounded-full bg-slate-50 hover:bg-brand-200 text-slate-500 hover:text-brand-600 cursor-pointer transition-colors border border-slate-200"
                      title="แก้ไขเวรนี้"
                    >
                      <Edit size={11} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
