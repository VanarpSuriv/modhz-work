import { useState, useEffect, useRef, useCallback } from "react";
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
  CheckCircle2,
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

interface RecognitionPayload {
  name?: string;
  studentName?: string;
  confirmed?: string | boolean;
  label?: string;
  status?: string;
  timestamp?: string | number;
  time?: string;
  message?: string;
  result?: RecognitionPayload;
  data?: RecognitionPayload;
}

const ATTENDANCE_LOGS = [
  { subject: "CS101", attended: 54, total: 60 },
  { subject: "EE207", attended: 42, total: 45 },
  { subject: "MA110", attended: 48, total: 50 },
  { subject: "BIO150", attended: 36, total: 40 },
];

const RECOGNITION_ENDPOINTS = [
  "/latest_recognition",
  "/recognition/latest",
  "/api/latest_recognition",
  "/api/recognition/latest",
  "/attendance/latest",
];

const buildAttendanceRecord = (studentName: string, timestamp?: string | number): AttendanceRecord => ({
  id: `${studentName}-${timestamp ?? Date.now()}`,
  studentName,
  time:
    typeof timestamp === "number"
      ? new Date(timestamp).toLocaleTimeString()
      : timestamp
        ? new Date(timestamp).toLocaleTimeString()
        : new Date().toLocaleTimeString(),
  status: "Present",
});

const extractConfirmedStudentName = (payload: unknown): { name: string; timestamp?: string | number } | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as RecognitionPayload;
  const nestedCandidate = candidate.result ?? candidate.data;
  const current = nestedCandidate ?? candidate;
  const message = [current.message, current.label, current.status]
    .filter((value): value is string => typeof value === "string")
    .join(" ");

  const explicitName = current.name ?? current.studentName;
  const confirmationFlag = current.confirmed;
  const confirmedByFlag =
    confirmationFlag === true ||
    (typeof confirmationFlag === "string" && confirmationFlag.toLowerCase() !== "false");
  const confirmedMatch = message.match(/confirmed\s*:\s*([^\n]+)/i);
  const confirmedByMessage = confirmedMatch?.[1]?.trim();
  const parsedName = explicitName?.trim() || confirmedByMessage;

  if (!parsedName) {
    return null;
  }

  if (!confirmedByFlag && !confirmedByMessage && !/confirmed/i.test(message)) {
    return null;
  }

  return {
    name: parsedName,
    timestamp: current.timestamp ?? current.time,
  };
};

export default function LiveMonitor() {
  const [backendUrl, setBackendUrl] = useState("http://localhost:5001");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [liveAttendance, setLiveAttendance] = useState<AttendanceRecord[]>([]);
  const [currentClass, setCurrentClass] = useState<{ period: number; subject: string | null; day: string } | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastConfirmedSignatureRef = useRef<string | null>(null);
  const recognitionEndpointRef = useRef<string | null>(null);
  const [exemptionName, setExemptionName] = useState("");
  const [exemptionReason, setExemptionReason] = useState("");

  const appendAttendanceRecord = useCallback((studentName: string, timestamp?: string | number) => {
    const record = buildAttendanceRecord(studentName, timestamp);

    setLiveAttendance((prev) => {
      const alreadyListed = prev.some(
        (entry) => entry.studentName === studentName && entry.time === record.time,
      );

      if (alreadyListed) {
        return prev;
      }

      return [record, ...prev].slice(0, 20);
    });
  }, []);

  useEffect(() => {
    const savedSettings = localStorage.getItem("smartcampus_settings");
    if (!savedSettings) {
      return;
    }

    try {
      const parsedSettings = JSON.parse(savedSettings) as { backendUrl?: string; streamEndpoint?: string };
      if (parsedSettings.backendUrl) {
        setBackendUrl(parsedSettings.backendUrl);
      }
      if (parsedSettings.backendUrl && parsedSettings.streamEndpoint) {
        setStreamUrl(`${parsedSettings.backendUrl}${parsedSettings.streamEndpoint}`);
      }
    } catch (error) {
      console.error("Failed to load saved settings", error);
    }
  }, []);

  useEffect(() => {
    const updateCurrentClass = () => {
      const current = getCurrentPeriod();
      setCurrentClass(current);
    };

    updateCurrentClass();
    const interval = setInterval(updateCurrentClass, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!isConnected) {
      recognitionEndpointRef.current = null;
      return;
    }

    let cancelled = false;

    const pollRecognition = async () => {
      const endpointsToTry = recognitionEndpointRef.current
        ? [recognitionEndpointRef.current]
        : RECOGNITION_ENDPOINTS.map((endpoint) => `${backendUrl}${endpoint}`);

      for (const endpoint of endpointsToTry) {
        try {
          const response = await fetch(endpoint, {
            headers: { Accept: "application/json" },
          });

          if (!response.ok) {
            continue;
          }

          const payload = (await response.json()) as RecognitionPayload;
          recognitionEndpointRef.current = endpoint;
          const confirmedStudent = extractConfirmedStudentName(payload);

          if (!confirmedStudent) {
            return;
          }

          const signature = `${confirmedStudent.name}-${confirmedStudent.timestamp ?? "latest"}`;
          if (lastConfirmedSignatureRef.current === signature) {
            return;
          }

          lastConfirmedSignatureRef.current = signature;
          appendAttendanceRecord(confirmedStudent.name, confirmedStudent.timestamp);
          toast.success(`Live attendance updated for ${confirmedStudent.name}`);
          return;
        } catch (error) {
          if (recognitionEndpointRef.current === endpoint) {
            recognitionEndpointRef.current = null;
          }
          if (!cancelled) {
            console.debug("Recognition polling failed", endpoint, error);
          }
        }
      }
    };

    pollRecognition();
    const interval = window.setInterval(pollRecognition, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [appendAttendanceRecord, backendUrl, isConnected]);

  const handleConnect = async () => {
    setIsConnecting(true);
    toast.info(`Connecting to ${backendUrl}...`);

    try {
      await fetch(`${backendUrl}/video_feed`, {
        method: "HEAD",
        mode: "no-cors",
      });

      setStreamUrl(`${backendUrl}/video_feed`);
      setIsConnected(true);
      toast.success(`Connected to backend at ${backendUrl}`);
    } catch (error) {
      console.error("Connection error:", error);
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
    lastConfirmedSignatureRef.current = null;
    toast.info("Disconnected from backend");
  };

  const handleStartWebcam = async () => {
    if (isWebcamActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
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
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsWebcamActive(true);
      toast.success("Webcam started successfully");
    } catch (error) {
      console.error("Webcam error:", error);
      toast.error("Failed to access webcam. Please check permissions.");
    }
  };

  const handleSimulate = () => {
    const mockStudents = ["Pranav A", "Raghuraman R", "Shivani T", "Kumar S", "Priya M", "Ananya K", "Rahul V"];
    const randomStudent = mockStudents[Math.floor(Math.random() * mockStudents.length)];

    appendAttendanceRecord(randomStudent);

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
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Smart Campus</h1>
              <p className="text-sm text-primary font-medium tracking-wide">ATTENDANCE & BUNKING TRACKER</p>
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
              className={`gap-2 ${isWebcamActive ? "bg-destructive/10 border-destructive text-destructive" : ""}`}
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
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90" onClick={handleSimulate}>
              <PlayCircle className="h-4 w-4" />
              Simulate
            </Button>
          </div>
        </div>

        {currentClass && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground">Currently in session:</p>
            <p className="text-lg font-semibold text-foreground">
              Period {currentClass.period} - {getSubjectName(currentClass.subject)}
            </p>
          </div>
        )}

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
              isConnected ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
            }`}
          >
            <Link2 className="h-4 w-4" />
            {isConnecting ? "Connecting..." : isConnected ? "Disconnect" : "Connect"}
          </Button>
          <span className="text-sm text-muted-foreground">
            Connect to your Python backend for real face recognition
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <div className="feed-container aspect-[4/3] w-full max-w-[640px] mx-auto rounded-lg flex items-center justify-center border border-border overflow-hidden bg-black/40">
                {isWebcamActive ? (
                  <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-contain" />
                ) : isConnected && streamUrl ? (
                  <div className="relative h-full w-full flex items-center justify-center bg-black">
                    <img
                      src={streamUrl}
                      alt="Video Feed"
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <WifiOff className="h-16 w-16 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-muted-foreground">SIGNAL ENCRYPTED / STANDBY</p>
                      <p className="text-sm text-muted-foreground mt-1">Enter backend URL or use Webcam</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
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
                          <span className="font-medium text-foreground text-sm">{incident.studentName}</span>
                          <Badge className="status-bunk text-[10px]">{incident.type.toUpperCase()}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Detected at {incident.time}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <option value="" disabled>
                    Choose Reason
                  </option>
                  <option value="medical">Medical Emergency</option>
                  <option value="od">On Duty (OD)</option>
                  <option value="sports">Sports</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium" onClick={handleAddAuthority}>
                Add Authority
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
