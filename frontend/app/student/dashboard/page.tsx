import StudentDashboard from "@/src/components/pages/Student/Dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student's Dashboard"
}

export default function Page() {
  return (
    <StudentDashboard/>
  );
}
