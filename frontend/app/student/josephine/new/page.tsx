import JosephineNewChat from "@/src/components/pages/Student/Josephine/newchat";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Josephine",
}

export default function Page(){
    return (
        <JosephineNewChat/>
    )
}