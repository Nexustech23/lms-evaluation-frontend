"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./navbar";
import Footer from "./footer";
import Signup from "./Signup";

const Pricing = () => {
  const router = useRouter();

  const [showConsent, setShowConsent] = useState(true);
  const [activeTab, setActiveTab] = useState("institute");

  const features = [
    {
      name: "AI Answer Script Evaluation",
      description:
        "Evaluate uploaded answer scripts question-by-question with AI-generated marks, remarks, and downloadable reports.",
      icon: "🤖",
    },
    {
      name: "Dynamic Evaluation Rubrics",
      description:
        "Create question-wise marking parameters, custom rubrics, total marks, and CO-wise marks allocation.",
      icon: "📋",
    },
    {
      name: "Course Outcome Analytics",
      description:
        "Track CO attainment, CO-PO mapping, student performance, and subject-level outcome reports.",
      icon: "📊",
    },
    {
      name: "AI Question Paper Generation",
      description:
        "Generate structured question papers using Bloom’s taxonomy and smart marks distribution.",
      icon: "🧠",
    },
    {
      name: "Institution Management",
      description:
        "Manage schools, departments, batches, semesters, subjects, and faculty from one dashboard.",
      icon: "🏢",
    },
    {
      name: "Reports & Exports",
      description:
        "Download evaluated PDFs, detailed Excel reports, and archived result folders.",
      icon: "💾",
    },
  ];

  const instituteFeatures = [
    {
      feature: "AI Answer Script Evaluation",
      basic: true,
      premium: true,
    },
    {
      feature: "Evaluation Rubrics",
      basic: true,
      premium: true,
    },
    {
      feature: "Institution Dashboard",
      basic: true,
      premium: true,
    },
    {
      feature: "Batch & Subject Setup",
      basic: true,
      premium: true,
    },
    {
      feature: "CO-PO Mapping",
      basic: false,
      premium: true,
    },
    {
      feature: "CO Attainment Reports",
      basic: false,
      premium: true,
    },
    {
      feature: "AI Question Paper Generation",
      basic: false,
      premium: true,
    },
  ];

  const tutorPlans = [
    {
      duration: "1 Month",
      tokens: "25K AI Tokens",
      features: [
        "AI Evaluation",
        "Live Classroom",
        "Report Export",
      ],
    },
    {
      duration: "3 Months",
      tokens: "100K AI Tokens",
      features: [
        "AI Evaluation",
        "Live Classroom",
        "Priority AI",
      ],
    },
    {
      duration: "6 Months",
      tokens: "250K AI Tokens",
      features: [
        "Advanced Reports",
        "Live Classroom",
        "Priority Support",
      ],
    },
    {
      duration: "12 Months",
      tokens: "600K AI Tokens",
      features: [
        "Unlimited Classrooms",
        "Priority AI",
        "Premium Support",
      ],
    },
  ];

  const studentPlans = [
    {
      duration: "1 Month",
      tokens: "20K AI Tokens",
      features: [
        "Pomodoro",
        "Custom AI Feedback",
        "Practice Tests",
      ],
    },
    {
      duration: "3 Months",
      tokens: "80K AI Tokens",
      features: [
        "Pomodoro",
        "AI Feedback",
        "Study Insights",
      ],
    },
    {
      duration: "6 Months",
      tokens: "200K AI Tokens",
      features: [
        "Advanced Analytics",
        "Practice Tests",
        "AI Recommendations",
      ],
    },
    {
      duration: "12 Months",
      tokens: "500K AI Tokens",
      features: [
        "Full Learning Suite",
        "AI Mentor",
        "Premium Insights",
      ],
    },
  ];

  const handleContactClick = () => {
    router.push("/contact-us");
  };

  const handleDemoClick = () => {
    router.push("/get-a-demo");
  };

  const handleTalkClick = () => {
    router.push("/contact-us");
  };

  const handleGetStarted = () => {
    document.getElementById("get-started-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleConsent = (accepted) => {
    setShowConsent(false);

    if (accepted) {
      console.log("Cookies accepted");
    } else {
      console.log("Cookies rejected");
    }
  };

  return (
    <div className="w-full overflow-x-hidden bg-white">
      <Navbar />

      <div className="w-full h-[1px] bg-[#f1f5f5]">
        <div className="w-[80%] h-[1px] bg-[#b5c7ca] mx-auto"></div>
      </div>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-b from-[#fff7f0] via-[#fff4e8] to-white px-6 sm:px-10 lg:px-16 py-14 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[50%_50%] gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
          
          <div className="order-2 lg:order-1 animate-in fade-in slide-in-from-left-10 duration-800 delay-200 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-[#ff7f10] font-semibold text-sm mb-5">
              ✨ AI Powered Academic Platform
            </div>

            <h1 className="text-[42px] sm:text-[55px] lg:text-[64px] font-[600] text-[#0d3b4a] mb-6 leading-tight">
              grAdelytics
              <br />
              for Everyone
            </h1>

            <p className="text-base sm:text-lg lg:text-[19px] text-[#575757] font-light mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Streamline evaluation workflows, automate academic reporting,
              enable CO-PO analytics, generate AI question papers, and empower
              students & tutors with smart learning tools.
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              
              <button
                onClick={handleContactClick}
                className="px-8 sm:px-10 py-4 bg-[#ff7f10] text-white font-bold rounded-2xl hover:bg-[#e67e00] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                Contact Us
              </button>

              <button
                onClick={handleGetStarted}
                className="px-8 sm:px-10 py-4 border-2 border-[#ff7f10] text-[#ff7f10] font-bold rounded-2xl hover:bg-orange-50 transition-all duration-300"
              >
                Get Started
              </button>
            </div>
          </div>

          <div className="order-1 lg:order-2 animate-in fade-in slide-in-from-right-10 duration-800 delay-400 flex justify-center">
            <img
              src="/pics/dashbord.png"
              alt="Dashboard Mockup"
              className="w-full max-w-[700px] h-auto drop-shadow-2xl"
            />
          </div>
        </div>
      </section>


      {/* PRICING */}
      <section
        id="pricing"
        className="lg:px-16 md:px-10 sm:px-6 px-6 py-16 bg-gradient-to-b from-orange-50 via-[#fff7f0] to-white"
      >
        <div className="text-center mb-14">
          
          <p className="text-[#ff7f10] font-semibold mb-3">
            FLEXIBLE PRICING
          </p>

          <h2 className="text-4xl font-[600] text-[#0d3b4a] mb-5">
            Pricing for Everyone
          </h2>

          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Choose dedicated plans for Institutes, Tutors, and Students.
            Institutes use a pay-after-usage model, while Tutors and
            Students purchase AI tokens in advance.
          </p>
        </div>

        {/* TABS */}
        <div className="flex justify-center mb-10">
          <div className="bg-white border border-orange-100 rounded-2xl p-2 flex gap-2 shadow-lg">
            
            {["institute", "tutor", "student"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-semibold capitalize transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-[#ff7f10] text-white shadow-lg"
                    : "text-[#0d3b4a] hover:bg-orange-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* INSTITUTE */}
        {activeTab === "institute" && (
          <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl border border-orange-100 overflow-hidden">

            <div className="grid grid-cols-3 bg-gradient-to-r from-[#ff7f10] to-[#ff9a3d] text-white p-6 font-bold text-center">
              <div className="text-left">Features</div>
              <div>Basic</div>
              <div>Premium</div>
            </div>

            {instituteFeatures.map((item, index) => (
              <div
                key={index}
                className={`grid grid-cols-3 p-5 border-b border-orange-100 items-center ${
                  index % 2 === 0 ? "bg-white" : "bg-orange-50/40"
                }`}
              >
                <div className="font-medium text-[#0d3b4a]">
                  {item.feature}
                </div>

                <div className="text-center">
                  {item.basic ? (
                    <span className="text-green-500 text-2xl">✓</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </div>

                <div className="text-center">
                  {item.premium ? (
                    <span className="text-[#ff7f10] text-2xl">★</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </div>
              </div>
            ))}

            <div className="p-6 bg-orange-50">
              <p className="text-[#0d3b4a] font-semibold mb-2">
                Institute Pricing Model
              </p>

              <p className="text-gray-600">
                Institutes follow a
                <span className="font-semibold text-[#ff7f10]">
                  {" "}Use First, Pay Later{" "}
                </span>
                model based on active users, AI usage, and enabled premium features.
              </p>
            </div>
          </div>
        )}

        {/* TUTOR */}
        {activeTab === "tutor" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {tutorPlans.map((plan, index) => (
              <div
                key={index}
                className="bg-white border border-orange-100 rounded-3xl p-8 shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <h3 className="text-2xl font-bold text-[#0d3b4a] mb-2">
                  {plan.duration}
                </h3>

                <p className="text-[#ff7f10] font-semibold mb-6">
                  {plan.tokens}
                </p>

                <div className="flex flex-col gap-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-600">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="bg-orange-50 rounded-2xl p-4 text-sm text-gray-600">
                  Pay first and receive AI tokens valid for the selected duration.
                  AI services stop once tokens expire.
                </div>

                <button
                  onClick={handleGetStarted}
                  className="w-full mt-6 py-3 bg-[#ff7f10] text-white rounded-xl font-semibold hover:bg-[#e67100] transition-all"
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        )}

        {/* STUDENT */}
        {activeTab === "student" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {studentPlans.map((plan, index) => (
              <div
                key={index}
                className="bg-white border border-orange-100 rounded-3xl p-8 shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <h3 className="text-2xl font-bold text-[#0d3b4a] mb-2">
                  {plan.duration}
                </h3>

                <p className="text-[#ff7f10] font-semibold mb-6">
                  {plan.tokens}
                </p>

                <div className="flex flex-col gap-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-600">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="bg-orange-50 rounded-2xl p-4 text-sm text-gray-600">
                  Purchase tokens first and use them for AI-powered learning,
                  Pomodoro sessions, and custom feedback.
                </div>

                <button
                  onClick={handleGetStarted}
                  className="w-full mt-6 py-3 bg-[#ff7f10] text-white rounded-xl font-semibold hover:bg-[#e67100] transition-all"
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* INFO SECTION */}
      <section className="bg-white px-6 sm:px-10 lg:px-16 py-20">
        <div className="grid grid-cols-1 md:grid-cols-[35%_65%] gap-12 items-center max-w-7xl mx-auto">

          <div>
            <img
              src="/pics/dashbord2.png"
              className="h-full w-full object-contain drop-shadow-2xl"
            />
          </div>

          <div className="flex flex-col gap-4">
            
            <p className="text-[#ff7f10] font-semibold">
              GET STARTED
            </p>

            <h1 className="text-[38px] font-[600] text-[#0d3b4a] leading-tight">
              Learn More About grAdelytics
            </h1>

            <p className="text-[#575757] font-light text-[18px] leading-relaxed">
              Whether you are an instructor, department head, tutor, or
              institutional administrator, grAdelytics helps streamline
              answer-script evaluation, automate reports, track CO attainment,
              and simplify academic workflows.
            </p>

            <div className="flex flex-wrap gap-4 mt-5">

              <button
                onClick={handleDemoClick}
                className="px-8 py-4 bg-[#ff7f10] text-white font-bold rounded-2xl hover:bg-[#e67e00] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                Request Demo
              </button>

              <button
                onClick={handleTalkClick}
                className="px-8 py-4 border-2 border-[#ff7f10] text-[#ff7f10] font-bold rounded-2xl hover:bg-orange-50 transition-all duration-300"
              >
                Talk to Team
              </button>
            </div>
          </div>
        </div>
      </section>

      <Signup />
      <Footer />

      {/* COOKIE CONSENT */}
      {showConsent && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#ff7f10] to-[#ca6105] text-white px-6 sm:px-10 lg:px-16 py-6 flex flex-col lg:flex-row justify-between items-center gap-6 z-40">

          <p className="text-sm leading-relaxed flex-1">
            May we use cookies to improve your experience and track platform
            analytics? We take your privacy seriously.
          </p>

          <div className="flex gap-4">

            <button
              onClick={() => handleConsent(true)}
              className="px-6 py-2 bg-white text-[#ff7f10] font-bold rounded-xl hover:scale-105 transition-all duration-300"
            >
              Accept
            </button>

            <button
              onClick={() => handleConsent(false)}
              className="px-6 py-2 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              Decline
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;

