"use client";

import React, { useState } from "react";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import Navbar from "./navbar";
import Footer from "./footer";
import axios from "axios";

const Contact = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(
    "ENGLISH (UNITED STATES)",
  );

  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    topic: "",
    institutionName: "",
    message: "",
    agreeToPolicy: false,
  });

  const languages = [
    "ENGLISH (UNITED STATES)",
    "ESPAÑOL",
    "FRANÇAIS",
    "DEUTSCH",
    "中文",
  ];

  const supportLinks = [
    {
      title: "Getting Started",
      description: "New to grAdelytics? Learn the basics",
    },
    {
      title: "Instructor Guide",
      description: "Complete guide for instructors",
    },
    {
      title: "Student Guide",
      description: "Help for students using grAdelytics",
    },
    {
      title: "API Documentation",
      description: "Developer resources and API docs",
    },
    {
      title: "Troubleshooting",
      description: "Common issues and solutions",
    },
    {
      title: "Account Management",
      description: "Account settings and preferences",
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.agreeToPolicy) {
      alert("Please agree to the privacy policy");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role,
        topic: formData.topic,
        email: formData.email,
        contact_no: formData.phone,
        message:
          formData.role === "institute"
            ? `Institute Name: ${formData.institutionName}\n\n${formData.message}`
            : formData.message,
      };

      const response = await axios.post("/api/contact", payload);

      if (response?.data?.success) {
        setSubmitted(true);
        setSuccessMessage(
          "Thank you for connecting with us. Our team will connect with you ASAP through the email you provided."
        );

        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          role: "",
          topic: "",
          institutionName: "",
          message: "",
          agreeToPolicy: false,
        });

        setTimeout(() => {
          setSubmitted(false);
          setSuccessMessage("");
        }, 4000);
      }
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to submit form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full overflow-x-hidden bg-white">
      <Navbar />

      {/* HEADING */}
      <section className="w-full bg-amber-100/30 text-center flex flex-col gap-3 pt-24 pb-4 px-6">
        <h1 className="text-3xl md:text-5xl font-[700] flex flex-wrap justify-center gap-3">
          <span className="text-[#ff7f10]">Connect</span>
          with our Experts
        </h1>

        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
          Contact our team of excellence-driven experts today to enhance your
          learning and evaluation experience.
        </p>
      </section>

      {/* MAIN SECTION */}
      <section className="w-full bg-amber-100/30 h-auto pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 px-6 md:px-10 lg:px-16 py-8 gap-8 max-w-6xl mx-auto items-start">
          {/* LEFT SIDE */}
          <div className="lg:col-span-5 flex flex-col gap-8 bg-white/70 backdrop-blur-sm p-6 sm:p-7 rounded-2xl border border-orange-100 shadow-sm">
            {/* Call Us */}
            <div className="flex flex-col gap-3">
              <h2 className="text-xl font-bold text-[#0d3b4a]">
                Call us
              </h2>

              <div className="flex flex-row gap-2.5 items-center text-gray-700 text-sm">
                ⏰ Office Hours: Mon-Fri, 9am - 5pm
              </div>

              <div className="flex flex-col gap-2 text-gray-700 text-sm">
                <div className="flex items-center gap-2">
                  📞 Bibhas Mondal - +91 7584866649 (India)
                </div>

                <div className="flex items-center gap-2">
                  📞 Dr Subhendu Dey - +91 7278003671 (India)
                </div>

                <div className="flex items-center gap-2">
                  📞 Dr Tapan Sarker - +61 401 735 265 (Australia)
                </div>
              </div>
            </div>

            {/* Chat */}
            <div className="flex flex-col gap-3">
              <h2 className="text-xl font-bold text-[#0d3b4a]">
                Chat with us
              </h2>

              <div className="flex flex-row gap-2 items-center text-gray-700 text-sm break-all">
                📧 antarpathimpactconsulting@gmail.com
              </div>

              <a
                href="https://www.antarpath.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-row gap-2 items-center text-orange-600 hover:underline text-sm font-medium"
              >
                🌐 www.antarpath.com
              </a>
            </div>

            {/* Office Locations */}
            <div className="flex flex-col gap-3">
              <h2 className="text-xl font-bold text-[#0d3b4a]">
                Office Locations
              </h2>

              <div className="flex flex-col gap-3 text-gray-700 text-xs sm:text-sm">
                <div className="flex gap-2.5 items-start">
                  <span>📍</span>
                  <p>
                    8/1/2, Dr. U.N Brahmachari Street, 4th Floor,
                    Kolkata - 700017, West Bengal
                  </p>
                </div>

                <div className="flex gap-2.5 items-start">
                  <span>📍</span>
                  <p>
                    F535 Brigade Meadows, Wisteria Kanakpura Main Road,
                    Bengaluru - 560082, Karnataka
                  </p>
                </div>

                <div className="flex gap-2.5 items-start">
                  <span>📍</span>
                  <p>
                    6 Santa Cruz Pl, Forest Lake,
                    Queensland - 4078, Brisbane
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FORM (COMPACT, SLEEK, REFINED UI) */}
          <div className="lg:col-span-7 bg-gradient-to-b from-[#ff7f10] to-[#e06700] p-6 sm:p-7 rounded-2xl shadow-xl border border-white/20">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* NAME */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-white font-medium mb-1.5 text-xs uppercase tracking-wider">
                    First Name
                  </label>

                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2 bg-white text-[#0d3b4a] rounded-lg text-sm border-none focus:outline-none focus:ring-2 focus:ring-white/80 shadow-sm"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-1.5 text-xs uppercase tracking-wider">
                    Last Name
                  </label>

                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2 bg-white text-[#0d3b4a] rounded-lg text-sm border-none focus:outline-none focus:ring-2 focus:ring-white/80 shadow-sm"
                    placeholder="Doe"
                  />
                </div>
              </div>

              {/* ROLE + TOPIC */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-white font-medium mb-1.5 text-xs uppercase tracking-wider">
                    Select Role
                  </label>

                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2 bg-white text-[#0d3b4a] rounded-lg text-sm border-none focus:outline-none focus:ring-2 focus:ring-white/80 shadow-sm cursor-pointer"
                  >
                    <option value="">Choose Role</option>
                    <option value="self-learner">Student</option>
                    <option value="tutor">Tutor</option>
                    <option value="institute">Institute</option>
                    <option value="administrator">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-medium mb-1.5 text-xs uppercase tracking-wider">
                    Contact Topic
                  </label>

                  <select
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2 bg-white text-[#0d3b4a] rounded-lg text-sm border-none focus:outline-none focus:ring-2 focus:ring-white/80 shadow-sm cursor-pointer"
                  >
                    <option value="">Choose Topic</option>
                    <option value="pricing">Pricing Inquiry</option>
                    <option value="demo">Request Demo</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* EMAIL + PHONE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-white font-medium mb-1.5 text-xs uppercase tracking-wider">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2 bg-white text-[#0d3b4a] rounded-lg text-sm border-none focus:outline-none focus:ring-2 focus:ring-white/80 shadow-sm"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-1.5 text-xs uppercase tracking-wider">
                    Contact Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2 bg-white text-[#0d3b4a] rounded-lg text-sm border-none focus:outline-none focus:ring-2 focus:ring-white/80 shadow-sm"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              {/* INSTITUTE */}
              {formData.role === "institute" && (
                <div>
                  <label className="block text-white font-medium mb-1.5 text-xs uppercase tracking-wider">
                    Institute Name
                  </label>

                  <input
                    type="text"
                    name="institutionName"
                    value={formData.institutionName}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2 bg-white text-[#0d3b4a] rounded-lg text-sm border-none focus:outline-none focus:ring-2 focus:ring-white/80 shadow-sm"
                    placeholder="ABC University"
                  />
                </div>
              )}

              {/* MESSAGE */}
              <div>
                <label className="block text-white font-medium mb-1.5 text-xs uppercase tracking-wider">
                  Message
                </label>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-3.5 py-2 bg-white text-[#0d3b4a] rounded-lg text-sm border-none focus:outline-none focus:ring-2 focus:ring-white/80 resize-none shadow-sm"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              {/* PRIVACY */}
              <div className="space-y-2 pt-1">
                <p className="text-white/90 text-xs leading-relaxed">
                  By submitting this form, you agree to our privacy policy and
                  allow grAdelytics to contact you regarding your inquiry.
                </p>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="agreeToPolicy"
                    checked={formData.agreeToPolicy}
                    onChange={handleChange}
                    className="w-4 h-4 rounded accent-orange-600 cursor-pointer"
                  />

                  <span className="text-white font-medium text-xs">
                    I Agree
                  </span>
                </label>
              </div>

              {successMessage && (
                <div className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-md text-xs sm:text-sm animate-in fade-in duration-300">
                  <p>{successMessage}</p>
                </div>
              )}

              {/* BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitted || loading}
                  className="w-full py-2.5 sm:py-3 bg-white text-[#ff7f10] font-bold rounded-xl text-sm sm:text-base hover:bg-[#0d3b4a] hover:text-white transition-all duration-300 hover:shadow-lg active:scale-[0.99] disabled:opacity-50"
                >
                  {loading
                    ? "Submitting..."
                    : submitted
                      ? "Message Sent!"
                      : "Contact Our Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
