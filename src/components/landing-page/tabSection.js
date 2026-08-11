"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Building2,
  MonitorPlay,
  Brain,
  ClipboardCheck,
  FileText,
  Users,
  BarChart3,
  Clock3,
  Route,
  BookOpenCheck,
} from "lucide-react";

function TabSection() {
  const [activeTab, setActiveTab] = useState("institutes");

  const Tabs = [
    {
      id: "institutes",
      label: "Institutes",
      icon: <Building2 size={18} />,
    },
    // {
    //   id: "Faculty",
    //   label: "Faculty",
    //   icon: <MonitorPlay size={18} />,
    // },
    {
      id: "MyCareerGuru",
      label: "MyCareerGuru",
      icon: <Brain size={18} />,
    },
  ];

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

    MyCareerGuru: {
      title: "AI Powered Learning Platform for Students",
      description:
        "Boost productivity and exam preparation with Pomodoro learning, AI roadmaps, homework help, and smart practice tools.",

      image: "/pics/student.png",

      features: [
        {
          icon: <Clock3 size={22} />,
          title: "Pomodoro Learning",
          desc: "Stay focused and productive with AI-powered Pomodoro study sessions.",
        },
        {
          icon: <Route size={22} />,
          title: "Personalized Roadmap",
          desc: "Get customized learning paths based on your goals and performance.",
        },
        {
          icon: <BookOpenCheck size={22} />,
          title: "Best for Exam Preparation",
          desc: "Practice smartly with mock tests, AI revision, and preparation strategies.",
        },
        {
          icon: <Brain size={22} />,
          title: "Homework & Practice Help",
          desc: "Solve doubts, practice questions, and improve understanding instantly.",
        },
      ],
    },
  };

  return (
    <section id="aboutus" className="relative overflow-hidden bg-gradient-to-br from-amber-100 via-orange-100 to-orange-200 py-24">
      {/* Soft Background Blurs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-orange-100 blur-3xl rounded-full opacity-60"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gray-200 blur-3xl rounded-full opacity-70"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        {/* Heading */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
            bg-orange-100 border border-orange-200 text-orange-600 text-sm font-medium"
          >
            ✨ One Platform For Everyone
          </div>

          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mt-6 leading-tight">
            Built For
            <span className="block text-orange-500">Modern Education</span>
          </h2>

          <p className="text-gray-600 text-lg mt-6 max-w-3xl mx-auto leading-relaxed">
            Whether you are an institute, tutor, or self-learner, grAdelytics
            provides AI-powered tools to simplify teaching, evaluation, and
            learning.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-5 mb-10">
          {Tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-7 py-4 rounded-2xl text-sm font-semibold transition-all duration-300
                            
                    ${
                      activeTab === tab.id
                        ? "bg-orange-500 text-white shadow-2xl scale-105"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-orange-50 hover:border-orange-200"
                    }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Layout */}
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left Image */}
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

          {/* Right Content */}
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TabSection;
