import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/src/ui/accordion";

const questions = [
  {
    header: "What is JOSH-Net and who can use it?",
    content:
      "JOSH-Net is a digital platform designed exclusively for students of St. Joseph's Degree and PG College. It helps you access study materials, get AI assistance, track your academic performance, and connect with classmates. All enrolled students can use the platform with their college email.",
  },
  {
    header: "How do I access study materials and lecture notes?",
    content:
      "Go to the Materials section from your dashboard. You'll find materials organized by your course, year, semester, and subject. You can view files online, download individual documents, or download entire folders at once. Everything is stored safely and available whenever you need it.",
  },
  {
    header: "What is Josephine and how can it help me?",
    content:
      "Josephine is your AI study assistant, available 24/7 to help with academic questions. You can ask about any subject, upload study materials for help understanding them, get study tips, and receive instant answers to your coursework questions. All your conversations are saved so you can refer back to them anytime.",
  },
  {
    header: "How do I check my attendance and exam results?",
    content:
      "Your attendance and exam results are automatically updated from the college system. Visit the Attendance page to see your attendance for each subject with easy-to-read charts. Your exam marks, semester grades, and overall performance are displayed in a simple dashboard that's easy to understand.",
  },
  {
    header: "Can I chat with my classmates on JOSH-Net?",
    content:
      "Yes! You can create or join different groups called 'servers' for your class, department, or projects. Inside servers, you can chat in real-time, share files, react to messages, and reply to specific messages. You can also add friends and send them private messages directly.",
  },
  {
    header: "Is my information safe on JOSH-Net?",
    content:
      "Yes, your data is completely secure. We use strong security measures to protect your personal information and academic records. Only you can access your account, and all your files are stored safely. We take your privacy very seriously.",
  },
  {
    header: "How do I reset my password if I forget it?",
    content:
      "Click 'Forgot Password' on the login page. You'll receive a verification code at your college email. Enter this code, then create a new password. If you have trouble, email our support team at pjain.work@proton.me for help.",
  },
  {
    header: "Can I use JOSH-Net on my phone?",
    content:
      "Yes! JOSH-Net works perfectly on phones, tablets, and computers. You can access all features—including Josephine, study materials, chat, and your academic records—from any device through your web browser. Mobile apps are coming soon!",
  },
];

export default function FAQ(props: {
  setRef: (key: string, node: HTMLElement | null) => void;
}) {
  return (
    <section
      className="py-8 sm:py-12 md:py-16 lg:py-20"
      ref={(node: HTMLDivElement | null) => props.setRef("FAQ", node)}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-none sm:max-w-4xl lg:max-w-3xl mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 sm:mb-3 md:mb-4 leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
            Find answers to common questions about using JOSH-Net.
          </p>
        </div>
        <Accordion
          type="single"
          collapsible
          className="w-full max-w-4xl"
          defaultValue="item-0"
        >
          {questions.map(
            (obj: { header: string; content: string }, index: number) => {
              return (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-left text-base sm:text-lg md:text-xl">
                    {obj.header}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {obj.content}
                  </AccordionContent>
                </AccordionItem>
              );
            }
          )}
        </Accordion>
      </div>
    </section>
  );
}