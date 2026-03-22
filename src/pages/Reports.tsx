import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Calendar,
  Mail,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const reports = [
  {
    id: 1,
    title: "Weekly Attendance Report",
    date: "2026-01-27",
    type: "attendance",
    status: "ready",
    emails: 3,
  },
  {
    id: 2,
    title: "Absentee Notification - IT22201",
    date: "2026-01-27",
    type: "absentee",
    status: "sent",
    emails: 5,
  },
  {
    id: 3,
    title: "Low Attendance Alert",
    date: "2026-01-26",
    type: "alert",
    status: "sent",
    emails: 3,
  },
  {
    id: 4,
    title: "Daily Summary - Monday",
    date: "2026-01-27",
    type: "summary",
    status: "ready",
    emails: 0,
  },
  {
    id: 5,
    title: "Absentee Notification - MA22251",
    date: "2026-01-26",
    type: "absentee",
    status: "sent",
    emails: 8,
  },
];

const absenteeHistory = [
  {
    date: "2026-01-27",
    subject: "IT22201",
    time: "08:30 - 09:20",
    absentees: ["Kumar S", "Arun K", "Deepa R"],
    emailSent: true,
  },
  {
    date: "2026-01-27",
    subject: "MA22251",
    time: "09:20 - 10:10",
    absentees: ["Arun K", "Priya N"],
    emailSent: true,
  },
  {
    date: "2026-01-26",
    subject: "HS22252",
    time: "08:30 - 09:20",
    absentees: ["Kumar S", "Arun K", "Deepa R", "Vijay M"],
    emailSent: true,
  },
];

// Function to generate a simple PDF as base64
const generateFakeReportPDF = (reportTitle: string): string => {
  // This creates a simple PDF-like structure
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
<< /Length 200 >>
stream
BT
/F1 24 Tf
50 700 Td
(Smart Campus Attendance Report) Tj
0 -40 Td
/F1 14 Tf
(${reportTitle}) Tj
0 -30 Td
(Generated: ${new Date().toLocaleString()}) Tj
0 -30 Td
(Subject: IT22201 - Data Structures) Tj
0 -30 Td
(Total Students: 60) Tj
0 -30 Td
(Present: 55) Tj
0 -30 Td
(Absent: 5) Tj
0 -30 Td
(Attendance Rate: 91.67%) Tj
0 -50 Td
(Absentees:) Tj
0 -25 Td
(1. Rishe H - Roll No: 85) Tj
0 -20 Td
(2. Shivvani T - Roll No: 103) Tj
0 -20 Td
(3. Srivatsan S - Roll No: 93) Tj
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
0000000520 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
600
%%EOF
`;
  return pdfContent;
};

const downloadPDF = (filename: string, reportTitle: string) => {
  const pdfContent = generateFakeReportPDF(reportTitle);
  const blob = new Blob([pdfContent], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success(`Downloaded ${filename}`);
};

export default function Reports() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    toast.info("Generating and sending report...");

    try {
      const { data, error } = await supabase.functions.invoke('send-notification-email', {
        body: {
          type: 'absentee',
          subject: 'IT22201 - Data Structures',
          time: '12:45 PM – 1:05 PM',
          absentees: [
            { name: 'Rishe H', rollNo: '85' },
            { name: 'Shivvani T', rollNo: '103' },
            { name: 'Srivatsan S', rollNo: '93' },
          ],
          bunkingStudent: {
            name: 'Modhini V',
            time: '12:45 PM – 1:05 PM',
            duration: '20 minutes'
          }
        }
      });

      if (error) throw error;
      
      toast.success("✅ Email sent successfully to pilotpranav2007@gmail.com");
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error("Failed to send email. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports & Notifications</h1>
            <p className="text-muted-foreground mt-1">
              View attendance reports and email notification history
            </p>
          </div>
          <Button 
            className="gap-2 bg-primary hover:bg-primary/90"
            onClick={handleGenerateReport}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {isGenerating ? "Sending..." : "Generate Report"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generated Reports */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Generated Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        report.type === "alert"
                          ? "bg-amber-500/10"
                          : report.type === "absentee"
                          ? "bg-destructive/10"
                          : "bg-primary/10"
                      }`}>
                        {report.type === "alert" ? (
                          <AlertTriangle className="h-5 w-5 text-amber-400" />
                        ) : report.type === "absentee" ? (
                          <Mail className="h-5 w-5 text-destructive" />
                        ) : (
                          <FileText className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{report.title}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(report.date).toLocaleDateString()}
                          {report.emails > 0 && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {report.emails} sent
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          report.status === "sent"
                            ? "status-active"
                            : "bg-primary/20 text-primary border border-primary/30"
                        }
                      >
                        {report.status === "sent" ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Sent
                          </span>
                        ) : (
                          "Ready"
                        )}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => downloadPDF(`${report.title.replace(/\s+/g, '_')}.pdf`, report.title)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Absentee Email History */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Absentee Email History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {absenteeHistory.map((record, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-secondary/30 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono text-primary font-medium">{record.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.date).toLocaleDateString()} • {record.time}
                        </p>
                      </div>
                      <Badge className="status-active">
                        <Mail className="h-3 w-3 mr-1" />
                        Email Sent
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Absentees ({record.absentees.length}):</p>
                      <div className="flex flex-wrap gap-2">
                        {record.absentees.map((name) => (
                          <Badge key={name} variant="secondary" className="text-xs">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 p-3 bg-secondary/20 rounded-lg">
                <strong>Note:</strong> Emails are automatically sent to pilotpranav2007@gmail.com 
                after each class ends with the list of absent students.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Email Configuration Notice */}
        <Card className="bg-card border-border border-l-4 border-l-primary">
          <CardContent className="py-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Email Automation Active</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Absentee notifications are automatically sent after each class period ends. 
                  The system uses the configured SMTP credentials to send emails securely.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
