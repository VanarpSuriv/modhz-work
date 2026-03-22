import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

interface Student {
  rollNo: string;
  name: string;
  email: string;
  attendance: number;
  status: "active" | "warning" | "critical";
}

const initialStudents: Student[] = [
  { rollNo: "61", name: "Aarthi S", email: "aarthi@svce.ac.in", attendance: 92, status: "active" },
  { rollNo: "62", name: "Abishek K", email: "abishek@svce.ac.in", attendance: 88, status: "active" },
  { rollNo: "67", name: "Pranav A", email: "pranav@svce.ac.in", attendance: 94, status: "active" },
  { rollNo: "68", name: "Kumar S", email: "kumar@svce.ac.in", attendance: 72, status: "warning" },
  { rollNo: "69", name: "Priya M", email: "priya@svce.ac.in", attendance: 98, status: "active" },
  { rollNo: "70", name: "Arun K", email: "arun@svce.ac.in", attendance: 68, status: "critical" },
  { rollNo: "72", name: "Raghuraman R", email: "raghu@svce.ac.in", attendance: 92, status: "active" },
  { rollNo: "101", name: "Shivani T", email: "shivani@svce.ac.in", attendance: 96, status: "active" },
];

export default function StudentManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    rollNo: "",
    name: "",
    email: "",
  });

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.includes(searchQuery)
  );

  const handleAddStudent = () => {
    if (!newStudent.rollNo || !newStudent.name || !newStudent.email) {
      toast.error("Please fill in all fields");
      return;
    }

    // Check for duplicate roll number
    if (students.some(s => s.rollNo === newStudent.rollNo)) {
      toast.error("A student with this roll number already exists");
      return;
    }

    const studentToAdd: Student = {
      rollNo: newStudent.rollNo,
      name: newStudent.name,
      email: newStudent.email,
      attendance: 100, // New students start with 100% attendance
      status: "active",
    };

    setStudents([...students, studentToAdd]);
    setNewStudent({ rollNo: "", name: "", email: "" });
    setIsAddDialogOpen(false);
    toast.success(`Student ${newStudent.name} added successfully`);
  };

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.attendance >= 75).length;
  const atRiskStudents = students.filter(s => s.attendance < 75).length;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Student Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage student records and face recognition data
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Enter the student details below. The student will be added to the face recognition system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="rollNo">Roll Number</Label>
                  <Input
                    id="rollNo"
                    placeholder="e.g., 102"
                    value={newStudent.rollNo}
                    onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., John Doe"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g., john@svce.ac.in"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddStudent}>Add Student</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card className="bg-card border-border">
          <CardContent className="py-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
          </CardContent>
        </Card>

        {/* Student Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map((student) => (
            <Card key={student.rollNo} className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                    {student.name.charAt(0)}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground">{student.name}</h3>
                  <p className="text-sm text-muted-foreground">Roll No: {student.rollNo}</p>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{student.email}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Badge
                    className={
                      student.status === "active"
                        ? "status-active"
                        : student.status === "warning"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "status-bunk"
                    }
                  >
                    {student.attendance}% Attendance
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active (&gt;75%)</p>
                  <p className="text-2xl font-bold text-foreground">{activeStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">At Risk (&lt;75%)</p>
                  <p className="text-2xl font-bold text-foreground">{atRiskStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
