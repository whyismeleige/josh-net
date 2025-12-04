import StudentJosephine from "@/src/components/pages/Student/Josephine";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Student Josephine",
}

export default function Page(){
    return (
        <StudentJosephine/>
    )
}