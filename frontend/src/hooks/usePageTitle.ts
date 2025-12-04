"use client"
import { useEffect } from "react";
import { useStudentContext } from "../context/student.provider";

export function usePageTitle(title: string) {
  const { setHeaderTitle } = useStudentContext();

  useEffect(() => {
    setHeaderTitle(title);
  }, []);
}
