import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TIMETABLE,
  PERIODS,
  SUBJECTS,
  CLASS_INFO,
  FACULTY_ADVISERS,
  STUDENT_REPRESENTATIVES,
  CLASS_COMMITTEE_CHAIRPERSON,
  getCurrentPeriod,
  getSubjectName,
} from "@/data/timetable";
import { Calendar, Clock, MapPin, GraduationCap, Users } from "lucide-react";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];

export default function Timetable() {
  const currentPeriod = getCurrentPeriod();

  const isCurrentSlot = (day: string, periodIndex: number) => {
    if (!currentPeriod) return false;
    return currentPeriod.day === day && currentPeriod.period === periodIndex + 1;
  };

  const getCellContent = (day: string, periodIndex: number) => {
    const code = TIMETABLE[day][periodIndex];
    if (!code) return { code: "-", name: "-", isLab: false };
    
    const isLab = code.includes("/");
    const subject = isLab ? null : SUBJECTS[code];
    
    return {
      code,
      name: isLab ? "Lab Session" : subject?.name || code,
      isLab,
    };
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Class Timetable</h1>
            <p className="text-muted-foreground mt-1">
              {CLASS_INFO.department} - Semester {CLASS_INFO.semester} Section {CLASS_INFO.section}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              Room {CLASS_INFO.classRoom}
            </div>
            <Badge className="status-active">
              Academic Year {CLASS_INFO.academicYear}
            </Badge>
          </div>
        </div>

        {/* Current Class Highlight */}
        {currentPeriod && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary animate-pulse" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Currently Active</p>
                  <p className="text-lg font-semibold text-foreground">
                    Period {currentPeriod.period} - {getSubjectName(currentPeriod.subject)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timetable Grid */}
        <Card className="bg-card border-border overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Weekly Schedule</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="p-3 text-left text-sm font-semibold text-foreground border-b border-border w-20">
                      DAY
                    </th>
                    {PERIODS.map((period) => (
                      <th
                        key={period.period}
                        className="p-3 text-center text-sm font-semibold text-foreground border-b border-border"
                      >
                        <div>Period {period.period}</div>
                        <div className="text-xs text-muted-foreground font-normal">
                          {period.startTime} - {period.endTime}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day) => (
                    <tr key={day} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-3 font-semibold text-foreground border-b border-border bg-secondary/20">
                        {day}
                      </td>
                      {PERIODS.map((period, idx) => {
                        const cell = getCellContent(day, idx);
                        const isCurrent = isCurrentSlot(day, idx);
                        
                        return (
                          <td
                            key={idx}
                            className={`p-3 text-center border-b border-border transition-all ${
                              isCurrent
                                ? "bg-primary/20 border-2 border-primary"
                                : cell.isLab
                                ? "bg-purple-500/10"
                                : ""
                            }`}
                          >
                            {cell.code !== "-" ? (
                              <div className="space-y-1">
                                <div className={`font-mono text-sm font-semibold ${
                                  isCurrent ? "text-primary" : "text-foreground"
                                }`}>
                                  {cell.code}
                                </div>
                                {cell.isLab && (
                                  <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-300">
                                    LAB
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Subject Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <CardTitle>Subject Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 text-muted-foreground">Code</th>
                      <th className="text-left p-2 text-muted-foreground">Subject Name</th>
                      <th className="text-center p-2 text-muted-foreground">Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(SUBJECTS)
                      .filter(([code]) => !["LIB", "SEM", "SPORTS"].includes(code))
                      .map(([code, subject]) => (
                        <tr key={code} className="border-b border-border/50 hover:bg-secondary/20">
                          <td className="p-2 font-mono font-medium text-primary">{code}</td>
                          <td className="p-2 text-foreground">{subject.name}</td>
                          <td className="p-2 text-center text-muted-foreground">{subject.credits}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>Class Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Faculty Advisers */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Faculty Advisers</h4>
                <div className="space-y-2">
                  {FACULTY_ADVISERS.map((adviser) => (
                    <div key={adviser.name} className="flex justify-between text-sm">
                      <span className="text-foreground">{adviser.name}</span>
                      <span className="text-muted-foreground">Roll: {adviser.rollRange}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Representatives */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Student Representatives</h4>
                <div className="space-y-2">
                  {STUDENT_REPRESENTATIVES.map((rep) => (
                    <div key={rep.name} className="flex justify-between text-sm">
                      <span className="text-foreground">{rep.name}</span>
                      <span className="text-muted-foreground">Roll No: {rep.rollNo}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chairperson */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Class Committee Chairperson</h4>
                <p className="text-sm text-primary">{CLASS_COMMITTEE_CHAIRPERSON}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
