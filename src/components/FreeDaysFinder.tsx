/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { DutyDetail } from "../types";
import { formatMonthThai, getShortMonthName } from "../utils";
import { Sparkles, Compass, MoonStar, Leaf } from "lucide-react";

interface FreeDaysFinderProps {
  yearMonth: string;
  daysData: Record<string, DutyDetail>;
}

export default function FreeDaysFinder({ yearMonth, daysData }: FreeDaysFinderProps) {
  const [yearStr, monthStr] = yearMonth.split("-");
  const shortMonth = getShortMonthName(monthStr);
  const totalDays = new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate();

  // Pick out off days
  const offDays: { dayNum: number; note: string }[] = [];
  for (let i = 1; i <= totalDays; i++) {
    const dayKey = i.toString().padStart(2, "0");
    const detail = daysData[dayKey] || { dutyType: "OFF", note: "พักผ่อน" };
    if (detail.dutyType === "OFF") {
      offDays.push({ dayNum: i, note: detail.note || "พักผ่อน" });
    }
  }

  // Generate activities index based on dates
  const activities = [
    "นอนตื่นสายๆ แล้วตื่นมากินเซตบรั๊นช์แสนฟิน 🥞☕",
    "ไปถ่ายรูปชิกๆ คาเฟ่เปิดใหม่ใต้ร่มไม้แสนร่มรื่น 🌳🍰",
    "นอนดูซีรีส์สุดสนุกยาวๆ ชาร์จแบตชีวิตให้จุใจ 🍿🧸",
    "ไปจกปิ้งย่างบุฟเฟต์ฉลองความเหนื่อยล้าเวรดึก 🥩🔥",
    "ทำสปานวดอโรม่าชิลล์ๆ เยียวยาน่องพยาบาลคนเก่ง 🌸🛁",
    "จิบชานมไข่มุกหวานปกติให้สมองหลั่งเอนดอร์ฟินสิบเท่า 🧋🧁",
    "เอาหน้านวดหมอนนุ่มฟูๆ กอดตุ๊กตาหมีปุกปุยทั้งวันน้า 🐻🛌"
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border-2 border-brand-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-dashed border-brand-200">
        <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-500">
          <Compass size={20} />
        </div>
        <div>
          <h3 className="font-bold text-lg text-brand-500">หาวัน OFF ว่างๆ 🏡✨</h3>
          <p className="text-xs text-slate-500">ดึงวันหยุดทั้งหมดในตารางและแนะนำกิจกรรมสุดฟิน</p>
        </div>
      </div>

      {offDays.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-rose-50 rounded-2xl border border-dashed border-brand-200">
          <MoonStar size={36} className="text-brand-300 mb-2 animate-bounce" />
          <h4 className="font-bold text-sm text-brand-700">งืมม ยังไม่มีวันหยุดในปฏิทินเลยฮะ</h4>
          <p className="text-xs text-slate-500 mt-1">คุณข้าวฟ่างอย่าลืมใส่เวร OFF บ้างน้า น้าหมีเป็นห่วงสุขภาพคนสวยนะฮะ 🥺🐻</p>
        </div>
      ) : (
        <div className="flex-1 space-y-4">
          <p className="text-xs text-brand-600 font-bold bg-brand-50 px-3 py-2 rounded-xl border border-brand-100 line-clamp-2">
            🎉 ยินดีด้วยฮะคุณข้าวฟ่าง! เดือนนี้มีวัน OFF ทั้งหมด <span className="text-lg font-extrabold">{offDays.length}</span> วัน พร้อมปล่อยจอยปล่อยใจแล้วน้าหมีชงให้เอง!
          </p>

          <div className="grid grid-cols-1 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
            {offDays.map((day, idx) => {
              const activity = activities[day.dayNum % activities.length];
              return (
                <div
                  key={day.dayNum}
                  className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-3 flex justify-between items-start gap-4 hover:bg-emerald-50 transition-colors"
                >
                  <div className="flex gap-2.5">
                    <span className="w-9 h-9 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0">
                      {day.dayNum}
                    </span>
                    <div>
                      <h5 className="font-bold text-xs text-slate-700">
                        วัน OFF วันที่ {day.dayNum} {getShortMonthName(monthStr)}
                      </h5>
                      <span className="text-[10px] text-slate-400 font-sans italic">
                        บันทึกประจำวัน: "{day.note || "พักผ่อนสบายๆ"}"
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] bg-white border border-emerald-100 text-emerald-700 px-2 py-1 rounded-lg shrink-0 mt-0.5 max-w-[140px] truncate" title={activity}>
                    {activity}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-slate-400 text-center font-sans mt-3">
            🐻💖 "วัน OFF คือยาวิเศษในการช่วยฮีลใจคุณพยาบาลคนเก่ง"
          </p>
        </div>
      )}
    </div>
  );
}
