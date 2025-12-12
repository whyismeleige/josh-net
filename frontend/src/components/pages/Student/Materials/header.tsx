import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudentContext } from "@/src/context/student.provider";
import { Grid, Home, List } from "lucide-react";
import { Fragment } from "react/jsx-runtime";

export default function MaterialsHeader() {
  const { materialsDisplay, setMaterialsDisplay, currentPath, handleBreadCrumbClick } = useStudentContext();
  return (
    <header className="flex h-(--header-height) shrink-0 items-center justify-between border-b gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <Breadcrumb className="ml-4">
        <BreadcrumbList>
          {currentPath.map((item, index) => (
            <Fragment key={index}>
              <BreadcrumbItem onClick={() => handleBreadCrumbClick(index)}>
                {index !== currentPath.length - 1 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center cursor-pointer gap-1 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5">
                      {item === "Home" ? <Home/> : item}
                      {/* {items.children.length !== 0 && <ChevronDownIcon />} */}
                    </DropdownMenuTrigger>
                    {/* <DropdownMenuContent>
                      {items.children.map((child, index) => (
                        <DropdownMenuItem key={index}>
                          {child.title}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent> */}
                  </DropdownMenu>
                ) : (
                  <BreadcrumbPage>{item}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index !== currentPath.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <Tabs defaultChecked defaultValue={materialsDisplay}>
        <TabsList className="mr-4" >
          <TabsTrigger value="grid" onClick={() => setMaterialsDisplay("grid")}>
            <Grid />
          </TabsTrigger>
          <TabsTrigger value="list" onClick={() => setMaterialsDisplay("list")}>
            <List />
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </header>
  );
}
