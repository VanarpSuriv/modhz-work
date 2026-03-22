import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  CalendarCheck,
  AlertTriangle,
  TrendingUp,
  Clock,
  Shield,
} from "lucide-react";
import { getCurrentPeriod, getSubjectName, SUBJECTS } from "@/data/timetable";

const stats = [
  {
    title: "Total Students",
    value: "60",
    change: "+2 from last week",
    icon: Users,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Today's Attendance",
    value: "92%",
    change: "+5% from average",
    icon: CalendarCheck,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "Active Incidents",
    value: "3",
    change: "2 resolved today",
    icon: AlertTriangle,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    title: "Recognition Rate",
    value: "98.5%",
    change: "Optimal accuracy",
    icon: TrendingUp,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
];

const recentActivity = [
  { student: "Pranav A", action: "Checked in", time: "2 mins ago", status: "present" },
  { student: "Raghuraman R", action: "Checked in", time: "5 mins ago", status: "present" },
  { student: "Kumar S", action: "Late arrival", time: "10 mins ago", status: "late" },
  { student: "Priya M", action: "Checked in", time: "15 mins ago", status: "present" },
  { student: "Shivani T", action: "Checked in", time: "20 mins ago", status: "present" },
];

export default function Overview() {
  const currentPeriod = getCurrentPeriod();

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-1">
              Smart Campus Monitoring System - Real-time insights
            </p>
          </div>
          <Badge className="status-active gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            System Online
          </Badge>
        </div>

        {/* Current Session */}
        {currentPeriod && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Session</p>
                    <p className="text-lg font-semibold text-foreground">
                      Period {currentPeriod.period} - {getSubjectName(currentPeriod.subject)}
                    </p>
                  </div>
                </div>
                <Badge className="status-class">IN PROGRESS</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                        {activity.student.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{activity.student}</p>
                        <p className="text-sm text-muted-foreground">{activity.action}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={
                          activity.status === "present"
                            ? "status-active"
                            : activity.status === "late"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "status-bunk"
                        }
                      >
                        {activity.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Today's Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Attendance Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Attendance Progress</span>
                  <span className="text-foreground font-medium">55/60 students</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-campus-cyan rounded-full"
                    style={{ width: "92%" }}
                  />
                </div>
              </div>

              {/* Subject Attendance */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Subject-wise Today</h4>
                <div className="space-y-2">
                  {[
                    { subject: "IT22201", attendance: 95 },
                    { subject: "MA22251", attendance: 88 },
                    { subject: "BT22101", attendance: 92 },
                    { subject: "HS22252", attendance: 90 },
                  ].map((item) => (
                    <div key={item.subject} className="flex items-center gap-3">
                      <span className="text-xs font-mono text-primary w-16">{item.subject}</span>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary/70 rounded-full"
                          style={{ width: `${item.attendance}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-10">{item.attendance}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-3">Quick Actions</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                    Generate Report
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                    Send Alerts
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                    Export Data
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
