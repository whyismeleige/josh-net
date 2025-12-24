import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/src/ui/navigation-menu";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ModeToggle } from "@/src/ui/mode-toggle";
import { Button } from "@/src/ui/button";

const components = [
  {
    name: "Features",
  },
  {
    name: "Highlights",
  },
  {
    name: "Blog",
  },
  {
    name: "FAQ",
  },
];

export default function Header(props: { scrollTo: (key: string) => void }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="hidden lg:flex items-center justify-between py-3">
          <div className="flex items-center">
            <Link
              href="#"
              className="text-xl font-bold text-foreground hover:text-foreground/80 transition-colors"
            >
              JOSH Net
            </Link>
          </div>
          <div className="flex-1 flex justify-center">
            <NavigationMenu>
              <NavigationMenuList>
                {components.map((item: { name: string }, index: number) => {
                  return (
                    <NavigationMenuItem
                      key={index}
                      asChild
                      className={navigationMenuTriggerStyle()}
                    >
                      <Link href="#" onClick={() => props.scrollTo(item.name)}>
                        {item.name}
                      </Link>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex items-center space-x-2">
            <ModeToggle />
            <Button>
              <Link href="/auth?view=Login">Login</Link>
            </Button>
            <Button variant="outline">
              <Link href="/auth?view=Sign Up">Sign Up</Link>
            </Button>
          </div>
        </div>
        {/* Mobile Navigation */}
        <div className="lg:hidden flex items-center justify-between py-3 border-gray-200/40 dark:border-gray-800/40">
          <div className="flex-1">
            <Link
              href="#"
              className="text-xl font-bold text-foreground hover:text-foreground/80 transition-colors"
            >
              JOSH Net
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <ModeToggle />
            <button
              onClick={toggleMobileMenu}
              className="flex items-center justify-center w-10 h-10 p-2 rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 shadow-lg">
            <div className="container mx-auto px-4 py-3">
              <div className="space-y-1">
                {components.map((item: { name: string }, index: number) => {
                  return (
                    <button
                      key={index}
                      className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-accent hover:text-accent-foreground rounded-md"
                      onClick={() => {
                        props.scrollTo(item.name);
                        toggleMobileMenu();
                      }}
                    >
                      {item.name}
                    </button>
                  );
                })}
                <div className="border-t border-gray-200/50 dark:border-gray-800/50 pt-4 pb-2">
                  <div className="flex space-x-2">
                    <Button className="flex-1">Login</Button>
                    <Button variant="outline" className="flex-1">
                      SignUp
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
