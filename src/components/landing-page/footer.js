"use client";

import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

import { MdEmail } from "react-icons/md";

function Footer() {
  return (
    <footer className="relative overflow-hidden text-white" style={{ background: "linear-gradient(135deg, #D9530F 0%, #EA6A17 55%, #E8871E 100%)" }}>
      {/* Background Blur Effects */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-200/10 blur-3xl rounded-full"></div>

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6 pt-14 pb-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.55fr_1.15fr_0.85fr_0.85fr] gap-10 border-b border-white/20 pb-12">
          {/* Logo + Description */}
          <Reveal delay={0.0} className="h-full">          <div className="flex flex-col">
            <div className="inline-flex self-start items-center rounded-xl bg-white px-[18px] py-3 mb-5 shadow-[0_6px_20px_rgba(10,29,78,0.12)]">
              <Image
                src="/pics/Logo7.png"
                width={185}
                height={62}
                alt="grAdelytIcs logo"
                className="h-12 w-auto object-contain"
              />
            </div>

            <p className="text-[14.5px] leading-[1.65] max-w-[360px] text-white/[0.92] mb-5">
              grAdelytIcs is an AI-powered education management platform that helps institutions automate question paper generation, evaluate answer sheets, track CO-PO attainment, calculate grades, and generate transcripts.
            </p>

            {/* Contact Info */}
            <div className="flex flex-col gap-3 text-[14.5px] text-white/90">
              <div className="flex items-center gap-2.5">
                <MdEmail size={16} className="shrink-0" />

                <span className="opacity-90 hover:opacity-100 hover:underline transition-opacity duration-200 cursor-pointer">info@antarpath.com</span>
              </div>

              <div className="flex items-center gap-2.5">
                <FaPhoneAlt size={16} className="shrink-0" />
                <span className="opacity-90 hover:opacity-100 hover:underline transition-opacity duration-200 cursor-pointer">+91 72780 03671</span>
              </div>

              <div className="flex items-center gap-2.5">
                <FaMapMarkerAlt size={16} className="shrink-0" />
                <span>India</span>
              </div>
            </div>
          </div></Reveal>

          {/* Features */}
          <Reveal delay={0.1} className="h-full">          <div className="flex flex-col">
            <h2 className="text-[16px] font-bold text-white mb-[18px]">Features & Tools</h2>

            <div className="flex flex-col text-[14.5px] leading-[1.4] text-white/90">
              <div className="flex flex-col gap-3">
                <p className="hover:text-white hover:translate-x-[2px] transition-all duration-300 cursor-default">
                  Question Paper Generation
                </p>
                <p className="hover:text-white hover:translate-x-[2px] transition-all duration-300 cursor-default">
                  AI Evaluation
                </p>
                <p className="hover:text-white hover:translate-x-[2px] transition-all duration-300 cursor-default">
                  Faculty Validation
                </p>
                <p className="hover:text-white hover:translate-x-[2px] transition-all duration-300 cursor-default">
                  Results & Analytics
                </p>
                <p className="hover:text-white hover:translate-x-[2px] transition-all duration-300 cursor-default">
                  CO-PO Attainment
                </p>
                <p className="hover:text-white hover:translate-x-[2px] transition-all duration-300 cursor-default">
                  Accreditation Intelligence
                </p>
              </div>

              <div className="flex flex-col gap-3 mt-[18px] mb-0 pt-[14px] border-t border-white/[0.28]">
                <span className="text-[11px] uppercase tracking-[0.08em] font-bold text-white/85 mb-0">
                  Our other intelligent tools
                </span>
                <a
                  href="https://antarpath.com/mycareerguru"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white hover:translate-x-[2px] transition-all duration-300"
                >
                  Personalized Learning Roadmaps
                </a>
                <a
                  href="https://antarpath.com/mycareerguru"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white hover:translate-x-[2px] transition-all duration-300"
                >
                  AI Tutor & Smart Doubt Clearing
                </a>
                <a
                  href="https://antarpath.com/myskillsguru"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white hover:translate-x-[2px] transition-all duration-300"
                >
                  Adaptive Mock Tests & Analytics
                </a>
              </div>
            </div>
          </div></Reveal>

          {/* Resources */}
          <Reveal delay={0.2} className="h-full">          <div className="flex flex-col gap-3 text-[14.5px] leading-[1.4]">
            <h2 className="text-[16px] font-bold text-white mb-[6px]">Resources</h2>

            <Link
              href="/contact-us"
              className="text-white/90 hover:text-white hover:translate-x-[2px] transition-all duration-300 whitespace-nowrap"
            >
              Contact Us
            </Link>

            <Link
              href="/get-a-demo"
              className="text-white/90 hover:text-white hover:translate-x-[2px] transition-all duration-300 whitespace-nowrap"
            >
              Get a Demo
            </Link>

            <Link
              href="/pricing"
              className="text-white/90 hover:text-white hover:translate-x-[2px] transition-all duration-300 whitespace-nowrap"
            >
              Pricing
            </Link>

            <Link
              href="/faq"
              className="text-white/90 hover:text-white hover:translate-x-[2px] transition-all duration-300 whitespace-nowrap"
            >
              FAQs
            </Link>
          </div></Reveal>

          {/* Legal */}
          <Reveal delay={0.30000000000000004} className="h-full">          <div className="flex flex-col gap-3 text-[14.5px] leading-[1.4]">
            <h2 className="text-[16px] font-bold text-white mb-[6px]">Legal</h2>

            <Link
              href="/terms-conditions"
              className="text-white/90 hover:text-white hover:translate-x-[2px] transition-all duration-300 whitespace-nowrap"
            >
              Terms & Conditions
            </Link>

            <Link
              href="/privacy-policy"
              className="text-white/90 hover:text-white hover:translate-x-[2px] transition-all duration-300 whitespace-nowrap"
            >
              Privacy Policy
            </Link>
          </div></Reveal>
        </div>

        {/* Bottom Section */}
        <Reveal><div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8">
          {/* Copyright */}
          <p className="text-sm text-white/80 text-center md:text-left">
            © 2026 grAdelytics. All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-lg border border-white/20 flex items-center justify-center hover:bg-white hover:text-orange-500 transition-all duration-300"
            >
              <FaFacebookF size={16} />
            </Link>

            <Link
              href="/"
              className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-lg border border-white/20 flex items-center justify-center hover:bg-white hover:text-orange-500 transition-all duration-300"
            >
              <FaInstagram size={16} />
            </Link>

            <Link
              href="/"
              className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-lg border border-white/20 flex items-center justify-center hover:bg-white hover:text-orange-500 transition-all duration-300"
            >
              <FaLinkedinIn size={16} />
            </Link>

            <Link
              href="/"
              className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-lg border border-white/20 flex items-center justify-center hover:bg-white hover:text-orange-500 transition-all duration-300"
            >
              <FaTwitter size={16} />
            </Link>
          </div>
        </div></Reveal>
      </div>
    </footer>
  );
}

export default Footer;
