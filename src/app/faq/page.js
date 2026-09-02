import Navbar from "@/components/landing-page/navbar";
import Footer from "@/components/landing-page/footer";
import FaqAccordion from "./FaqAccordion";
import { faqSections } from "./faqData";

export const metadata = {
  title: "FAQ — Gradelytics",
  description:
    "Answers about Gradelytics: AI-assisted question papers and answer-script evaluation, results and transcripts, CO-PO analysis, learning roadmaps, roles and responsible use.",
};

// FAQPage structured data. Google removed the FAQ rich result in May 2026,
// but the markup is still parsed for page understanding and is used by AI
// answer engines (AI Overviews, ChatGPT, Perplexity) to extract and cite
// answers.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqSections.flatMap((sec) =>
    sec.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    }))
  ),
};

export default function FaqPage() {
  return (
    <main className="w-full overflow-hidden bg-white text-[#24282c]">
      <Navbar />

      <div className="h-[1px] w-full bg-[#f1f5f5]">
        <div className="mx-auto h-[1px] w-[80%] bg-[#b5c7ca]" />
      </div>

      <section className="w-full bg-amber-50 px-4 py-10 sm:px-8 lg:px-24 xl:px-40">
        <h1 className="text-3xl font-medium text-orange-500 sm:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-2 text-gray-500">
          Product overview — what Gradelytics does and how to use it responsibly.
        </p>
      </section>

      <section className="w-full bg-amber-50 px-4 py-10 text-lg sm:px-8 lg:px-24 xl:px-40">
        <FaqAccordion sections={faqSections} />
      </section>

      <section className="w-full bg-amber-50 px-4 py-10 sm:px-8 lg:px-24 xl:px-40">
        <p className="text-lg">
          Have more questions?{" "}
          <a href="/contact-us" className="text-[#0068b3] underline">
            Contact our team
          </a>
        </p>
      </section>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </main>
  );
}
