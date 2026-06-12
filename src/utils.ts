/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DutyType, DutyDetail } from "./types";

export const THAI_MONTHS = [
  { name: "มกราคม", short: "ม.ค.", val: "01" },
  { name: "กุมภาพันธ์", short: "ก.พ.", val: "02" },
  { name: "มีนาคม", short: "มี.ค.", val: "03" },
  { name: "เมษายน", short: "เม.ย.", val: "04" },
  { name: "พฤษภาคม", short: "พ.ค.", val: "05" },
  { name: "มิถุนายน", short: "มิ.ย.", val: "06" },
  { name: "กรกฎาคม", short: "ก.ค.", val: "07" },
  { name: "สิงหาคม", short: "ส.ค.", val: "08" },
  { name: "กันยายน", short: "ก.ย.", val: "09" },
  { name: "ตุลาคม", short: "ต.ค.", val: "10" },
  { name: "พฤศจิกายน", short: "พ.ย.", val: "11" },
  { name: "ธันวาคม", short: "ธ.ค.", val: "12" }
];

export const DUTY_INFO: Record<DutyType, { label: string; emoji: string; bgClass: string; textClass: string; badgeClass: string }> = {
  M: {
    label: "เวรเช้า (M)",
    emoji: "🌅",
    bgClass: "bg-amber-50 border-amber-200 hover:bg-amber-100",
    textClass: "text-amber-800",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-300"
  },
  A: {
    label: "เวรบ่าย (A)",
    emoji: "🌤️",
    bgClass: "bg-rose-50 border-rose-200 hover:bg-rose-100",
    textClass: "text-rose-800",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-300"
  },
  N: {
    label: "เวรดึก (N)",
    emoji: "🌙",
    bgClass: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
    textClass: "text-indigo-800",
    badgeClass: "bg-indigo-100 text-indigo-800 border-indigo-300"
  },
  OFF: {
    label: "วันหยุด (OFF)",
    emoji: "🏡",
    bgClass: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
    textClass: "text-emerald-800",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300"
  },
  MISSION: {
    label: "ภารกิจ",
    emoji: "📌",
    bgClass: "bg-sky-50 border-sky-200 hover:bg-sky-100",
    textClass: "text-sky-800",
    badgeClass: "bg-sky-100 text-sky-800 border-sky-300"
  }
};

/**
 * Get days in month with day of week padding (0 = Sun, 1 = Mon ... 6 = Sat)
 */
export function getDaysForMonthView(yearMonth: string) {
  const [yearStr, monthStr] = yearMonth.split("-");
  const year = parseInt(yearStr);
  const month = parseInt(monthStr) - 1; // 0-indexed month

  const firstDayOfMonth = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Get index of the first day of the week (0 = Sunday, 1 = Monday, etc.)
  // Let's adjust to start with Monday (1 = Mon, 2 = Tue ... 0 = Sun)
  // Standard nurse schedules start with Monday!
  let startIdx = firstDayOfMonth.getDay(); 
  // Map Sun (0) to index 6, Mon(1) to index 0, Tue(2) to index 1 ... Sat(6) to index 5
  startIdx = startIdx === 0 ? 6 : startIdx - 1;

  const days: { dayNum: number; dateStr: string; pad: boolean }[] = [];

  // Padding days from previous month
  for (let i = 0; i < startIdx; i++) {
    days.push({ dayNum: 0, dateStr: "", pad: true });
  }

  // Active days of this month
  for (let i = 1; i <= totalDays; i++) {
    const dayDoubleStr = i.toString().padStart(2, "0");
    days.push({
      dayNum: i,
      dateStr: `${yearMonth}-${dayDoubleStr}`,
      pad: false
    });
  }

  return days;
}

export function formatMonthThai(yearMonth: string): string {
  const [yearStr, monthStr] = yearMonth.split("-");
  const monthObj = THAI_MONTHS.find(m => m.val === monthStr);
  const thaiYear = parseInt(yearStr) + 543;
  return `${monthObj ? monthObj.name : "กรกฎาคม"} ${thaiYear}`;
}

export function getShortMonthName(monthStr: string): string {
  const mObj = THAI_MONTHS.find(m => m.val === monthStr);
  return mObj ? mObj.short : "ก.ค.";
}

export function formatDateThai(dayNum: number, yearMonth: string): string {
  const [, monthStr] = yearMonth.split("-");
  const mObj = THAI_MONTHS.find(m => m.val === monthStr);
  const shortMonth = mObj ? mObj.short : "ก.ค.";
  return `${dayNum} ${shortMonth}`;
}

/**
 * Generate output exactly matching Khowfang's requested display markdown
 */
export function generateShareText(yearMonth: string, days: Record<string, DutyDetail>): string {
  const [yearStr, monthStr] = yearMonth.split("-");
  const mObj = THAI_MONTHS.find(m => m.val === monthStr);
  const monthLabel = mObj ? mObj.name : "กรกฎาคม";
  const thaiYear = parseInt(yearStr) + 543;
  const shortMonth = mObj ? mObj.short : "ก.ค.";

  const totalDays = new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate();

  // Construct table rows
  let tableRows = "";
  let countM = 0;
  let countA = 0;
  let countN = 0;
  let countOFF = 0;
  let countMission = 0;

  for (let i = 1; i <= totalDays; i++) {
    const dayKey = i.toString().padStart(2, "0");
    const detail = days[dayKey] || { dutyType: "OFF" as const, note: "พักผ่อน" };

    const getDutyText = (dt: DutyType) => {
      if (dt === "M") return "🌅 เช้า";
      if (dt === "A") return "🌤️ บ่าย";
      if (dt === "N") return "🌙 ดึก";
      if (dt === "OFF") return "🏡 OFF";
      return "📌 ภารกิจ";
    };

    const increment = (dt: DutyType) => {
      if (dt === "M") countM++;
      else if (dt === "A") countA++;
      else if (dt === "N") countN++;
      else if (dt === "OFF") countOFF++;
      else if (dt === "MISSION") countMission++;
    };

    increment(detail.dutyType);
    let dutyLabel = getDutyText(detail.dutyType);

    if (detail.dutyType2) {
      increment(detail.dutyType2);
      dutyLabel += " + " + getDutyText(detail.dutyType2);
    }

    const detailText = detail.note || (detail.dutyType === "OFF" ? "พักผ่อน" : "");
    tableRows += `| ${i} ${shortMonth} | ${dutyLabel.padEnd(15)} | ${detailText.padEnd(14)} |\n`;
  }

  return `# 🌸 Khowfang's Duty Planner

🩷 เดือน : ${monthLabel} ${thaiYear}

| วันที่ | เวร       | รายละเอียด     |
| ------ | --------- | -------------- |
${tableRows}
━━━━━━━━━━━━━━━

📊 Teddy Summary

🌅 เช้า ${countM} วัน

🌤️ บ่าย ${countA} วัน

🌙 ดึก ${countN} วัน

🏡 OFF ${countOFF} วัน

📌 ภารกิจ ${countMission} รายการ

━━━━━━━━━━━━━━━

🐻💖 Khowfang, you're doing great!
ขอบคุณที่ดูแลผู้ป่วยในทุกเวรนะ 🌸`;
}

/**
 * Static Helper for client-side schedule parsing in case API fails
 */
export function parseScheduleClientHeuristic(text: string, yearMonth: string) {
  const lines = text.split("\n");
  const schedules: { day: number; dutyType: DutyType; note: string }[] = [];
  
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Match numbers at start e.g., "1 ก.ค. เช้า" or "5. บ่าย" or "20 OFF"
    const dateMatch = trimmed.match(/^([0-9]+)\s*(?:ก\.?\ค\.?|ม\.?\ค\.?|ก\.?\พ\.?|มี\.?\ค\.?|เม\.?\ย\.?|พ\.?\ค\.?|มิ\.?\ย\.?|ส\.?\ค\.?|ก\.?\ย\.?|ต\.?\ค\.?|พ\.?\ย\.?|ธ\.?\ค\.?|มกราคม|กรกฎาคม|วันที่|วัน)?/i);
    if (dateMatch) {
      const dayNum = parseInt(dateMatch[1]);
      if (dayNum >= 1 && dayNum <= 31) {
        let dutyType: DutyType = "OFF";
        let note = "";

        const cleanLine = trimmed.toLowerCase();
        
        if (cleanLine.includes("เช้า") || cleanLine.match(/\b(m)\b/i)) {
          dutyType = "M";
        } else if (cleanLine.includes("บ่าย") || cleanLine.match(/\b(a)\b/i)) {
          dutyType = "A";
        } else if (cleanLine.includes("ดึก") || cleanLine.match(/\b(n)\b/i)) {
          dutyType = "N";
        } else if (cleanLine.includes("ภารกิจ") || cleanLine.includes("ประชุม") || cleanLine.includes("ธุระ") || cleanLine.includes("สัมมนา")) {
          dutyType = "MISSION";
          const match = trimmed.match(/(?:ภารกิจ|ประชุม|ธุระ|สัมมนา)\s*:?\s*(.*)/i);
          note = match ? match[1].trim() : trimmed;
        } else if (cleanLine.includes("off") || cleanLine.includes("หยุด") || cleanLine.includes("พัก")) {
          dutyType = "OFF";
          const match = trimmed.match(/(?:off|หยุด|พักผ่อน)\s*:?\s*(.*)/i);
          note = match && match[1] ? match[1].trim() : "พักผ่อน";
        } else {
          // Fallback guess based on colon or plain text
          if (trimmed.includes(":")) {
            dutyType = "MISSION";
            note = trimmed.split(":")[1].trim();
          } else {
            dutyType = "OFF";
            note = "พักผ่อน";
          }
        }

        schedules.push({
          day: dayNum,
          dutyType,
          note
        });
      }
    }
  });

  return {
    themeMessage: "น้าหมีนำเข้าเวรให้คุณข้าวฟ่างเรียบร้อยแล้วนะฮะ สู้ๆ น้าคนดี! 🐻🌸🩷",
    schedules
  };
}
