import JosephineChat from "@/src/components/pages/Student/Josephine/chat";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Josephine",
}

export default function Page() {
    return <JosephineChat/>
}