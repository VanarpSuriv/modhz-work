// SVCE IT Department - Semester II Section B Timetable Data

export interface Subject {
  code: string;
  name: string;
  credits: number;
  faculty: string;
  department: string;
}

export interface TimetableEntry {
  day: string;
  period: number;
  startTime: string;
  endTime: string;
  subjectCode: string | null;
  isLab?: boolean;
  labSpan?: number;
  isBreak?: boolean;
  breakType?: "lunch" | "break";
}

export const SUBJECTS: Record<string, Subject> = {
  HS22251: {
    code: "HS22251",
    name: "Science and Technology in Ancient Tamil Society",
    credits: 2,
    faculty: "Mr.E.Sivakumar",
    department: "INT",
  },
  HS22252: {
    code: "HS22252",
    name: "Technical English",
    credits: 3,
    faculty: "Ms.Raghavi Priya",
    department: "HSS",
  },
  MA22251: {
    code: "MA22251",
    name: "Applied Mathematics II",
    credits: 4,
    faculty: "Dr.D.Meiyappan",
    department: "APM",
  },
  ME22251: {
    code: "ME22251",
    name: "Technical Drawing",
    credits: 2,
    faculty: "Dr.S.Saravanan (Jr), Mr.M.Balakumar, Mr.J.Sivaramapandian",
    department: "MEC",
  },
  IT22201: {
    code: "IT22201",
    name: "Computer Organization and Architecture",
    credits: 3,
    faculty: "Mr.V.Praveen Kumar",
    department: "INT",
  },
  IT22202: {
    code: "IT22202",
    name: "OOPS using C++ and Python",
    credits: 3,
    faculty: "Ms.M.Sugacini",
    department: "INT",
  },
  BT22101: {
    code: "BT22101",
    name: "Biology for Engineers",
    credits: 3,
    faculty: "Dr.M.Naresh Kumar",
    department: "BIO",
  },
  IT22211: {
    code: "IT22211",
    name: "Hardware Assembling and Tools Laboratory",
    credits: 1.5,
    faculty: "Mr.V.Praveen Kumar",
    department: "INT",
  },
  IT22212: {
    code: "IT22212",
    name: "OOPS using C++ and Python Laboratory",
    credits: 1.5,
    faculty: "Ms.M.Sugacini",
    department: "INT",
  },
  LIB: {
    code: "LIB",
    name: "Library",
    credits: 0,
    faculty: "Dr.A. Kala",
    department: "INT",
  },
  SEM: {
    code: "SEM",
    name: "Seminar",
    credits: 0,
    faculty: "Mr. V. Praveen Kumar",
    department: "INT",
  },
  SPORTS: {
    code: "SPORTS",
    name: "Sports",
    credits: 0,
    faculty: "-",
    department: "-",
  },
};

export const PERIODS = [
  { period: 1, startTime: "08:30", endTime: "09:20" },
  { period: 2, startTime: "09:20", endTime: "10:10" },
  { period: 3, startTime: "10:10", endTime: "11:00" },
  // Lunch Break 11:00 - 11:40
  { period: 4, startTime: "11:40", endTime: "12:30" },
  { period: 5, startTime: "12:30", endTime: "13:20" },
  // Break 13:20 - 13:35
  { period: 6, startTime: "13:35", endTime: "14:25" },
  { period: 7, startTime: "14:25", endTime: "15:15" },
  { period: 8, startTime: "15:15", endTime: "16:05" },
];

export const TIMETABLE: Record<string, (string | null)[]> = {
  MON: ["MA22251", "IT22202", "MA22251", "IT22201", "BT22101", "LIB", "HS22252", null],
  TUE: ["HS22252", "BT22101", "HS22252", "HS22251", "MA22251", "ME22251", "ME22251", null],
  WED: ["IT22201", "BT22101", "IT22202", "ME22251", "ME22251", "IT22202", "SEM", null],
  THU: ["IT22211/IT22212", "IT22211/IT22212", "IT22211/IT22212", "MA22251", "BT22101", "IT22201", "HS22251", "SPORTS"],
  FRI: ["IT22202", "IT22201", "MA22251", "HS22252", "IT22211/IT22212", "IT22211/IT22212", "IT22211/IT22212", null],
};

export const CLASS_INFO = {
  academicYear: "2025 - 2026",
  semester: "II",
  section: "B",
  classRoom: "CB507",
  regulation: "2022",
  department: "Information Technology",
  effectiveFrom: "21.01.2026",
};

export const FACULTY_ADVISERS = [
  { name: "Dr. P. Sharon Femi", rollRange: "61-80" },
  { name: "Mr. E. Sivakumar", rollRange: "81-100" },
  { name: "Mr. M. Arunachalam", rollRange: "101-120" },
];

export const STUDENT_REPRESENTATIVES = [
  { name: "Mr. Pranav A", rollNo: "67" },
  { name: "Mr. R. Raghuraman", rollNo: "72" },
  { name: "Ms. T. Shivani", rollNo: "101" },
];

export const CLASS_COMMITTEE_CHAIRPERSON = "Dr. V. M. Sivagami";

// Helper function to get current period based on time
export function getCurrentPeriod(): { period: number; subject: string | null; day: string } | null {
  const now = new Date();
  const currentDay = now.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const dayKey = currentDay.slice(0, 3);
  
  if (!TIMETABLE[dayKey]) {
    return null; // Weekend or invalid day
  }
  
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  for (let i = 0; i < PERIODS.length; i++) {
    const period = PERIODS[i];
    const [startHour, startMin] = period.startTime.split(":").map(Number);
    const [endHour, endMin] = period.endTime.split(":").map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (currentTime >= startMinutes && currentTime < endMinutes) {
      return {
        period: period.period,
        subject: TIMETABLE[dayKey][i],
        day: dayKey,
      };
    }
  }
  
  return null;
}

// Helper to check if it's a break time
export function isBreakTime(): { isBreak: boolean; type: "lunch" | "break" | null } {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  // Lunch: 11:00 - 11:40
  if (currentTime >= 660 && currentTime < 700) {
    return { isBreak: true, type: "lunch" };
  }
  
  // Break: 13:20 - 13:35
  if (currentTime >= 800 && currentTime < 815) {
    return { isBreak: true, type: "break" };
  }
  
  return { isBreak: false, type: null };
}

export function getSubjectName(code: string | null): string {
  if (!code) return "-";
  if (code.includes("/")) {
    const codes = code.split("/");
    return codes.map(c => SUBJECTS[c]?.name || c).join(" / ");
  }
  return SUBJECTS[code]?.name || code;
}
