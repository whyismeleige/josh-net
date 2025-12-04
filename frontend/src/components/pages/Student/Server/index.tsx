"use client"

import { usePageTitle } from "@/src/hooks/usePageTitle";

export default function StudentServer() {
    usePageTitle("Student Server");
    return (
        <>
            This is the Student Server Page
        </>
    )
}