"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Accordion({
  items,
  className,
}: {
  items: { question: string; answer: string }[];
  className?: string;
}) {
  return (
    <AccordionPrimitive.Root
      type="single"
      collapsible
      className={cn("space-y-2", className)}
    >
      {items.map((item, i) => (
        <AccordionPrimitive.Item
          key={i}
          value={`item-${i}`}
          className="border border-white/10 rounded-[12px] overflow-hidden bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-md transition-colors duration-200 hover:border-[#04a891]/40"
        >
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-white font-semibold text-base cursor-pointer data-[state=open]:text-[#04a891] transition-colors duration-200">
              {item.question}
              <ChevronDown
                className="h-4 w-4 shrink-0 text-white/40 transition-transform duration-300 group-data-[state=open]:rotate-180 group-data-[state=open]:text-[#04a891]"
                strokeWidth={2}
              />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="overflow-hidden data-[state=open]:animate-[accordionOpen_200ms_ease-out] data-[state=closed]:animate-[accordionClose_200ms_ease-out]">
            <p className="px-6 pb-5 text-sm text-white/65 leading-relaxed">
              {item.answer}
            </p>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}
