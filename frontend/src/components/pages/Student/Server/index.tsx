"use client";
import { Input } from "@/components/ui/input";
import { useServerContext } from "@/src/context/server.provider";
import { useStudentContext } from "@/src/context/student.provider";
import { useAppSelector } from "@/src/hooks/redux";
import { usePageTitle } from "@/src/hooks/usePageTitle";
import { BACKEND_URL } from "@/src/utils/config";
import { ChangeEvent, useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function StudentServer() {
  const { accessToken } = useAppSelector((state) => state.auth);
  const { getServerList } = useServerContext();

  const [value, setValue] = useState("");
  const socket = io(BACKEND_URL);

  usePageTitle("Student Server");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    socket.emit("chat-message", e.target.value);
  };

  useEffect(() => {
    getServerList();
  }, []);
  return (
    <div className="flex">
      <Input type="text" value={value} onChange={(e) => handleChange(e)} />
    </div>
  );
}
