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

      <section className="w-full bg-amber-50 px-4 pt-28 pb-10 sm:px-8 lg:px-24 xl:px-40">
        <h1 className="text-4xl font-bold text-[#0d3b4a] sm:text-5xl">
          Frequently Asked{" "}
          <span className="text-orange-500">Questions</span>
        </h1>
        <p className="mt-3 text-gray-500 text-base max-w-2xl">
          Product overview — what grAdelytics does and how to use it responsibly.
        </p>
      </section>

      <section className="w-full bg-amber-50 px-4 py-10 text-lg sm:px-8 lg:px-24 xl:px-40">
        <FaqAccordion sections={faqSections} />
      </section>

      <section className="w-full bg-amber-50 px-4 py-10 sm:px-8 lg:px-24 xl:px-40">
        <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-orange-50 border border-orange-200">
          <span className="text-2xl">💬</span>
          <p className="text-base text-gray-700">
            Have more questions?{" "}
            <a href="/contact-us" className="text-orange-500 font-semibold hover:underline">
              Contact our team
            </a>
          </p>
        </div>
      </section>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </main>
  );
}
