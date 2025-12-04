import StudentMaterials from "@/src/components/pages/Student/Materials";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Student Materials"
}

export default function Page() {
    return (
        <StudentMaterials/>
    )
}