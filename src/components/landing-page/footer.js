"use client";

import Image from "next/image";
import Link from "next/link";
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
    <footer className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300 text-white">
      {/* Background Blur Effects */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-200/10 blur-3xl rounded-full"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-12 border-b border-white/20 pb-12">
          {/* Logo + Description */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            <Image
              src="/pics/Logo11.png"  
              width={150}
              height={60}
              alt="company_logo"
              className="object-contain"
            />

            <p className="text-white/85 leading-relaxed text-sm max-w-md">
              grAdelytIcs is an AI-powered education management platform that helps institutions automate question paper generation, evaluate answer sheets, track CO-PO attainment, calculate grades, and generate transcripts — while empowering MyCareerGuru with personalized roadmaps and smart study tools.
            </p>

            {/* Contact Info */}
            <div className="flex flex-col gap-3 text-sm text-white/90">
              <div className="flex items-center gap-3">
                <MdEmail size={18} />

                <span>support@gradelytics.com</span>
              </div>

              <div className="flex items-center gap-3">
                <FaPhoneAlt size={16} />
                <span>+91 98765 43210</span>
              </div>

              <div className="flex items-center gap-3">
                <FaMapMarkerAlt size={16} />
                <span>India</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-col lg:col-span-2 gap-4">
            <h2 className="font-semibold text-lg">Features</h2>

            <div className="flex flex-col gap-3 text-sm text-white/85">
              <p className="hover:text-white hover:translate-x-1 transition-all duration-300 cursor-default">
                Complete Institute Evaluation System
              </p>

              <p className="hover:text-white hover:translate-x-1 transition-all duration-300 cursor-default">
                MyCareerGuru - AI-Powered Career Guidance
              </p>

              <p className="hover:text-white hover:translate-x-1 transition-all duration-300 cursor-default">
                AI Tutor Management
              </p>

              <p className="hover:text-white hover:translate-x-1 transition-all duration-300 cursor-default">
                AI Generated Notes & Assignments
              </p>

              <p className="hover:text-white hover:translate-x-1 transition-all duration-300 cursor-default">
                My skill Guru
              </p>
            </div>
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-lg">Resources</h2>

            <Link
              href="/contact-us"
              className="text-white/85 hover:text-white hover:translate-x-1 transition-all duration-300 text-sm"
            >
              Contact Us
            </Link>

            <Link
              href="/get-a-demo"
              className="text-white/85 hover:text-white hover:translate-x-1 transition-all duration-300 text-sm"
            >
              Get a Demo
            </Link>

            <Link
              href="/pricing"
              className="text-white/85 hover:text-white hover:translate-x-1 transition-all duration-300 text-sm"
            >
              Pricing
            </Link>

            <Link
              href="/faq"
              className="text-white/85 hover:text-white hover:translate-x-1 transition-all duration-300 text-sm"
            >
              FAQs
            </Link>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-lg">Legal</h2>

            <Link
              href="/terms-conditions"
              className="text-white/85 hover:text-white hover:translate-x-1 transition-all duration-300 text-sm"
            >
              Terms & Conditions
            </Link>

            <Link
              href="/privacy-policy"
              className="text-white/85 hover:text-white hover:translate-x-1 transition-all duration-300 text-sm"
            >
              Privacy Policy
            </Link>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8">
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
        </div>
      </div>
    </footer>
  );
}

export default Footer;
