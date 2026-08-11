"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./navbar";
import Footer from "./footer";

const testimonials = [
  {
    quote:
      "grAdelytics has changed how our faculty evaluate answer scripts. Once the rubrics are set, grading becomes faster, clearer, and much easier to review.",
    name: "Armando Fox",
    school: "UC Berkeley",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    quote:
      "I think grAdelytics has been a joy to use and it has saved the evaluation team several days of work.",
    name: "Henry Gardner",
    school: "Australian National University",
    fallback: true,
  },
  {
    quote:
      "grAdelytics has transformed our exam workflow. It makes grading, reviewing, and exporting reports much easier.",
    name: "Ileana Blade",
    school: "University of Barcelona",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
  },
];

const Avatar = ({ image, fallback, className = "" }) => (
  <div
    className={`mx-auto h-[148px] w-[148px] overflow-hidden rounded-full bg-[#356f76] shadow-sm ${className}`}
  >
    {fallback ? (
      <div className="relative h-full w-full">
        <div className="absolute left-1/2 top-11 h-11 w-11 -translate-x-1/2 rounded-full border-2 border-white" />
        <div className="absolute bottom-0 left-1/2 h-[62px] w-[54px] -translate-x-1/2 rounded-t-full bg-[#76c6fb]" />
      </div>
    ) : (
      <img src={image} alt="" className="h-full w-full object-cover" />
    )}
  </div>
);

const QuoteCard = ({ item }) => (
  <div className="relative">
    <div className="bg-[#f0f4f4] px-8 py-12 text-left rounded-2xl">
      <p className="text-[18px] font-[500] leading-[1.45] tracking-[0.04em] text-[#003c46]">
        "{item.quote}"
      </p>

      <div className="mt-[50px]">
        <p className="text-[18px] font-bold text-[#343434]">{item.name}</p>

        <p className="text-[18px] font-light text-[#343434]">{item.school}</p>
      </div>
    </div>

    <Avatar image={item.image} fallback={item.fallback} className="-mt-3" />
  </div>
);

const Demo = () => {
  const router = useRouter();

  const [activeVideoTab, setActiveVideoTab] = useState("institute");

const videoData = {
  institute: [
    {
      url: "/videos/video1.mp4",
      title: "CO-PO Analytics",
      description:
        "Automatically generate CO-PO mappings, attainment reports, and outcome-based insights for accreditation and academic planning.",
    },

    {
      url: "/videos/video2.mp4",
      title: "AI Evaluation System",
      description:
        "Evaluate answer sheets instantly using AI-powered grading with dynamic rubrics, feedback generation, and smart moderation tools.",
    },

    {
      url: "/videos/video3.mp4",
      title: "Question Paper Generator",
      description:
        "Create balanced question papers in seconds with Bloom’s Taxonomy support, difficulty distribution, and syllabus mapping.",
    },
  ],

  tutor: [
    {
      url: "/videos/video1.mp4",
      title: "AI Test Creation",
      description:
        "Generate quizzes, assignments, and practice tests automatically from notes, PDFs, topics, or uploaded materials.",
    },

    {
      url: "/videos/video2.mp4",
      title: "Smart Test Evaluation",
      description:
        "Analyze student answers instantly with AI-assisted grading, feedback suggestions, and performance-based insights.",
    },

    {
      url: "/videos/video3.mp4",
      title: "Batch Performance Analytics",
      description:
        "Track class progress, identify weak topics, monitor attendance trends, and generate detailed batch-wise analytics reports.",
    },
  ],

  student: [
    {
      url: "/videos/video1.mp4",
      title: "AI Pomodoro Learning",
      description:
        "Stay focused with smart Pomodoro sessions that combine study timers, AI-generated tests, and personalized revision workflows.",
    },

    {
      url: "/videos/video2.mp4",
      title: "Roadmap Generation",
      description:
        "Generate personalized learning roadmaps based on your goals, syllabus, strengths, weaknesses, and exam timelines.",
    },

    {
      url: "/videos/video3.mp4",
      title: "Homework Help & Practice",
      description:
        "Get instant AI assistance for homework, concept explanations, adaptive practice questions, and step-by-step problem solving.",
    },
  ],
};

  const handleScheduleNowClick = () => {
    router.push("/contact-us");
  };

  const handleGetStartedForFreeClick = () => {
    router.push("/contact-us");
  };

  return (
    <main className="w-full overflow-hidden bg-white text-[#24282c]">
      <Navbar />

      <div className="w-full h-[1px] bg-[#f1f5f5]">
        <div className="w-[80%] h-[1px] bg-[#b5c7ca] mx-auto"></div>
      </div>

      {/* HERO */}
      <section className="bg-[#f1f5f5] px-6 sm:px-10 lg:px-16 pb-16 pt-5">
        <div className="mx-auto grid max-w-[1760px] grid-cols-1 items-center gap-10 pt-10 lg:grid-cols-[50%_50%]">
          <div>
            <h1 className="text-[42px] sm:text-[55px] lg:text-[60px] font-[500] text-[#0d3b4a] mb-6 leading-tight">
              Get a Demo
            </h1>

            <p className="mt-10 max-w-[900px] text-[20px] font-light leading-[1.35] text-[#60666b]">
              Discover why institutions use grAdelytics to evaluate answers
              faster, generate outcome reports, and never go back to grading the
              old way.
            </p>

            <button
              className="mt-12 rounded-lg bg-[#ff7f10] px-6 py-3 text-[18px] font-medium text-[#ffffff] transition hover:bg-[#e67e00] hover:-translate-y-0.5 hover:shadow-lg"
              onClick={handleScheduleNowClick}
            >
              Schedule a Demo
            </button>
          </div>

          <img src="/pics/demopage1.png" className="h-[350px] object-contain" />
        </div>
      </section>

      {/* VIDEO SHOWCASE */}
      <section className="w-full py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          {/* Heading */}
          <div className="text-center mb-14">
            <p className="text-[#ff7f10] font-semibold mb-3">
              PLATFORM WALKTHROUGH
            </p>

            <h2 className="text-5xl font-[600] text-[#0d3b4a] mb-5">
              Explore grAdelytics
            </h2>

            <p className="text-gray-600 text-xl max-w-3xl mx-auto">
              Watch how Institutes, Tutors, and Students use grAdelytics to
              automate workflows, improve learning, and save time.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-12">
            <div className="bg-[#fff7f0] border border-orange-100 rounded-2xl p-2 flex gap-3 shadow-lg">
              {["institute", "tutor", "student"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveVideoTab(tab)}
                  className={`px-8 py-4 rounded-xl font-semibold capitalize transition-all duration-500 ${
                    activeVideoTab === tab
                      ? "bg-[#ff7f10] text-white shadow-xl scale-105"
                      : "text-[#0d3b4a] hover:bg-orange-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* SLIDER */}
          <div className="w-full overflow-hidden">
            <div
              className="flex transition-transform duration-700 py-10 ease-in-out"
              style={{
                transform:
                  activeVideoTab === "institute"
                    ? "translateX(0%)"
                    : activeVideoTab === "tutor"
                      ? "translateX(-100%)"
                      : "translateX(-200%)",
              }}
            >
              {/* INSTITUTE */}
              <div className="min-w-full px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {videoData.institute.map((video, index) => (
                    <div
                      key={index}
                      className="bg-[#fffaf5] rounded-3xl shadow-xl overflow-hidden border border-orange-100 hover:-translate-y-2 transition-all duration-300"
                    >
                      <video controls className="w-full h-[420px] object-cover">
                        <source src={video.url} type="video/mp4" />
                      </video>

                      <div className="p-6">
                        <h3 className="text-2xl font-semibold text-orange-500 mb-3">
                           {video.title}
                        </h3>

                        <p className="text-black">{video.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TUTOR */}
              <div className="min-w-full px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {videoData.tutor.map((video, index) => (
                    <div
                      key={index}
                      className="bg-[#fffaf5] rounded-3xl shadow-xl overflow-hidden border border-orange-100 hover:-translate-y-2 transition-all duration-300"
                    >
                      <video controls className="w-full h-[420px] object-cover">
                        <source src={video.url} type="video/mp4" />
                      </video>

                      <div className="p-6">
                        <h3 className="text-2xl font-semibold text-orange-500 mb-3">
                           {video.title}
                        </h3>

                        <p className="text-black">{video.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* STUDENT */}
              <div className="min-w-full px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {videoData.student.map((video, index) => (
                    <div
                      key={index}
                      className="bg-[#fffaf5] rounded-3xl shadow-xl overflow-hidden border border-orange-100 hover:-translate-y-2 transition-all duration-300"
                    >
                      <video controls className="w-full h-[420px] object-cover">
                        <source src={video.url} type="video/mp4" />
                      </video>

                      <div className="p-6">
                        <h3 className="text-2xl font-semibold text-orange-500  mb-3">
                         {video.title}
                        </h3>

                        <p className="text-black">{video.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="grid grid-cols-1 gap-7 px-[70px] py-14 lg:grid-cols-3 items-center">
        {testimonials.map((item) => (
          <QuoteCard key={item.name} item={item} />
        ))}
      </section>

      {/* CTA */}
      <section className="px-[72px] py-20">
        <div className="mx-auto grid max-w-[1760px] grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_520px]">
          <div>
            <h2 className="max-w-[850px] text-[35px] font-semibold leading-tight text-[#004653]">
              Are you an instructor?
              <br />
              Get started with grAdelytics today!
            </h2>

            <p className="mt-10 text-[18px] font-light text-[#646a70]">
              Save time grading and spend more time teaching. Start your
              institution-ready evaluation workflow.
            </p>

            <button
              className="mt-12 rounded-lg bg-[#ff7f10] px-6 py-3 text-[18px] font-medium text-[#ffffff] transition hover:bg-[#e67e00] hover:-translate-y-0.5 hover:shadow-lg"
              onClick={handleGetStartedForFreeClick}
            >
              Get Started
            </button>
          </div>

          <div>
            <img src="/pics/demopage3.png" className="w-full" />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Demo;
