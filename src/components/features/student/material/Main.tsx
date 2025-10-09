import { useEffect, useState } from "react";
import SiteHeader from "./Header";
import { File, Grid, List, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8080";

interface SubjectUnit {
  name: string;
  code: string;
  _id: string;
}

interface SubjectsAPIResponse {
  message: string;
  type: string;
  data?: Record<string, [SubjectUnit]>;
}

type FileStructure = "grid" | "list";

const getSubjectsData = async () => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${SERVER_URL}/api/v1/student/subjects`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

export default function SiteMain() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [fileStructure, setFileStructure] = useState<FileStructure>("grid");

  useEffect(() => {
    const getData = async () => {
      const data = await getSubjectsData();
      console.log(data);
    };
    getData();
  }, []);

  return (
    <>
      <SiteHeader />
      <div className="flex gap-2 m-2">
        <div className="grow-1">
          <Input
            icon={Search}
            value={searchQuery}
            placeholder="Search for Materials"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs defaultValue="grid">
          <TabsList>
            <TabsTrigger
              onClick={() => setFileStructure("grid")}
              className="cursor-pointer"
              value="grid"
            >
              <Grid />
            </TabsTrigger>
            <TabsTrigger
              onClick={() => setFileStructure("list")}
              className="cursor-pointer"
              value="list"
            >
              <List />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex gap-2 m-2">
        <div className="flex flex-col justify-center w-auto h-auto">
          <img
            src="https://img.icons8.com/fluency/48/folder-invoices.png"
            alt=""
          />
          <p className="text-sm font-medium truncate">Hello World</p>
        </div>
        <div className="flex flex-col justify-center w-auto h-auto">
          <img
            src="https://img.icons8.com/fluency/48/folder-invoices.png"
            alt=""
          />
          <p className="text-sm font-medium truncate">Hello World</p>
        </div>
      </div>
    </>
  );
}
