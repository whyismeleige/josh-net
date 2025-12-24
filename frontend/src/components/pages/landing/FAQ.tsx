import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/src/ui/accordion";

const questions = [
  {
    header: "How can I contact support if I face an issue while traveling?",
    content:
      "You can reach our dedicated incident response team by emailing support@email.com or calling our 24/7 toll-free helpline. Our teamis always ready to assist you promptly",
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
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 sm:mb-3 md:mb-4 leading-tight">
          Frequently Asked Questions
        </h2>
        <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue="item-1"
        >
          {questions.map(
            (obj: { header: string; content: string }, index: number) => {
              return (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-xl sm:text-l">
                    {obj.header}
                  </AccordionTrigger>
                  <AccordionContent>{obj.content}</AccordionContent>
                </AccordionItem>
              );
            }
          )}
        </Accordion>
      </div>
    </section>
  );
}
