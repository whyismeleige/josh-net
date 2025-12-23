import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Settings, 
  Wrench, 
  ThumbsUp, 
  Sparkles, 
  Headphones, 
  BarChart3 
} from "lucide-react";

const items = [
  {
    icon: <Settings className="w-6 h-6" />,
    title: "Swift response system",
    description:
      "Handle travel-related incidents with speed and accuracy, minimizing disruption and ensuring safety.",
  },
  {
    icon: <Wrench className="w-6 h-6" />,
    title: "Robust reliability",
    description:
      "Rely on a system designed to perform under pressure, offering dependable protection during unexpected events.",
  },
  {
    icon: <ThumbsUp className="w-6 h-6" />,
    title: "Traveler-focused design",
    description:
      "Enjoy a streamlined experience built with travelers in mind, simplifying reporting and assistance at every step.",
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Innovative safety features",
    description:
      "Benefit from advanced monitoring, real-time alerts, and predictive tools that set new standards in travel security.",
  },
  {
    icon: <Headphones className="w-6 h-6" />,
    title: "Dedicated support network",
    description:
      "Access 24/7 assistance and guidance, ensuring help is always within reach, no matter where you are.",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Precision-driven coordination",
    description:
      "Experience a system where every detail from alerts to resolution, is fine-tuned for maximum impact and efficiency.",
  },
];

interface HighlightsProps {
  setRef?: (key: string, node: HTMLDivElement | null) => void;
}

export default function Highlights({ setRef }: HighlightsProps) {
  return (
    <section
      id="highlights"
      ref={(node: HTMLDivElement | null) => setRef?.("Highlights", node)}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-col items-center gap-6 sm:gap-8 md:gap-12">
          <div className="w-full sm:max-w-none md:max-w-4xl text-left sm:text-left md:text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6">
              Highlights
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-none md:max-w-4xl mx-auto">
              Discover how Sentinel Travel ensures safety, reliability, and
              seamless support for every traveler. Built on trust, speed, and
              precision, it delivers peace of mind wherever your journey takes
              you.
            </p>
          </div>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {items.map((item, index) => (
              <Card
                key={index}
                className="h-full bg-card border-border hover:shadow-md transition-all duration-300"
              >
                <CardContent className="p-4 sm:p-5 md:p-6 h-full flex flex-col gap-3 sm:gap-4">
                  <div className="text-muted-foreground opacity-70 flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 space-y-2 sm:space-y-3">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}