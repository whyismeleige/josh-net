import * as React from "react";
import { Card, CardContent } from "@/src/ui/card";
import { Button } from "@/src/ui/button";
import { Bot, Users, BookOpen, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

const items = [
  {
    icon: <Bot className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "Josephine AI Assistant",
    description:
      "AI-powered chatbot built with Claude API for academic queries, document analysis, and instant help with your studies.",
    imageLight: "/light-josephine.png",
    imageDark: "/dark-josephine.png",
  },
  {
    icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "Academic Resource Hub",
    description:
      "Centralized repository for study materials, lecture notes, and exam papers organized by semester and subject with secure cloud storage.",
    imageLight: "/light-josephine.png",
    imageDark: "/dark-josephine.png",
  },
  {
    icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "Real-Time Collaboration",
    description:
      "Create and join servers, communicate through channels, share files, and collaborate with classmates in real-time with WebSocket technology.",
    imageLight: "/light-servers.png",
    imageDark: "/dark-servers.png",
  },
];

interface MobileLayoutProps {
  selectedItemIndex: number;
  handleItemClick: (index: number) => void;
  selectedFeature: (typeof items)[0];
}

function MobileLayout({
  selectedItemIndex,
  handleItemClick,
  selectedFeature,
}: MobileLayoutProps) {
  if (!items[selectedItemIndex]) {
    return null;
  }

  const { theme } = useTheme();

  return (
    <div className="flex flex-col gap-3 sm:gap-4 md:hidden">
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {items.map(({ title }, index) => (
          <Button
            key={index}
            variant={selectedItemIndex === index ? "default" : "outline"}
            size="sm"
            onClick={() => handleItemClick(index)}
            className={cn(
              "whitespace-nowrap flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2",
              selectedItemIndex === index &&
                "bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            )}
          >
            {title}
          </Button>
        ))}
      </div>
      <Card className="w-full overflow-hidden">
        <div
          className="bg-cover bg-center h-48 sm:h-64 rounded-t-lg border-b"
          style={{
            backgroundImage: `url(${
              theme === "dark"
                ? items[selectedItemIndex].imageDark
                : items[selectedItemIndex].imageLight
            })`,
          }}
        />
        <CardContent className="p-3 sm:p-4 w-full">
          <div className="flex items-start gap-2 sm:gap-3 mb-2 w-full">
            <div className="text-muted-foreground mt-0.5 flex-shrink-0">
              {selectedFeature.icon}
            </div>
            <h3 className="font-semibold text-sm sm:text-base text-foreground leading-tight break-words flex-1 min-w-0">
              {selectedFeature.title}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-7 sm:pl-9 break-words">
            {selectedFeature.description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface FeaturesProps {
  setRef?: (key: string, node: HTMLDivElement | null) => void;
}

export default function Features({ setRef }: FeaturesProps) {
  const [selectedItemIndex, setSelectedItemIndex] = React.useState(0);
  const { theme } = useTheme();

  const handleItemClick = (index: number) => {
    setSelectedItemIndex(index);
  };

  const selectedFeature = items[selectedItemIndex];

  return (
    <section
      id="features"
      className="py-8 sm:py-12 md:py-16 lg:py-20"
      ref={(node: HTMLDivElement | null) => setRef?.("Features", node)}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-none sm:max-w-4xl lg:max-w-3xl mb-6 sm:mb-8 md:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 sm:mb-3 md:mb-4 leading-tight">
            Features
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
            JOSH-Net provides a comprehensive suite of features including
            AI-powered assistance, academic resource management, real-time
            collaboration, and performance analytics—all designed specifically
            for St. Joseph's College students.
          </p>
        </div>
        <div className="flex flex-col lg:flex-row-reverse gap-4 sm:gap-6 md:gap-8 lg:gap-12">
          <div className="w-full lg:w-2/5 xl:w-1/2 min-w-0">
            <div className="hidden md:flex flex-col gap-2 lg:gap-3 h-full">
              {items.map(({ icon, title, description }, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  onClick={() => handleItemClick(index)}
                  className={cn(
                    "p-4 lg:p-6 xl:p-8 h-auto w-full justify-start text-left hover:bg-accent transition-all duration-200",
                    selectedItemIndex === index &&
                      "bg-accent text-accent-foreground shadow-sm border border-border/50"
                  )}
                >
                  <div className="w-full flex flex-col items-start gap-2 lg:gap-3 xl:gap-4 text-left min-w-0">
                    <div
                      className={cn(
                        "text-muted-foreground transition-colors flex-shrink-0",
                        selectedItemIndex === index && "text-accent-foreground"
                      )}
                    >
                      {icon}
                    </div>
                    <h3 className="text-base lg:text-lg xl:text-xl font-semibold leading-tight w-full break-words">
                      {title}
                    </h3>
                    <p className="text-xs lg:text-sm xl:text-base text-muted-foreground leading-relaxed w-full break-words">
                      {description}
                    </p>
                  </div>
                </Button>
              ))}
            </div>
            <MobileLayout
              selectedItemIndex={selectedItemIndex}
              handleItemClick={handleItemClick}
              selectedFeature={selectedFeature}
            />
          </div>

          <div className="hidden md:flex w-full lg:w-3/5 xl:w-1/2">
            <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0 h-full flex items-center justify-center min-h-[400px] lg:min-h-[500px] xl:min-h-[600px]">
                <div
                  className="w-full h-full max-w-sm lg:max-w-md xl:max-w-lg max-h-96 lg:max-h-[500px] xl:max-h-[600px] bg-contain bg-no-repeat bg-center transition-all duration-500 ease-in-out"
                  style={{
                    backgroundImage: `url(${
                      theme === "dark"
                        ? items[selectedItemIndex]?.imageDark
                        : items[selectedItemIndex]?.imageLight
                    })`,
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}