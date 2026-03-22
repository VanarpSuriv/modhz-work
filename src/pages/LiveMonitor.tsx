import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  Settings,
  Video,
  PlayCircle,
  Link2,
  AlertTriangle,
  WifiOff,
  VideoOff,
  Camera,
  Activity,
  UserPlus,
  CheckCircle2 // Imported for the Present icon
} from "lucide-react";
import { getCurrentPeriod, getSubjectName } from "@/data/timetable";
import { toast } from "sonner";

interface Incident {
  id: string;
  studentName: string;
  time: string;
  type: "bunk" | "late" | "unauthorized";
}

interface AttendanceRecord {
  id: string;
  studentName: string;
  time: string;
  status: "Present";
}

// Mock data for the aggregate attendance logs
const ATTENDANCE_LOGS = [
  { subject: "CS101", attended: 54, total: 60 },
  { subject: "EE207", attended: 42, total: 45 },
  { subject: "MA110", attended: 48, total: 50 },
  { subject: "BIO150", attended: 36, total: 40 },
];

export default function LiveMonitor() {
  const [backendUrl, setBackendUrl] = useState("http://localhost:5001");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // State for tracking lists
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [liveAttendance, setLiveAttendance] = useState<AttendanceRecord[]>([]); // New state for Present students
  
  const [currentClass, setCurrentClass] = useState<{ period: number; subject: string | null; day: string } | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // State for Fast Exemption Form
  const [exemptionName, setExemptionName] = useState("");
  const [exemptionReason, setExemptionReason] = useState("");

  useEffect(() => {
    const updateCurrentClass = () => {
      const current = getCurrentPeriod();
      setCurrentClass(current);
    };
    
    updateCurrentClass();
    const interval = setInterval(updateCurrentClass, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Cleanup webcam on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    toast.info(`Connecting to ${backendUrl}...`);
    
    try {
      await fetch(`${backendUrl}/video_feed`, {
        method: 'HEAD',
        mode: 'no-cors',
      });
      
      setStreamUrl(`${backendUrl}/video_feed`);
      setIsConnected(true);
      toast.success(`Connected to backend at ${backendUrl}`);
    } catch (error) {
      console.error('Connection error:', error);
      setStreamUrl(`${backendUrl}/video_feed`);
      setIsConnected(true);
      toast.success(`Connected to backend at ${backendUrl}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setStreamUrl(null);
    toast.info("Disconnected from backend");
  };

  const handleStartWebcam = async () => {
    if (isWebcamActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsWebcamActive(false);
      toast.info("Webcam stopped");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsWebcamActive(true);
      toast.success("Webcam started successfully");
    } catch (error) {
      console.error('Webcam error:', error);
      toast.error("Failed to access webcam. Please check permissions.");
    }
  };

  const handleSimulate = () => {
    const mockStudents = ["Pranav A", "Raghuraman R", "Shivani T", "Kumar S", "Priya M", "Ananya K", "Rahul V"];
    
    // 1. Simulate a Student being Present (Recognized)
    const randomStudent = mockStudents[Math.floor(Math.random() * mockStudents.length)];
    const newAttendance: AttendanceRecord = {
      id: Date.now().toString(),
      studentName: randomStudent,
      time: new Date().toLocaleTimeString(),
      status: "Present"
    };
    
    // Add to top of list, keep only last 20
    setLiveAttendance(prev => [newAttendance, ...prev].slice(0, 20));
    
    // 2. Occasionally simulate a Bunk incident (30% chance)
    if (Math.random() > 0.7) {
      const badStudent = mockStudents[Math.floor(Math.random() * mockStudents.length)];
      const newIncident: Incident = {
        id: (Date.now() + 1).toString(),
        studentName: badStudent,
        time: new Date().toLocaleTimeString(),
        type: "bunk",
      };
      setIncidents((prev) => [newIncident, ...prev].slice(0, 10));
      toast.warning(`Bunking detected: ${newIncident.studentName}`);
    } else {
        toast.success(`Recognized: ${randomStudent}`);
    }
  };

  const handleAddAuthority = () => {
    if (!exemptionName || !exemptionReason) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success(`Exemption granted for ${exemptionName} (${exemptionReason})`);
    setExemptionName("");
    setExemptionReason("");
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Smart Campus</h1>
              <p className="text-sm text-primary font-medium tracking-wide">
                ATTENDANCE & BUNKING TRACKER
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Backend
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={`gap-2 ${isWebcamActive ? 'bg-destructive/10 border-destructive text-destructive' : ''}`}
              onClick={handleStartWebcam}
            >
              {isWebcamActive ? (
                <>
                  <VideoOff className="h-4 w-4" />
                  Stop Webcam
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4" />
                  Start Webcam
                </>
              )}
            </Button>
            <Button 
              size="sm" 
              className="gap-2 bg-primary hover:bg-primary/90"
              onClick={handleSimulate}
            >
              <PlayCircle className="h-4 w-4" />
              Simulate
            </Button>
          </div>
        </div>

        {/* Current Class Info */}
        {currentClass && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground">Currently in session:</p>
            <p className="text-lg font-semibold text-foreground">
              Period {currentClass.period} - {getSubjectName(currentClass.subject)}
            </p>
          </div>
        )}

        {/* Connection Input */}
        <div className="flex items-center gap-4">
          <Input
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            placeholder="Enter backend URL..."
            className="flex-1 bg-secondary border-border"
          />
          <Button
            onClick={isConnected ? handleDisconnect : handleConnect}
            disabled={isConnecting}
            className={`gap-2 min-w-[120px] ${
              isConnected 
                ? "bg-destructive hover:bg-destructive/90" 
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            <Link2 className="h-4 w-4" />
            {isConnecting ? "Connecting..." : isConnected ? "Disconnect" : "Connect"}
          </Button>
          <span className="text-sm text-muted-foreground">
            Connect to your Python backend for real face recognition
          </span>
        </div>

        {/* Main Content Grid (Video + Incidents) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Live Feed - Takes up 2 Columns */}
          <Card className="lg:col-span-2 bg-card border-border card-glow h-fit">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">LIVE SURVEILLANCE FEED</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="status-class gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  CLASS
                </Badge>
                <Badge className="status-bunk gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  BUNK
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="feed-container aspect-video rounded-lg flex items-center justify-center border border-border overflow-hidden bg-black/40">
              <div className="feed-container aspect-[4/3] w-full max-w-[640px] mx-auto rounded-lg flex items-center justify-center border border-border overflow-hidden bg-black/40">
                {isWebcamActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    className="h-full w-full object-contain"
                  />
                ) : isConnected && streamUrl ? (
                  <div className="relative w-full h-full">
                  <div className="relative h-full w-full flex items-center justify-center bg-black">
                    <img
                      src={streamUrl}
                      alt="Video Feed"
                      className="w-full h-full object-cover"
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <WifiOff className="h-16 w-16 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-muted-foreground">
                        SIGNAL ENCRYPTED / STANDBY
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enter backend URL or use Webcam
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Live Attendance & Incidents */}
          <div className="space-y-6">

            
            {/* 1. Live Attendance List (New) */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <CardTitle className="text-lg">LIVE ATTENDANCE</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
                  {liveAttendance.length} PRESENT
                </Badge>
              </CardHeader>
              <CardContent>
                {liveAttendance.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Waiting for faces...</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {liveAttendance.map((record) => (
                      <div
                        key={record.id}
                        className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-foreground text-sm">{record.studentName}</p>
                          <p className="text-xs text-muted-foreground">{record.time}</p>
                        </div>
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] uppercase">
                          Present
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 2. Incident List */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <CardTitle className="text-lg">INCIDENT LIST</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {incidents.length} ALERTS
                </Badge>
              </CardHeader>
              <CardContent>
                {incidents.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground font-medium text-sm">NO ACTIVE VIOLATIONS</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {incidents.map((incident) => (
                      <div
                        key={incident.id}
                        className="p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground text-sm">
                            {incident.studentName}
                          </span>
                          <Badge className="status-bunk text-[10px]">
                            {incident.type.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Detected at {incident.time}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* --- BOTTOM SECTION (Aggregate Logs + Fast Exemption) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Attendance Logs */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Activity className="h-5 w-5 text-emerald-400" />
              <CardTitle className="text-lg tracking-wide">CLASS LOGS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {ATTENDANCE_LOGS.map((log) => (
                <div key={log.subject} className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-foreground">{log.subject}</span>
                    <span className="text-foreground">{log.attended}/{log.total}</span>
                  </div>
                  {/* Custom Progress Bar */}
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 rounded-full transition-all duration-500" 
                      style={{ width: `${(log.attended / log.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Fast Exemption Form */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <UserPlus className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-lg tracking-wide">FAST EXEMPTION</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Input 
                  placeholder="Student Name" 
                  className="bg-secondary/50 border-input"
                  value={exemptionName}
                  onChange={(e) => setExemptionName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <select 
                  className="w-full h-10 px-3 rounded-md border border-input bg-secondary/50 text-sm"
                  value={exemptionReason}
                  onChange={(e) => setExemptionReason(e.target.value)}
                >
                  <option value="" disabled>Choose Reason</option>
                  <option value="medical">Medical Emergency</option>
                  <option value="od">On Duty (OD)</option>
                  <option value="sports">Sports</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Button 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium"
                onClick={handleAddAuthority}
              >
                Add Authority
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}
