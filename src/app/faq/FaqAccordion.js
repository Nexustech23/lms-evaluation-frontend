"use client";

import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";

// Accordion for the FAQ page. One answer open at a time. Rows are real
// <button>s with aria-expanded / aria-controls so keyboard and
// screen-reader users can operate them.
export default function FaqAccordion({ sections }) {
  const [openKey, setOpenKey] = useState(null);
  const toggle = (key) => setOpenKey((cur) => (cur === key ? null : key));

  return (
    <div className="flex flex-col gap-12">
      {sections.map((sec, si) => (
        <section key={sec.section}>
          <h2 className="text-2xl font-semibold text-black">{sec.section}</h2>
          <p className="mt-1 mb-2 text-base text-gray-500">{sec.blurb}</p>

          <div className="border-t border-orange-300">
            {sec.items.map((item, ii) => {
              const key = `${si}-${ii}`;
              const isOpen = openKey === key;
              return (
                <div key={item.q} className="border-b border-orange-300">
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${key}`}
                    className="flex w-full items-center justify-between gap-4 py-6 text-left"
                  >
                    <span className="text-lg font-medium text-black sm:text-xl">
                      {item.q}
                    </span>
                    <IconChevronDown
                      className={`h-5 w-5 shrink-0 text-orange-500 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <p
                      id={`faq-panel-${key}`}
                      className="pb-6 leading-8 text-[#4b4b4b]"
                    >
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
