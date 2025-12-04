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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStudentContext } from "@/src/context/student.provider";
import {
  Download,
  EllipsisVertical,
  File,
  Filter,
  Folder,
  Link,
  Search,
  SortAsc,
  SortDesc,
  UserPlus,
  X,
} from "lucide-react";
import React, { Fragment, useState } from "react";

const data = [
  {
    id: "12345",
    name: "Some Random Folder",
    type: "folder",
    date: "12-10-2025",
    uploadedBy: "Piyush Jain",
    size: "12 KB",
    location: "/files/folder",
    href: "/",
  },
  {
    id: "12345",
    name: "Some Random Folder",
    type: "folder",
    date: "12-10-2025",
    uploadedBy: "Piyush Jain",
    size: "12 KB",
    location: "/files/folder",
    href: "/",
  },
  {
    id: "12345",
    name: "Some Random Folder",
    type: "folder",
    date: "12-10-2025",
    uploadedBy: "Piyush Jain",
    size: "12 KB",
    location: "/files/folder",
    href: "/",
  },
  {
    id: "12345",
    name: "Some Random Folder",
    type: "folder",
    date: "12-10-2025",
    uploadedBy: "Piyush Jain",
    size: "12 KB",
    location: "/files/folder",
    href: "/",
  },
  {
    id: "12345",
    name: "Some Random Folder",
    type: "folder",
    date: "12-10-2025",
    uploadedBy: "Piyush Jain",
    size: "12 KB",
    location: "/files/folder",
    href: "/",
  },
];

export default function StudentMaterials() {
  const { materialsDisplay, selected, handleSelect, clearSelection } =
    useStudentContext();
  const [buttonsVisibleIndex, setButtonsVisibleIndex] = useState<number | null>(null); 

  return (
    <section className="p-2">
      <div className="flex gap-2 mb-2">
        {selected.size === 0 ? (
          <>
            <div className="flex-1 relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
              />
              <Input
                id="text"
                className="pl-10"
                placeholder="Search for Academic Materials"
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
      <div className="flex flex-wrap">
        {materialsDisplay === "grid" ? (
          data.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col cursor-pointer p-2 justify-center w-[100px] transition-colors ${
                selected.has(index) ? "bg-blue-500" : "hover:bg-muted/50 "
              }`}
              onClick={(e) => handleSelect(index, e)}
            >
              <img
                src="https://img.icons8.com/fluency/48/folder-invoices.png"
                alt={item.name}
              />
              <p className="text-sm font-medium truncate">{item.name}</p>
            </div>
          ))
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
              {data.map((item, index) => {

                return (
                  <TableRow
                    className={`cursor-pointer transition-colors ${
                      selected.has(index) && "bg-blue-500"
                    }`}
                    onClick={(e) => handleSelect(index, e)}
                    onMouseEnter={() => setButtonsVisibleIndex(index)}
                    onMouseLeave={() => setButtonsVisibleIndex(null)}
                    key={index}
                  >
                    <TableCell className="flex items-center gap-2">
                      {item.type === "file" ? (
                        <File size={20} />
                      ) : (
                        <Folder size={20} />
                      )}
                      {item.name}
                    </TableCell>
                    <TableCell>{item.uploadedBy}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.size}</TableCell>
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
  const [sortOption, setSortOption] = useState("name");
  const [directionOption, setDirectionOption] = useState("ascending");
  const [folderOption, setFolderOption] = useState("top");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {directionOption === "ascending" ? <SortAsc /> : <SortDesc />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-45" align="end">
        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={sortOption}
          onValueChange={setSortOption}
        >
          <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="usage">Usage</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="size">Size</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="uploaded-by">
            Uploaded By
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Sort Direction</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={directionOption}
          onValueChange={setDirectionOption}
        >
          <DropdownMenuRadioItem value="ascending">
            A to Z
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="descending">
            Z to A
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Folders</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={folderOption}
          onValueChange={setFolderOption}
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
