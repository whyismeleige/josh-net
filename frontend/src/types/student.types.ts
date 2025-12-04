export type MaterialDisplay = "grid" | "list";

export type StudentContextType = {
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
};
