import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconGitBranch,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="flex flex-col items-center gap-8 sm:gap-12 lg:gap-16 text-center sm:text-center md:text-left">
          <div className="flex flex-col sm:flex-row w-full justify-between gap-8 sm:gap-6">
            <div className="flex flex-col gap-6 min-w-full sm:min-w-[60%]">
              <div className="w-full sm:w-4/5 lg:w-3/5">
                <h3 className="text-sm font-semibold text-foreground mb-2 mt-2">
                  Join the newsletter
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Subscribe for weekly updates. No spams ever!
                </p>

                <div className="space-y-2">
                  <Label
                    htmlFor="email-newsletter"
                    className="text-sm font-medium"
                  >
                    Email
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      id="email-newsletter"
                      type="email"
                      placeholder="Your email address"
                      className="w-full sm:w-64"
                      autoComplete="off"
                      aria-label="Enter your email address"
                    />
                    <Button
                      size="default"
                      className="w-full sm:w-auto sm:flex-shrink-0"
                    >
                      Subscribe
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex flex-col gap-2 min-w-fit">
              <h4 className="text-sm font-medium text-foreground mb-1">
                Product
              </h4>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Testimonials
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Highlights
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                FAQs
              </a>
            </div>

            <div className="hidden sm:flex flex-col gap-2 min-w-fit">
              <h4 className="text-sm font-medium text-foreground mb-1">
                Company
              </h4>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                About us
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Careers
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Press
              </a>
            </div>

            <div className="hidden sm:flex flex-col gap-2 min-w-fit">
              <h4 className="text-sm font-medium text-foreground mb-1">
                Legal
              </h4>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center pt-6 sm:pt-8 w-full border-t border-border gap-4 sm:gap-0">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-0">
              <div className="flex items-center gap-1 text-sm">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </a>
                <span className="text-muted-foreground opacity-50 mx-1">•</span>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DeveloperDropdown />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

const DeveloperDropdown = () => {
  const developers = [
    {
      name: "Piyush Jain",
      gitLink: "https://github.com/whyismeleige",
      linkedLink: "",
    },
    {
      name: "Bobby Anthene",
      gitLink: "https://github.com/noturbob",
      linkedLink: "",
    },
    {
      name: "Vyshnavi",
      gitLink: "https://github.com/vyshnavi",
      linkedLink: "",
    },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <IconGitBranch /> Developers
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        {developers.map(
          (
            obj: { name: string; gitLink: string; linkedLink: string },
            index: number
          ) => {
            return (
              <DropdownMenuSub key={index}>
                <DropdownMenuSubTrigger>{obj.name}</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <Link href={obj.gitLink}>
                      <DropdownMenuItem>
                        <IconBrandGithub />
                        Github
                      </DropdownMenuItem>
                    </Link>
                    <Link href={obj.linkedLink}>
                      <DropdownMenuItem>
                        <IconBrandLinkedin />
                        LinkedIn
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            );
          }
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
