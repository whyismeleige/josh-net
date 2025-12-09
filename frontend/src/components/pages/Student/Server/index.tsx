"use client"
import { Input } from "@/components/ui/input";
import { usePageTitle } from "@/src/hooks/usePageTitle";
import { BACKEND_URL } from "@/src/utils/config";
import { ChangeEvent, useState } from "react";
import { io } from "socket.io-client"

export default function StudentServer() {
    const [value, setValue] = useState("");
    const socket = io(BACKEND_URL);
    
    usePageTitle("Student Server");

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value)
        socket.emit("chat-message", e.target.value);       
    }
    return (
        <div className="flex"> 
            <Input type="text" value={value} onChange={(e) => handleChange(e)}/>           
        </div>
    )
}