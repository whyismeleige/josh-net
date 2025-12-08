"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStudentContext } from "@/src/context/student.provider";
import { useAppSelector } from "@/src/hooks/redux";
import {
  CourseWorkData,
  DirectionOptions,
  Files,
  FolderOptions,
  SortOptions,
} from "@/src/types/material.types";
import { BACKEND_URL } from "@/src/utils/config";
import {
  Download,
  EllipsisVertical,
  File,
  Filter,
  Folder,
  FolderIcon,
  Link,
  MoveLeft,
  Search,
  SortAsc,
  SortDesc,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function StudentMaterials() {
  const {
    isLoading,
    materialsDisplay,
    selected,
    handleSelect,
    clearSelection,
    fetchCourseWork,
    handleFolderClick,
    getCurrentItems,
    goBack,
    searchInput,
    setSearchInput,
  } = useStudentContext();

  const [buttonsVisibleIndex, setButtonsVisibleIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    fetchCourseWork();
  }, []);

  const fileStructure: Files[] = getCurrentItems();

  if (isLoading) {
    return (
      <section>
        <Spinner />
        Fetching Files
      </section>
    );
  }

  return (
    <section className="p-2">
      <div className="flex gap-2 mb-2">
        {selected.size === 0 ? (
          <>
            <Button variant="outline" size="icon" onClick={goBack}>
              <MoveLeft />
            </Button>
            <div className="flex-1 relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
              />
              <Input
                id="text"
                className="pl-10"
                placeholder="Search for Academic Materials"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <SortingMenu />
            <Button variant="outline" size="icon">
              <Filter />
            </Button>
          </>
        ) : (
          <div className="flex flex-1 rounded-md bg-primary items-center text-primary-foreground gap-2">
            <Button onClick={clearSelection} size="icon">
              <X />
            </Button>
            <span>{selected.size} selected</span>
            <Button size="icon">
              <UserPlus />
            </Button>
            <Button size="icon">
              <Download />
            </Button>
            <Button size="icon">
              <Link />
            </Button>
            <Button size="icon">
              <EllipsisVertical />
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap p-2 gap-3">
        {materialsDisplay === "grid" ? (
          fileStructure.map(
            (item, index) =>
              item.title.includes(searchInput.trim()) && (
                <div
                  key={index}
                  className={`flex flex-col items-center cursor-pointer p-4 justify-center transition-colors rounded-lg aspect-square w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.5rem)] md:w-[calc(25%-0.5625rem)] lg:w-[calc(16.666%-0.625rem)] xl:w-[calc(12.5%-0.65625rem)] ${
                    selected.has(index) ? "bg-blue-500" : "hover:bg-muted/50"
                  }`}
                  onDoubleClick={(e) => handleFolderClick(index, e)}
                  onClick={(e) => handleSelect(index, e)}
                >
                  {item.type === "folder" ? (
                    <FolderIcon size={48} className="mb-2 flex-shrink-0" />
                  ) : (
                    <File size={48} className="mb-2 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium line-clamp-1 break-words w-full text-center">
                    {item.title}
                  </span>
                </div>
              )
          )
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="w-[200px]">Uploaded By</TableHead>
                <TableHead className="w-[200px]">Date Used</TableHead>
                <TableHead className="w-[200px]">Size</TableHead>
                <TableHead className="text-right w-[200px]">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fileStructure.map((item, index) => {
                return (
                  item.title.includes(searchInput.trim()) && (
                    <TableRow
                      className={`cursor-pointer transition-colors ${
                        selected.has(index) && "bg-blue-500"
                      }`}
                      onClick={(e) => handleSelect(index, e)}
                      onMouseEnter={() => setButtonsVisibleIndex(index)}
                      onMouseLeave={() => setButtonsVisibleIndex(null)}
                      key={index}
                      onDoubleClick={(e) => handleFolderClick(index, e)}
                    >
                      <TableCell className="flex items-center gap-2">
                        {item.type === "file" ? (
                          <File size={20} />
                        ) : (
                          <Folder size={20} />
                        )}
                        {item.title}
                      </TableCell>
                      <TableCell>{item.uploadedBy || "User"}</TableCell>
                      <TableCell>{item.createdAt || "12-10-2025"}</TableCell>
                      <TableCell>{item.size || "10 KB"}</TableCell>
                      <TableCell className="flex gap-2 justify-end">
                        {buttonsVisibleIndex === index && (
                          <>
                            <Button variant="outline" size="icon-sm">
                              <UserPlus />
                            </Button>
                            <Button variant="outline" size="icon-sm">
                              <Download />
                            </Button>
                            <Button variant="outline" size="icon-sm">
                              <Link />
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="icon-sm">
                          <EllipsisVertical />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
}

const FilterDialog = () => {};

const SortingMenu = () => {
  const { sortObject, setSortObject } = useStudentContext();
  const directions: {
    [key in SortOptions]: { [key in DirectionOptions]: string };
  } = {
    name: {
      ascending: "A to Z",
      descending: "Z to A",
    },
    usage: {
      ascending: "Recently Used",
      descending: "Last Used",
    },
    size: {
      ascending: "Smallest to Largest",
      descending: "Largest to Smallest",
    },
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {sortObject.directionOption === "ascending" ? (
            <SortAsc />
          ) : (
            <SortDesc />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-45" align="end">
        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={sortObject.sortOption}
          onValueChange={(value) =>
            setSortObject({ ...sortObject, sortOption: value as SortOptions })
          }
        >
          <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="usage">Usage</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="size">Size</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Sort Direction</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={sortObject.directionOption}
          onValueChange={(value) =>
            setSortObject({
              ...sortObject,
              directionOption: value as DirectionOptions,
            })
          }
        >
          <DropdownMenuRadioItem value="ascending">
            {directions[sortObject.sortOption].ascending}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="descending">
            {directions[sortObject.sortOption].descending}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Folders</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={sortObject.folderOption}
          onValueChange={(value) =>
            setSortObject({
              ...sortObject,
              folderOption: value as FolderOptions,
            })
          }
        >
          <DropdownMenuRadioItem value="top">On top</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="mixed">
            Mixed with files
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
