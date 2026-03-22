import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarCheck, Search, Download, Filter, Loader2 } from "lucide-react";
import { SUBJECTS } from "@/data/timetable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const mockAttendance = [
  { date: "2026-01-27", subject: "IT22201", present: 55, absent: 5, percentage: 92 },
  { date: "2026-01-27", subject: "MA22251", present: 52, absent: 8, percentage: 87 },
  { date: "2026-01-27", subject: "BT22101", present: 58, absent: 2, percentage: 97 },
  { date: "2026-01-26", subject: "HS22252", present: 54, absent: 6, percentage: 90 },
  { date: "2026-01-26", subject: "IT22202", present: 56, absent: 4, percentage: 93 },
  { date: "2026-01-25", subject: "IT22211", present: 57, absent: 3, percentage: 95 },
];

const studentAttendance = [
  { rollNo: "67", name: "Pranav A", present: 45, total: 48, percentage: 94 },
  { rollNo: "72", name: "Raghuraman R", present: 44, total: 48, percentage: 92 },
  { rollNo: "101", name: "Shivani T", present: 46, total: 48, percentage: 96 },
  { rollNo: "68", name: "Kumar S", present: 40, total: 48, percentage: 83 },
  { rollNo: "69", name: "Priya M", present: 47, total: 48, percentage: 98 },
  { rollNo: "70", name: "Arun K", present: 38, total: 48, percentage: 79 },
];

// Function to generate a simple PDF content
const generateAttendancePDF = (): string => {
  const pdfContent = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 500 >>
stream
BT
/F1 24 Tf
50 750 Td
(SVCE IT - Attendance Report) Tj
0 -40 Td
/F1 12 Tf
(Subject: IT22201 - Data Structures) Tj
0 -25 Td
(Generated: ${new Date().toLocaleString()}) Tj
0 -35 Td
/F1 14 Tf
(Attendance Summary) Tj
0 -25 Td
/F1 11 Tf
(Total Students: 60) Tj
0 -20 Td
(Present: 55) Tj
0 -20 Td
(Absent: 5) Tj
0 -20 Td
(Attendance Rate: 91.67%) Tj
0 -35 Td
/F1 14 Tf
(Absentee List:) Tj
0 -25 Td
/F1 11 Tf
(1. Rishe H - Roll No: 85 - Email: rishe@svce.ac.in) Tj
0 -18 Td
(2. Shivvani T - Roll No: 103 - Email: shivvani@svce.ac.in) Tj
0 -18 Td
(3. Srivatsan S - Roll No: 93 - Email: srivatsan@svce.ac.in) Tj
0 -18 Td
(4. Kumar S - Roll No: 68 - Email: kumar@svce.ac.in) Tj
0 -18 Td
(5. Arun K - Roll No: 70 - Email: arun@svce.ac.in) Tj
0 -35 Td
/F1 10 Tf
(Note: This report has been automatically sent to pilotpranav2007@gmail.com) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000820 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
900
%%EOF
`;
  return pdfContent;
};

export default function Attendance() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);

  const handleExportReport = async () => {
    setIsExporting(true);
    toast.info("Generating and sending attendance report...");

    try {
      // Generate PDF content
      const pdfContent = generateAttendancePDF();
      const base64Content = btoa(pdfContent);

      // Call edge function to send email with PDF
      const { data, error } = await supabase.functions.invoke('send-report-email', {
        body: {
          reportType: 'absentee',
          pdfBase64: base64Content,
          pdfFilename: 'absentees_IT22201.pdf',
          subject: 'Absentee Report PDF - IT22201'
        }
      });

      if (error) throw error;

      // Also download the PDF locally
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'absentees_IT22201.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("✅ Email with PDF sent successfully to pilotpranav2007@gmail.com");
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error("Failed to send email. Check console for details.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Attendance Records</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage student attendance across all subjects
            </p>
          </div>
          <Button 
            className="gap-2 bg-primary hover:bg-primary/90"
            onClick={handleExportReport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isExporting ? "Sending..." : "Export Report"}
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by student name or roll number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-secondary border-border"
                  />
                </div>
              </div>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-[200px] bg-secondary border-border">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {Object.entries(SUBJECTS)
                    .filter(([code]) => !["LIB", "SEM", "SPORTS"].includes(code))
                    .map(([code, subject]) => (
                      <SelectItem key={code} value={code}>
                        {code} - {subject.name.slice(0, 25)}...
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subject-wise Attendance */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-primary" />
                Subject-wise Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAttendance.map((record, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                          {new Date(record.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <div>
                        <p className="font-mono text-primary font-medium">{record.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {SUBJECTS[record.subject]?.name.slice(0, 30)}...
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{record.present}/{record.present + record.absent}</p>
                      <Badge
                        className={
                          record.percentage >= 90
                            ? "status-active"
                            : record.percentage >= 75
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "status-bunk"
                        }
                      >
                        {record.percentage}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Student-wise Attendance */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-primary" />
                Student Attendance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {studentAttendance.map((student) => (
                  <div
                    key={student.rollNo}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{student.name}</p>
                        <p className="text-sm text-muted-foreground">Roll No: {student.rollNo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{student.present}/{student.total} classes</p>
                      <Badge
                        className={
                          student.percentage >= 90
                            ? "status-active"
                            : student.percentage >= 75
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "status-bunk"
                        }
                      >
                        {student.percentage}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
