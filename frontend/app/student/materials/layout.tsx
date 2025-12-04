"use client";
import MaterialsHeader from "@/src/components/pages/Student/Materials/header";
import { usePageTitle } from "@/src/hooks/usePageTitle";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  usePageTitle("Materials");
  return (
    <>
      <MaterialsHeader />
      {children}
    </>
  );
}
