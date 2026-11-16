// File: app/(main)/faq/faq-accordion.tsx
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqGroup {
  group: string;
  items: FaqItem[];
}

export function FaqAccordion({ groups }: { groups: FaqGroup[] }) {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({
    "0-0": true, // First item open by default
  });

  function toggle(id: string) {
    setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="space-y-8">
      {groups.map((group, gIndex) => (
        <div key={group.group} className="space-y-3">
          <h2 className="text-xl font-bold text-foreground border-b border-border pb-2">
            {group.group}
          </h2>

          <div className="space-y-2.5">
            {group.items.map((item, iIndex) => {
              const id = `${gIndex}-${iIndex}`;
              const isOpen = !!openMap[id];

              return (
                <div
                  key={item.q}
                  className="rounded-xl border border-border bg-card overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggle(id)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-sm sm:text-base hover:text-primary transition-colors"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/50">
                      <p className="pt-3">{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
