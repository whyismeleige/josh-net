
import StudentServer from "@/src/components/pages/Student/Server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Server",
};

export default function Page() {
  return (
    <StudentServer/>
  );
}
