import { Files, SortObject } from "./material.types";

export type MaterialDisplay = "grid" | "list";

export type StudentContextType = {
  isLoading: boolean;
  headerTitle: string;
  setHeaderTitle: (title: string) => void;
  materialsDisplay: MaterialDisplay;
  setMaterialsDisplay: (display: MaterialDisplay) => void;
  selected: Set<number>;
  lastSelected: number | null;
  handleSelect: (
    index: number,
    event: React.MouseEvent<HTMLTableRowElement | HTMLDivElement, MouseEvent>
  ) => void;
  clearSelection: () => void;
  fileStructure: Files[];
  currentPath: string[];
  fetchCourseWork: () => Promise<void>;
  getCurrentItems: () => Files[];
  handleFolderClick: (index: number, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  handleBreadCrumbClick: (index: number) => void;
  goBack: () => void;
  sortObject: SortObject;
  setSortObject: (object: SortObject) => void;
  searchInput: string;
  setSearchInput: (value: string) => void;
  downloadFiles: () => void;
  handleFileClick: (key: string) => Promise<void>;
  fileBlob: Blob | null;
};
