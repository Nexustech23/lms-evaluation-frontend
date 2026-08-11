"use client";

import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  MonitorPlay,
  Brain,
  Mail,
  Lock,
  Phone,
  MapPin,
  User,
} from "lucide-react";

const Signup = ({ close, openLogin }) => {
  const [activeTab, setActiveTab] = useState("institute");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    contact: "",
    tuitionName: "",
    tuitionAddress: "",
  });

  const handleInputChanges = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleForm = (e) => {
    e.preventDefault();

    console.log(formData);
  };

  const tabs = [
    {
      id: "institute",
      label: "Institute",
      icon: <Building2 size={18} />,
    },
    {
      id: "tutor",
      label: "Faculty",
      icon: <MonitorPlay size={18} />,
    },
    {
      id: "learner",
      label: "My Career Guru",
      icon: <Brain size={18} />,
    },
  ];

  return (
    <div
    id="signup"
      className="min-h-screen flex items-center justify-center px-4 py-10 
    bg-gradient-to-br from-orange-100 via-orange-200 to-amber-100"
    >
      <div
        className="relative w-full max-w-6xl grid lg:grid-cols-2 overflow-hidden 
      rounded-[40px] shadow-2xl bg-white border border-orange-100"
      >
        {/* LEFT SIDE */}
        <div
          className="relative hidden lg:flex flex-col gap-10 overflow-hidden
        bg-gradient-to-br from-orange-400 via-orange-500 to-amber-400 p-12 text-white"
        >
          {/* Blur */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/20 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-yellow-200/20 blur-3xl rounded-full"></div>

          <div className="relative z-10">
            <div className="w-full flex justify-center items-center text-center">
              <p className="text-7xl font-bold">
                gr<span className="text-blue-950">A</span>delyt
                <span className="text-blue-950">I</span>cs
              </p>
            </div>
            <div className="mt-10">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
              bg-white/15 backdrop-blur-xl border border-white/20 text-sm font-medium"
              >
                ✨ AI Powered Evaluation Platform
              </div>

              <h1 className="text-4xl font-extrabold leading-tight mt-6">
                Transform Education with{" "}
                <span className="text-5xl text-orange-100">
                  AI Powered Learning
                </span>
              </h1>

              <p className="text-white/85 text-lg leading-relaxed mt-6 max-w-md">
                AI powered ecosystem for institutes, tutors, and self learners
                with smart analytics, evaluations, and learning tools.
              </p>
            </div>
          </div>

          {/* Floating Cards */}
          <div className="relative z-10 flex gap-4">
            <div
              className="bg-white/15 backdrop-blur-xl border border-white/20 
            rounded-3xl p-5 flex-1"
            >
              <h2 className="text-3xl font-bold">1</h2>

              <p className="text-sm text-white/80 mt-1">Active Students</p>
            </div>

            <div
              className="bg-white/15 backdrop-blur-xl border border-white/20 
            rounded-3xl p-5 flex-1"
            >
              <h2 className="text-3xl font-bold">5</h2>

              <p className="text-sm text-white/80 mt-1">Institutes</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative bg-white px-6 md:px-10 py-10">
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-5 right-5 w-10 h-10 rounded-full 
            bg-orange-100 hover:bg-orange-200 transition-all 
            flex items-center justify-center text-orange-500 font-bold"
          >
            ×
          </button>

          {/* Mobile Logo */}
          <div className="flex justify-center lg:hidden mb-6">
            <Image src="/pics/Logo7.png" alt="Logo" width={180} height={60} />
          </div>

          {/* Tabs */}
          <div className="flex gap-3 bg-orange-50 p-2 rounded-2xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl 
                text-sm font-semibold transition-all duration-300
                
                ${
                  activeTab === tab.id
                    ? "bg-orange-500 text-white shadow-lg"
                    : "text-gray-600 hover:bg-white"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* INSTITUTE MESSAGE */}
          {activeTab === "institute" && (
            <div
              className="mt-10 bg-gradient-to-br from-orange-100 to-amber-100 
            border border-orange-200 rounded-3xl p-8 text-center"
            >
              <div
                className="w-20 h-20 rounded-full bg-orange-500 text-white 
              flex items-center justify-center mx-auto shadow-xl"
              >
                <Building2 size={36} />
              </div>

              <h2 className="text-3xl font-bold text-gray-800 mt-6">
                Complete Institute Access
              </h2>

              <p className="text-gray-600 leading-relaxed mt-4 max-w-md mx-auto">
                Please contact the administrator for complete institute
                onboarding. Our team will connect with you and help you setup
                your institute.
              </p>

              <Link
                href="/contact-us"
                className="inline-flex mt-8 px-8 py-4 rounded-2xl 
                bg-orange-500 hover:bg-orange-600 text-white font-semibold 
                shadow-lg transition-all duration-300"
              >
                Contact Administrator
              </Link>
            </div>
          )}

          {/* TUTOR + LEARNER FORM */}
          {(activeTab === "tutor" || activeTab === "learner") && (
            <form onSubmit={handleForm} className="mt-8 flex flex-col gap-5">
              {/* Name */}
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Full Name
                </label>

                <div className="mt-2 relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChanges}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 
                    bg-orange-50/50 outline-none focus:border-orange-400 focus:ring-4 
                    focus:ring-orange-100 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Email Address
                </label>

                <div className="mt-2 relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChanges}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 
                    bg-orange-50/50 outline-none focus:border-orange-400 focus:ring-4 
                    focus:ring-orange-100 transition-all"
                  />
                </div>
              </div>

              {/* Contact */}
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Contact Number
                </label>

                <div className="mt-2 relative">
                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    name="contact"
                    placeholder="Enter contact number"
                    value={formData.contact}
                    onChange={handleInputChanges}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 
                    bg-orange-50/50 outline-none focus:border-orange-400 focus:ring-4 
                    focus:ring-orange-100 transition-all"
                  />
                </div>
              </div>

              {/* TUTOR EXTRA FIELDS */}
              {activeTab === "tutor" && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Tuition Name
                    </label>

                    <input
                      type="text"
                      name="tuitionName"
                      placeholder="Enter tuition name"
                      value={formData.tuitionName}
                      onChange={handleInputChanges}
                      className="mt-2 w-full px-4 py-4 rounded-2xl border border-gray-200 
                      bg-orange-50/50 outline-none focus:border-orange-400 focus:ring-4 
                      focus:ring-orange-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Tuition Address
                    </label>

                    <div className="mt-2 relative">
                      <MapPin
                        size={18}
                        className="absolute left-4 top-5 text-gray-400"
                      />

                      <textarea
                        name="tuitionAddress"
                        rows={3}
                        placeholder="Enter tuition address"
                        value={formData.tuitionAddress}
                        onChange={handleInputChanges}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 
                        bg-orange-50/50 outline-none focus:border-orange-400 focus:ring-4 
                        focus:ring-orange-100 transition-all resize-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Password */}
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Password
                </label>

                <div className="mt-2 relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="password"
                    name="password"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleInputChanges}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 
                    bg-orange-50/50 outline-none focus:border-orange-400 focus:ring-4 
                    focus:ring-orange-100 transition-all"
                  />
                </div>
              </div>

              {/* Button */}
              <button
                type="submit"
                className="mt-4 py-4 rounded-2xl bg-gradient-to-r 
                from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 
                text-white font-semibold shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                Create Account
              </button>
            </form>
          )}

          {/* Footer */}
          <p className="text-center text-gray-500 text-sm mt-8">
            Already have an account?
            <span
              onClick={openLogin}
              className="ml-2 text-orange-500 font-semibold cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
