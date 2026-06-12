/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DutyType = 'M' | 'A' | 'N' | 'OFF' | 'MISSION';

export interface DutyDetail {
  dutyType: DutyType;
  dutyType2?: DutyType | null; // Optional secondary duty for double shifts
  note: string; // Additional details for both normal duties and missions
}

export interface DaySchedule {
  dateStr: string; // YYYY-MM-DD
  dutyType: DutyType;
  note: string;
}

export interface MonthlySchedule {
  monthKey: string; // YYYY-MM (e.g., "2026-07")
  days: Record<string, DutyDetail>; // day key "DD" (e.g., "01", "02") -> DutyDetail
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'teddy';
  text: string;
  timestamp: string;
}
