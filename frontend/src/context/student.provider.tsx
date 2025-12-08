"use client";
import React, { createContext, ReactNode, useContext, useState } from "react";
import { MaterialDisplay, StudentContextType } from "../types/student.types";
import { CourseWorkData, Files, SortObject } from "../types/material.types";
import { BACKEND_URL } from "../utils/config";
import { useAppSelector } from "../hooks/redux";

const StudentContext = createContext<StudentContextType | undefined>(undefined);

function insertPath(
  currentLevel: Files[],
  parts: string[],
  metadata?: CourseWorkData,
  currentPath: string = ""
) {
  if (parts.length === 0) return;

  const [currentPart, ...remainingParts] = parts;
  const isFile = remainingParts.length === 0 && currentPart.includes(".");

  const fullPath = currentPath ? `${currentPath}/${currentPart}` : currentPart;

  let node = currentLevel.find((n) => n.title === currentPart);

  if (!node) {
    node = {
      title: currentPart,
      type: isFile ? "file" : "folder",
      children: [],
      key: fullPath,
    };

    if (isFile && metadata) {
      (node.description = metadata.description), (node.s3URL = metadata.s3URL);
      node.mimetype = metadata.mimetype;
      node.size = metadata.size;
      node.contentType = metadata.contentType;
      node.uploadedBy = metadata.uploadedBy;
      node.status = metadata.status;
      node.visibility = metadata.visibility;
      node.downloadAllowed = metadata.downloadAllowed;
      node.sharingAllowed = metadata.sharingAllowed;
      node.createdAt = new Date(metadata.createdAt).toDateString();
      node.updatedAt = metadata.updatedAt;
      node._id = metadata._id;
      node.academicDetails = metadata.academicDetails;
      node.analytics = metadata.analytics;
    }
    currentLevel.push(node);
  }

  if (remainingParts.length > 0)
    insertPath(node.children, remainingParts, metadata, fullPath);
}

function pathsToTree(data: CourseWorkData[]) {
  const root: Files[] = [];

  data.forEach((material) => {
    const parts = material.s3Key.split("/").filter(Boolean);
    insertPath(root, parts, material);
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
  const [currentPath, setCurrentPath] = useState<string[]>(["Home"]);
  const [isLoading, setLoading] = useState(false);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);
  const [sortObject, setSortObject] = useState<SortObject>({
    sortOption: "name",
    directionOption: "ascending",
    folderOption: "top",
  });
  const [searchInput, setSearchInput] = useState<string>("");

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
          setCurrentPath([...currentPath, root[0].title]);
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

    if (clickTimer) {
      clearTimeout(clickTimer);
      setClickTimer(null);
      return;
    }

    const timer = setTimeout(() => {
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
      setClickTimer(null);
    }, 200);

    setClickTimer(timer);
  };

  const getCurrentItems = () => {
    let current = fileStructure;
    for (const name of currentPath) {
      if (name === "Home") {
        current = fileStructure;
        continue;
      }
      current = current.find((value) => value.title === name)?.children || [];
    }
    return sortFileStructure(current);
  };

  const sortFileStructure = (fileStructure: Files[]) => {
    return fileStructure.sort((a, b) =>
      sortObject.directionOption === "ascending"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title)
    );
  };

  const handleFolderClick = (
    index: number,
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.preventDefault();

    if (clickTimer) {
      clearTimeout(clickTimer);
      setClickTimer(null);
    }

    clearSelection();
    const items = getCurrentItems();
    if (items[index].type === "folder")
      setCurrentPath([...currentPath, items[index].title]);
  };

  const handleBreadCrumbClick = (index: number) => {
    clearSelection();
    setCurrentPath(currentPath.slice(0, index));
  };

  const goBack = () => {
    clearSelection();
    if (currentPath.length > 0) setCurrentPath(currentPath.slice(0, -1));
  };

  const value: StudentContextType = {
    isLoading,
    headerTitle,
    setHeaderTitle,
    materialsDisplay,
    setMaterialsDisplay,
    selected,
    lastSelected,
    handleSelect,
    clearSelection,
    fileStructure,
    currentPath,
    fetchCourseWork,
    getCurrentItems,
    handleFolderClick,
    handleBreadCrumbClick,
    goBack,
    sortObject,
    setSortObject,
    searchInput,
    setSearchInput,
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
