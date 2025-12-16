import JosephineNewChat from "@/src/components/pages/Student/Josephine/newchat";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Student Josephine",
}

export default function Page(){
    return (
        <JosephineNewChat/>
    )
}