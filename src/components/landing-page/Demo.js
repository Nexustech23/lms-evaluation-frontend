"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./navbar";
import Footer from "./footer";

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
        url: "/videos/student1.mp4",
        title: "AI Pomodoro Learning",
        description:
          "Stay focused with smart Pomodoro sessions that combine study timers, AI-generated tests, and personalized revision workflows.",
      },
      {
        url: "/videos/student2.mp4",
        title: "Roadmap Generation",
        description:
          "Generate personalized learning roadmaps based on your goals, syllabus, strengths, weaknesses, and exam timelines.",
      },
      {
        url: "/videos/student3.mp4",
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
      <section className="bg-gradient-to-b from-[#f1f5f5] to-white px-6 sm:px-10 lg:px-16 pb-16 pt-5">
        <div className="mx-auto grid max-w-[1760px] grid-cols-1 items-center gap-10 pt-10 lg:grid-cols-[50%_50%]">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-[#ff7f10] text-sm font-semibold mb-5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#ff7f10] animate-pulse"></span>
              Institutional & Learning Demo
            </div>

            <h1 className="text-[42px] sm:text-[55px] lg:text-[60px] font-[600] text-[#0d3b4a] mb-6 leading-tight">
              Get a Demo
            </h1>

            <p className="mt-4 max-w-[900px] text-[19px] font-normal leading-relaxed text-[#60666b]">
              Discover why top institutions use grAdelytics to evaluate answers
              faster, generate outcome reports, and elevate student achievement.
            </p>

            {/* Premium Educational CTA Button */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                className="group inline-flex items-center gap-3.5 rounded-full bg-gradient-to-r from-[#ff7f10] via-orange-500 to-amber-500 px-8 py-4 text-[17px] font-semibold text-white shadow-[0_10px_25px_rgba(255,127,16,0.38)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_14px_35px_rgba(255,127,16,0.5)] active:scale-[0.98] border border-white/20"
                onClick={handleScheduleNowClick}
              >
                <span>Schedule a Demo</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <img src="/pics/demopage1.png" className="h-[350px] object-contain drop-shadow-md" alt="Demo Illustration" />
          </div>
        </div>
      </section>

      {/* VIDEO SHOWCASE */}
      <section className="w-full py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          {/* Heading */}
          <div className="text-center mb-12">
            <p className="text-[#ff7f10] font-semibold mb-2.5 tracking-wide text-sm uppercase">
              PLATFORM WALKTHROUGH
            </p>

            <h2 className="text-4xl md:text-5xl font-[700] text-[#0d3b4a] mb-4">
              Explore grAdelytics
            </h2>

            <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
              Watch how Institutes, Tutors, and Students use grAdelytics to
              automate workflows, improve learning, and save time.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-10">
            <div className="bg-[#fff7f0] border border-orange-100 rounded-2xl p-1.5 flex gap-2 shadow-md">
              {["institute", "tutor", "student"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveVideoTab(tab)}
                  className={`px-7 py-3 rounded-xl font-semibold capitalize transition-all duration-300 text-sm md:text-base ${
                    activeVideoTab === tab
                      ? "bg-gradient-to-r from-[#ff7f10] to-orange-500 text-white shadow-lg scale-[1.02]"
                      : "text-[#0d3b4a] hover:bg-orange-50/80"
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
              className="flex transition-transform duration-700 py-6 ease-in-out"
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
                      className="group bg-gradient-to-b from-[#fffaf5] to-white rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden border border-orange-100/80 hover:-translate-y-2 transition-all duration-300 flex flex-col"
                    >
                      <div className="relative w-full h-[400px] bg-black/5 overflow-hidden">
                        <video
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover"
                        >
                          <source src={video.url} type="video/mp4" />
                        </video>
                        <div className="absolute top-4 left-4 pointer-events-none">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            grAdelytics • Demo
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex flex-col flex-grow justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-[#0d3b4a] group-hover:text-[#ff7f10] transition-colors mb-2.5">
                            {video.title}
                          </h3>

                          <p className="text-gray-600 text-sm leading-relaxed">
                            {video.description}
                          </p>
                        </div>
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
                      className="group bg-gradient-to-b from-[#fffaf5] to-white rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden border border-orange-100/80 hover:-translate-y-2 transition-all duration-300 flex flex-col"
                    >
                      <div className="relative w-full h-[400px] bg-black/5 overflow-hidden">
                        <video
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover"
                        >
                          <source src={video.url} type="video/mp4" />
                        </video>
                        <div className="absolute top-4 left-4 pointer-events-none">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            grAdelytics • Demo
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex flex-col flex-grow justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-[#0d3b4a] group-hover:text-[#ff7f10] transition-colors mb-2.5">
                            {video.title}
                          </h3>

                          <p className="text-gray-600 text-sm leading-relaxed">
                            {video.description}
                          </p>
                        </div>
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
                      className="group bg-gradient-to-b from-[#fffaf5] to-white rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden border border-orange-100/80 hover:-translate-y-2 transition-all duration-300 flex flex-col"
                    >
                      <div className="relative w-full h-[400px] bg-black/5 overflow-hidden">
                        <video
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover"
                        >
                          <source src={video.url} type="video/mp4" />
                        </video>
                        <div className="absolute top-4 left-4 pointer-events-none">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            grAdelytics • Learning
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex flex-col flex-grow justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-[#0d3b4a] group-hover:text-[#ff7f10] transition-colors mb-2.5">
                            {video.title}
                          </h3>

                          <p className="text-gray-600 text-sm leading-relaxed">
                            {video.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 sm:px-12 lg:px-[72px] py-16 bg-[#f8fafb]">
        <div className="mx-auto grid max-w-[1760px] grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_520px]">
          <div>
            <h2 className="max-w-[850px] text-[32px] md:text-[38px] font-bold leading-tight text-[#004653]">
              Are you an instructor or institution?
              <br />
              <span className="text-[#ff7f10]">Get started with grAdelytics today!</span>
            </h2>

            <p className="mt-5 text-[17px] font-normal leading-relaxed text-[#646a70]">
              Save time grading and spend more time teaching. Start your
              institution-ready evaluation workflow.
            </p>

            <button
              className="group mt-8 inline-flex items-center gap-3.5 rounded-full bg-gradient-to-r from-[#ff7f10] via-orange-500 to-amber-500 px-8 py-3.5 text-[16px] font-semibold text-white shadow-[0_8px_22px_rgba(255,127,16,0.35)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(255,127,16,0.45)] active:scale-[0.98] border border-white/20"
              onClick={handleGetStartedForFreeClick}
            >
              <span>Get Started</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25 transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>

          <div className="flex justify-center">
            <img src="/pics/demopage3.png" className="w-full max-w-[480px] drop-shadow-md" alt="CTA Graphic" />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Demo;
