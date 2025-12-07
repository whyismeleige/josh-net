"use client";
import { createContext, ReactNode, useContext, useState } from "react";
import { MaterialDisplay, StudentContextType } from "../types/student.types";
import { CourseWorkData, Files } from "../types/material.types";
import { BACKEND_URL } from "../utils/config";
import { useAppSelector } from "../hooks/redux";

const StudentContext = createContext<StudentContextType | undefined>(undefined);

function insertPath(currentLevel: Files[], parts: string[]) {
  if (parts.length === 0) return;

  const [currentPart, ...remainingParts] = parts;
  const isFile = remainingParts.length === 0 && currentPart.includes(".");

  let node = currentLevel.find((n) => n.title === currentPart);

  if (!node) {
    node = {
      title: currentPart,
      type: isFile ? "file" : "folder",
      children: [],
    };
    currentLevel.push(node);
  }

  if (remainingParts.length > 0) insertPath(node.children, remainingParts);
}

function pathsToTree(data: CourseWorkData[]) {
  const root: Files[] = [];

  data.forEach((material) => {
    const parts = material.s3Key.split("/").filter(Boolean);
    insertPath(root, parts);
  });

  return root;
}

export function StudentProvider({ children }: { children: ReactNode }) {
  const [headerTitle, setHeaderTitle] = useState("");
  const [materialsDisplay, setMaterialsDisplay] =
    useState<MaterialDisplay>("grid");
  const [selected, setSelected] = useState(new Set<number>());
  const [lastSelected, setLastSelected] = useState<number | null>(null);
  const [fileStructure, setFileStructure] = useState<Files[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [isLoading, setLoading] = useState(false);

  const { accessToken } = useAppSelector((state) => state.auth);

  const fetchCourseWork = () => {
    try {
      setLoading(true);
      fetch(`${BACKEND_URL}/api/v1/student/coursework`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          const root = pathsToTree(data.coursework);
          setFileStructure(root);
        });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelected(new Set<number>());
    setLastSelected(null);
  };

  const handleSelect = (
    index: number,
    event: React.MouseEvent<HTMLTableRowElement | HTMLDivElement, MouseEvent>
  ) => {
    const newSelected = new Set(selected);

    if (event.shiftKey && lastSelected !== null) {
      const start = Math.min(lastSelected, index);
      const end = Math.max(lastSelected, index);

      for (let i = start; i <= end; i++) newSelected.add(i);
    } else if (event.ctrlKey || event.metaKey) {
      newSelected.has(index)
        ? newSelected.delete(index)
        : newSelected.add(index);
    } else {
      newSelected.clear();
      newSelected.add(index);
    }

    setSelected(newSelected);
    setLastSelected(index);
  };

  const getCurrentItems = () => {
    let current = fileStructure;
    for (const name of currentPath) {
      current = current.find((value) => value.title === name)?.children || [];
    }
    return current;
  };

  const handleFolderClick = (index: number) => {
    const items = getCurrentItems();
    if (items[index].type === "folder")
      setCurrentPath([...currentPath, items[index].title]);
  };

  const handleBreadCrumbClick = (index: number) => {
    setCurrentPath(currentPath.slice(0, index));
  };

  const goBack = () => {
    if (currentPath.length > 0) setCurrentPath(currentPath.slice(0, -1));
  };

  const value: StudentContextType = {
    headerTitle,
    setHeaderTitle,
    materialsDisplay,
    setMaterialsDisplay,
    selected,
    lastSelected,
    handleSelect,
    clearSelection,
    fileStructure,
    fetchCourseWork,
  };

  return (
    <StudentContext.Provider value={value}>{children}</StudentContext.Provider>
  );
}

export function useStudentContext() {
  const context = useContext(StudentContext);
  if (!context)
    throw new Error(
      "Use Student Context should be used within Student Provider"
    );
  return context;
}
