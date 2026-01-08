import * as React from "react";
import { Card, CardContent } from "@/src/ui/card";
import { 
  BookOpen, 
  Bot, 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Shield 
} from "lucide-react";

const items = [
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Centralized Academic Hub",
    description:
      "Access all study materials, lecture notes, and exam papers in one organized platform with seamless cloud storage.",
  },
  {
    icon: <Bot className="w-6 h-6" />,
    title: "AI-Powered Assistance",
    description:
      "Get instant help from Josephine AI chatbot for academic queries with document analysis and context-aware responses.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Real-Time Collaboration",
    description:
      "Connect with classmates through servers and channels, share resources, and collaborate on projects effortlessly.",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Performance Analytics",
    description:
      "Track attendance, monitor exam results, and visualize your academic progress with detailed insights and trends.",
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "Instant Communication",
    description:
      "Experience WebSocket-based real-time messaging with file sharing, reactions, and organized conversation threads.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Secure & Reliable",
    description:
      "Built with JWT authentication, secure file storage, and robust data protection to keep your information safe.",
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
              Discover how JOSH-Net transforms your academic experience with 
              intelligent resource management, AI-powered assistance, and seamless 
              collaboration tools designed specifically for St. Joseph's College students.
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