import StudentAttendance from "@/src/components/pages/Student/Attendance";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Attendance Page",
}

export default function Page() {
    return (
        <StudentAttendance/>
    )
}