"use client";
import { createContext, ReactNode, useContext, useState } from "react";
import { MaterialDisplay, StudentContextType } from "../types/student.types";

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: ReactNode }) {
  const [headerTitle, setHeaderTitle] = useState("");
  const [materialsDisplay, setMaterialsDisplay] =
    useState<MaterialDisplay>("grid");
  const [selected, setSelected] = useState(new Set<number>());
  const [lastSelected, setLastSelected] = useState<number | null>(null);

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

  const value: StudentContextType = {
    headerTitle,
    setHeaderTitle,
    materialsDisplay,
    setMaterialsDisplay,
    selected,
    lastSelected,
    handleSelect,
    clearSelection,
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
