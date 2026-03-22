import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Clock,
} from "lucide-react";
import { SUBJECTS } from "@/data/timetable";

const weeklyData = [
  { day: "Mon", attendance: 95 },
  { day: "Tue", attendance: 88 },
  { day: "Wed", attendance: 92 },
  { day: "Thu", attendance: 85 },
  { day: "Fri", attendance: 90 },
];

const subjectStats = [
  { code: "IT22201", name: "COA", avg: 94, trend: "up" },
  { code: "MA22251", name: "Applied Math II", avg: 88, trend: "down" },
  { code: "IT22202", name: "OOPS", avg: 92, trend: "up" },
  { code: "BT22101", name: "Biology", avg: 96, trend: "up" },
  { code: "HS22252", name: "Technical English", avg: 89, trend: "stable" },
  { code: "HS22251", name: "Tamil Society", avg: 91, trend: "up" },
];

const topPerformers = [
  { name: "Priya M", attendance: 98, rank: 1 },
  { name: "Shivani T", attendance: 96, rank: 2 },
  { name: "Pranav A", attendance: 94, rank: 3 },
  { name: "Raghuraman R", attendance: 92, rank: 4 },
  { name: "Arjun S", attendance: 91, rank: 5 },
];

const lowAttendance = [
  { name: "Kumar V", attendance: 68, classes: 5 },
  { name: "Arun K", attendance: 72, classes: 4 },
  { name: "Deepa R", attendance: 74, classes: 3 },
];

export default function Analytics() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive attendance insights and trends
            </p>
          </div>
          <Badge className="status-active gap-2">
            <Calendar className="h-3 w-3" />
            This Week
          </Badge>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Attendance</p>
                  <p className="text-3xl font-bold text-foreground">91.2%</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +3.2% from last week
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Classes Held</p>
                  <p className="text-3xl font-bold text-foreground">48</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">This semester</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Absences</p>
                  <p className="text-3xl font-bold text-foreground">127</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                </div>
              </div>
              <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +12 from last week
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Below 75%</p>
                  <p className="text-3xl font-bold text-foreground">3</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-amber-400" />
                </div>
              </div>
              <p className="text-xs text-amber-400 mt-2">Students at risk</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Trend */}
          <Card className="bg-card border-border lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Weekly Attendance Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-48 gap-4 px-4">
                {weeklyData.map((item) => (
                  <div key={item.day} className="flex flex-col items-center flex-1">
                    <div className="w-full relative">
                      <div
                        className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary/30"
                        style={{ height: `${item.attendance * 1.8}px` }}
                      >
                        <div
                          className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-primary/70 rounded-t-lg"
                          style={{ height: `${item.attendance * 1.8}px` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground mt-2">{item.day}</span>
                    <span className="text-sm font-medium text-foreground">{item.attendance}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Subject Performance */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Subject Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subjectStats.map((subject) => (
                  <div key={subject.code} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-mono text-primary">{subject.code}</span>
                        <span className="text-xs text-muted-foreground">{subject.avg}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            subject.avg >= 90
                              ? "bg-emerald-500"
                              : subject.avg >= 80
                              ? "bg-amber-500"
                              : "bg-destructive"
                          }`}
                          style={{ width: `${subject.avg}%` }}
                        />
                      </div>
                    </div>
                    {subject.trend === "up" && <TrendingUp className="h-4 w-4 text-emerald-400" />}
                    {subject.trend === "down" && <TrendingDown className="h-4 w-4 text-destructive" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPerformers.map((student) => (
                  <div
                    key={student.rank}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        student.rank === 1
                          ? "bg-amber-500 text-amber-950"
                          : student.rank === 2
                          ? "bg-gray-300 text-gray-800"
                          : student.rank === 3
                          ? "bg-amber-700 text-amber-100"
                          : "bg-secondary text-foreground"
                      }`}>
                        {student.rank}
                      </div>
                      <span className="font-medium text-foreground">{student.name}</span>
                    </div>
                    <Badge className="status-active">{student.attendance}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Low Attendance Alert */}
          <Card className="bg-card border-border border-l-4 border-l-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <TrendingDown className="h-5 w-5" />
                Low Attendance Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowAttendance.map((student) => (
                  <div
                    key={student.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-destructive/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center text-destructive font-semibold">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.classes} classes missed this week
                        </p>
                      </div>
                    </div>
                    <Badge className="status-bunk">{student.attendance}%</Badge>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                * Email notifications will be sent automatically after each class
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
