"use client";

import Image from "next/image";
import Reveal from "./Reveal";
import { FileText, ClipboardCheck, Users, BarChart3 } from "lucide-react";

function TabSection() {
  const activeTab = "institutes";

  const tabData = {
    institutes: {
      title: "Smart Digital Campus Ecosystem",
      description:
        "From question paper to final grade - automate every step of your academic workflow with grAdelytics that thinks like an educator.",

      image: "/pics/institute.png",

      features: [
         {
          icon: <FileText size={22} />,
          title: "Question Paper Generation",
          desc: "Stop spending hours on paper setting. Generate syllabus-mapped, Bloom's-aligned question papers in seconds.",
        },
        {
          icon: <ClipboardCheck size={22} />,
          title: "AI-Powered Evaluation of Answers Sheets",
          desc: "Grade smarter, not harder - AI reads, scores, and delivers detailed feedback on answer sheets instantly.",
        },

        {
          icon: <BarChart3 size={22} />,
          title: "Smart CO-PO Attainment Analysis",
          desc: "Turn raw scores into accreditation-ready CO-PO reports with visual attainment dashboards.",
        },
        
        {
          icon: <Users size={22} />,
          title: "Transcripts, and Certificates Generation",
          desc: "Auto-calculate SGPA, CGPA, and generate verified transcripts and certificates - error-free, every time.",
        },
      ],
    },

    // onlineTutors: {
    //   title: "Smart Platform for Online Tutors",
    //   description:
    //     "Run your entire online tutoring business with AI tools, live classes, analytics, and automated content generation.",

    //   image: "/pics/tutor.png",

    //   features: [
    //     {
    //       icon: <FileText size={22} />,
    //       title: "Generate Tests & Notes",
    //       desc: "Create assignments, tests, and AI-generated study notes in seconds.",
    //     },
    //     {
    //       icon: <MonitorPlay size={22} />,
    //       title: "Live Interactive Classroom",
    //       desc: "Conduct engaging online classes with live sessions and student interaction.",
    //     },
    //     {
    //       icon: <BarChart3 size={22} />,
    //       title: "AI Powered Analytics",
    //       desc: "Track student performance, engagement, and learning growth with smart insights.",
    //     },
    //     {
    //       icon: <Users size={22} />,
    //       title: "Complete Tuition Platform",
    //       desc: "Manage students, batches, schedules, and learning content from one dashboard.",
    //     },
    //   ],
    // },
  };

  return (
    <section id="aboutus" className="relative overflow-hidden bg-gradient-to-br from-amber-100 via-orange-100 to-orange-200 py-24">
      {/* Soft Background Blurs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-orange-100 blur-3xl rounded-full opacity-60"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gray-200 blur-3xl rounded-full opacity-70"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        {/* Heading */}
        <Reveal>
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
            bg-orange-100 border border-orange-200 text-orange-600 text-sm font-medium"
          >
            One Platform for Examinations to Academic Intelligence
          </div>

          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mt-6 leading-tight">
            Built For
            <span className="block text-orange-500">Modern Education</span>
          </h2>
        </div>

        </Reveal>

        {/* Content Layout */}
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left Image */}
          <Reveal>
          <div className="relative">
            {/* Floating Badge */}
            <div
              className="absolute -top-8 -left-10 hidden md:flex items-center gap-2 px-5 py-3 rounded-2xl 
                bg-orange/80 backdrop-blur-xl border border-orange-500 shadow-2xl z-20"
            >
              <span className="text-lg">✨</span>

              <p className="text-sm font-medium text-gray-700">
                AI Powered Learning Ecosystem
              </p>
            </div>

            {/* Image Container */}
            <div
              className="overflow-hidden rounded-3xl 
               shadow-2xl shadow-black "
            >
              <Image
                src={tabData[activeTab].image}
                alt="tab-image"
                width={700}
                height={600}
                className="w-full h-[500px] object-cover rounded-2xl"
              />
            </div>
          </div>

          </Reveal>

          {/* Right Content */}
          <Reveal delay={0.15}>
          <div>
            <h2 className="text-5xl font-extrabold text-gray-900 leading-tight">
              {tabData[activeTab].title}
            </h2>

            <p className="text-gray-600 text-lg leading-relaxed mt-6">
              {tabData[activeTab].description}
            </p>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-5 mt-10">
              {tabData[activeTab].features.map((feature, index) => (
                <Reveal key={index} delay={0.1 * index} className="h-full">
                <div
                  key={index}
                  className="p-5 rounded-3xl bg-white border border-gray-200 
                            shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
                >
                  <div
                    className="w-12 h-12 rounded-2xl bg-orange-500 
                            flex items-center justify-center text-white shadow-lg"
                  >
                    {feature.icon}
                  </div>

                  <h3 className="text-gray-900 font-bold text-lg mt-5">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed mt-3">
                    {feature.desc}
                  </p>
                </div>
                </Reveal>
              ))}
            </div>

            {/* External CTA — only shown for tabs that have a ctaLink */}
            {tabData[activeTab].ctaLink && (
              <div className="mt-10">
                <a
                  href={tabData[activeTab].ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-orange-500 text-white font-semibold text-sm shadow-lg hover:bg-orange-600 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                >
                  {tabData[activeTab].ctaLabel}
                </a>
              </div>
            )}
          </div>
          </Reveal>
        </div>
        {/* Why institutions choose grAdelytIcs */}
        <Reveal>
        <h3 className="text-gray-900 text-3xl md:text-4xl font-extrabold text-center mt-24 mb-10">
          Why institutions choose grAdelytIcs
        </h3>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { title: "Faster Evaluation", desc: "Reduce repetitive evaluation effort and accelerate result processing." },
            { title: "Consistent Evaluation", desc: "Evaluate against faculty-defined rubrics and marking schemes." },
            { title: "Faculty in Control", desc: "AI assists; faculty review, modify and approve." },
            { title: "Transparent and Auditable", desc: "Maintain an evaluation trail from script to final marks." },
            { title: "Academic Intelligence", desc: "Move beyond marks to question-, course- and programme-level insights." },
            { title: "Outcome-Based", desc: "Connect assessment to CO/PO attainment and academic improvement." },
            { title: "Accreditation Ready", desc: "Turn assessment data into evidence for OBE, NBA, NAAC and other accreditations." },
          ].map(({ title, desc }, idx) => (
            <Reveal key={title} delay={(idx % 3) * 0.12} className="h-full">
            <div
              className="h-full p-6 rounded-3xl bg-white border border-gray-200 shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
            >
              <h3 className="text-gray-900 font-bold text-lg">{title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mt-3">{desc}</p>
            </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TabSection;
