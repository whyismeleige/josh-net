import * as React from "react";
import { Card, CardContent } from "@/src/ui/card";
import { Button } from "@/src/ui/button";
import { Bot, Share, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  {
    icon: <Bot className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "AI Chat-Bot Josephine",
    description:
      "Advanced algorithms instantly detect unusual behavior patterns and potential danger situations.",
    imageLight:
      "https://mui.com/static/images/templates/templates-images/dash-light.png",
    imageDark:
      "https://mui.com/static/images/templates/templates-images/dash-dark.png",
  },
  {
    icon: <Share className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "One-Touch Emergency Response",
    description:
      "Single button instantly alerts police, medical teams, and emergency contacts with live location.",
    imageLight:
      "https://mui.com/static/images/templates/templates-images/mobile-light.png",
    imageDark:
      "https://mui.com/static/images/templates/templates-images/mobile-dark.png",
  },
  {
    icon: <Globe className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "Smart Geo-Fencing",
    description:
      "Automatic alerts when entering restricted zones, danger areas, or culturally sensitive locations.",
    imageLight:
      "https://mui.com/static/images/templates/templates-images/devices-light.png",
    imageDark:
      "https://mui.com/static/images/templates/templates-images/devices-dark.png",
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
      <Card className="w-full">
        <div
          className="bg-cover bg-center h-48 sm:h-64 rounded-t-lg border-b"
          style={{
            backgroundImage: `url(${items[selectedItemIndex].imageLight})`,
          }}
        />
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3 mb-2">
            <div className="text-muted-foreground mt-0.5">
              {selectedFeature.icon}
            </div>
            <h3 className="font-semibold text-sm sm:text-base text-foreground leading-tight">
              {selectedFeature.title}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-7 sm:pl-9">
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
            We provide numerous amounts of features ranging from a specialized
            AI chat bot called Josephine to your personal customizable servers.
          </p>
        </div>
        <div className="flex flex-col lg:flex-row-reverse gap-4 sm:gap-6 md:gap-8 lg:gap-12">
          <div className="w-full lg:w-2/5 xl:w-1/2">
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
                  <div className="w-full flex flex-col items-start gap-2 lg:gap-3 xl:gap-4 text-left">
                    <div
                      className={cn(
                        "text-muted-foreground transition-colors",
                        selectedItemIndex === index && "text-accent-foreground"
                      )}
                    >
                      {icon}
                    </div>
                    <h3 className="text-base lg:text-lg xl:text-xl font-semibold leading-tight">
                      {title}
                    </h3>
                    <p className="text-xs lg:text-sm xl:text-base text-muted-foreground leading-relaxed">
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
                    backgroundImage: `url(${items[selectedItemIndex]?.imageLight})`,
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

        @media (prefers-color-scheme: dark) {
          .dark-bg {
            background-image: url(${items[selectedItemIndex]
              ?.imageDark}) !important;
          }
        }

        .dark .dark-bg {
          background-image: url(${items[selectedItemIndex]
            ?.imageDark}) !important;
        }
      `}</style>
    </section>
  );
}
