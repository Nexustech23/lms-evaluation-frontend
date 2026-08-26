"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  IconTarget,
  IconRobot,
  IconChecklist,
  IconArrowRight,
  IconSparkles,
  IconClockHour4,
  IconBulb,
  IconRocket,
  IconChevronDown,
} from "@tabler/icons-react";

// Text-safe (WCAG-friendly on white) / tile-tint variants of the brand's
// gold, teal, coral accents — kept distinct from the vivid hex used in
// gradients/buttons, which don't need to pass text-contrast rules.
const ACCENTS = {
  gold: { vivid: "#F7971E", text: "#B45309", tint: "rgba(247,151,30,0.10)", border: "rgba(247,151,30,0.35)" },
  teal: { vivid: "#43C6AC", text: "#0F766E", tint: "rgba(67,198,172,0.10)", border: "rgba(67,198,172,0.35)" },
  coral: { vivid: "#FF6584", text: "#E11D48", tint: "rgba(255,101,132,0.10)", border: "rgba(255,101,132,0.35)" },
  amber: { vivid: "#E8A33D", text: "#B45309", tint: "rgba(232,163,61,0.10)", border: "rgba(232,163,61,0.35)" },
};

const FEATURES = [
  {
    icon: <IconTarget size={22} />,
    title: "Personalized Roadmaps",
    description: "An AI-built, week-by-week learning plan tailored to your subject, goal, and pace.",
    accent: ACCENTS.gold,
  },
  {
    icon: <IconRobot size={22} />,
    title: "Homework Help & AI Notes",
    description: "Upload a problem set or study material and get worked solutions or structured notes back.",
    accent: ACCENTS.teal,
  },
  {
    icon: <IconChecklist size={22} />,
    title: "Test Engine",
    description: "Practice tests generated for exactly what you're studying, with instant feedback.",
    accent: ACCENTS.coral,
  },
];

const STATS = [
  { icon: <IconSparkles size={18} />, label: "AI-built roadmaps", value: "100%", accent: ACCENTS.gold },
  { icon: <IconClockHour4 size={18} />, label: "Learn at your pace", value: "24/7", accent: ACCENTS.teal },
  { icon: <IconBulb size={18} />, label: "Instant feedback", value: "Every test", accent: ACCENTS.coral },
];

const SUBJECTS = [
  { name: "Mathematics", icon: "📐", accent: ACCENTS.gold },
  { name: "Physics", icon: "⚛️", accent: ACCENTS.coral },
  { name: "English", icon: "📖", accent: ACCENTS.teal },
  { name: "History", icon: "🏛️", accent: ACCENTS.amber },
];

const FAQS = [
  {
    q: "Do I need an institute account to use MyCareerGuru?",
    a: "No. MyCareerGuru works as a standalone account for individual learners — create a free account and you're in. Institutes can also enable it for their students, but it isn't required.",
  },
  {
    q: "How does the AI actually build my roadmap?",
    a: "Tell it the subject, your goal, and your pace, and it lays out a week-by-week plan broken into topics — so you always know what to study next instead of staring at a syllabus.",
  },
  {
    q: "What subjects can I study?",
    a: "Any subject you're working on — Mathematics, Physics, English, and History are shown above as examples, but the roadmap adapts to whatever you're studying.",
  },
  {
    q: "Is homework help the same as getting the answers done for me?",
    a: "No — upload a problem set or study material and you get worked solutions and structured notes back, aimed at helping you understand the material, not just a finished answer sheet.",
  },
  {
    q: "How are the practice tests generated?",
    a: "Tests are generated for exactly what you're currently studying in your roadmap, with instant feedback so you know what to revisit right away.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Tell us your goal",
    description: "Pick a subject and share what you're aiming for — an exam, a skill, or a syllabus to catch up on.",
  },
  {
    step: "02",
    title: "Get your AI roadmap",
    description: "MyCareerGuru builds a week-by-week plan, broken into topics you can actually finish.",
  },
  {
    step: "03",
    title: "Practice & track progress",
    description: "Work through notes, homework help, and generated tests — watch your progress fill in as you go.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: "easeOut" } }),
};

const CARD = { background: "#FFFFFF", border: "1px solid #F0E6D2", boxShadow: "0 4px 24px rgba(35,25,10,0.05)" };

export default function MyCareerGuruLanding() {
  return (
    <div
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #FFFBF3 55%, #FFF6E7 100%)" }}
    >
      {/* Atmospheric glows — soft warm pastel wash, no blue */}
      <div className="absolute top-0 left-1/4 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#F7971E]/10 blur-[100px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-60 h-60 sm:w-80 sm:h-80 rounded-full bg-[#FF6584]/8 blur-[90px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-[#43C6AC]/8 blur-[100px] sm:blur-[130px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-6 md:px-12 py-3 sm:py-4 md:py-5">
        <Link href="/mycareerguru" className="flex items-center shrink-0">
          <Image
            src="/pics/Logo17.png"
            alt="MyCareerGuru"
            width={224}
            height={84}
            className="h-11 sm:h-14 md:h-16 lg:h-20 w-auto object-contain"
            priority
          />
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href="/mycareerguru/login"
            className="px-2.5 py-2 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold text-[#4A4030] hover:text-[#1A1207] transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/mycareerguru/register"
            className="px-3 py-2 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #F7971E 0%, #E8A33D 100%)" }}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <motion.div
        className="relative z-10 max-w-3xl mx-auto text-center px-4 sm:px-6 pt-8 sm:pt-14 pb-12 sm:pb-16"
        initial="hidden"
        animate="show"
      >
        <motion.div
          custom={0}
          variants={fadeUp}
          className="inline-flex items-center gap-2 mb-4 sm:mb-5 px-3 py-1.5 sm:px-3.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider"
          style={{ background: ACCENTS.gold.tint, border: `1px solid ${ACCENTS.gold.border}`, color: ACCENTS.gold.text }}
        >
          <IconRocket size={13} /> The Personal Learning Assistant
        </motion.div>

        <motion.h1
          custom={0.08}
          variants={fadeUp}
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight"
          style={{ color: "#1A1207" }}
        >
          Learn anything, guided by AI —
          <br />
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #F7971E, #E8395F)" }}>
            at your own pace.
          </span>
        </motion.h1>
        <motion.p
          custom={0.16}
          variants={fadeUp}
          className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg max-w-xl mx-auto"
          style={{ color: "#6B6355" }}
        >
          MyCareerGuru builds you a personalized roadmap, helps with homework, and tests what you&apos;ve learned —
          no institute account needed.
        </motion.p>
        <motion.div custom={0.24} variants={fadeUp} className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/mycareerguru/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:scale-[1.03]"
            style={{
              background: "linear-gradient(135deg, #F7971E 0%, #E8A33D 50%, #FF6584 100%)",
              boxShadow: "0 8px 24px rgba(247,151,30,0.28)",
            }}
          >
            Create your free account <IconArrowRight size={16} />
          </Link>
          <Link
            href="/mycareerguru/login"
            className="w-full sm:w-auto text-center px-6 py-3.5 rounded-xl text-sm font-semibold transition-all"
            style={{ color: "#4A4030", border: "1px solid #E9DDC4", background: "#FFFFFF" }}
          >
            I already have an account
          </Link>
        </motion.div>

        {/* Stat strip */}
        <motion.div custom={0.32} variants={fadeUp} className="mt-9 sm:mt-12 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-2 sm:gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl"
              style={CARD}
            >
              <span style={{ color: s.accent.text }}>{s.icon}</span>
              <span className="font-bold text-xs sm:text-sm" style={{ color: "#1A1207" }}>{s.value}</span>
              <span className="text-[11px] sm:text-xs" style={{ color: "#8A8171" }}>{s.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Subjects strip */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <p className="text-center text-[11px] sm:text-xs font-bold uppercase tracking-widest mb-4 sm:mb-5" style={{ color: "#A79C86" }}>
          Study any subject, your way
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {SUBJECTS.map((s) => (
            <div
              key={s.name}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold"
              style={{ background: s.accent.tint, border: `1px solid ${s.accent.border}`, color: s.accent.text }}
            >
              <span>{s.icon}</span> {s.name}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Features */}
      <div className="relative z-10 max-w-5xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 px-4 sm:px-6 pb-16 sm:pb-24">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
            className="rounded-2xl p-5 sm:p-6 transition-transform hover:-translate-y-1"
            style={CARD}
          >
            <div
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-3 sm:mb-4"
              style={{ background: f.accent.tint, color: f.accent.text }}
            >
              {f.icon}
            </div>
            <h3 className="font-bold text-sm mb-1.5" style={{ color: "#1A1207" }}>{f.title}</h3>
            <p className="text-xs leading-relaxed" style={{ color: "#8A8171" }}>{f.description}</p>
          </motion.div>
        ))}
      </div>

      {/* How it works */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="font-black text-xl sm:text-2xl md:text-3xl tracking-tight" style={{ color: "#1A1207" }}>How it works</h2>
          <p className="text-xs sm:text-sm mt-2" style={{ color: "#8A8171" }}>Three steps from “what should I study?” to a finished plan.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
              className="relative rounded-2xl p-5 sm:p-6"
              style={CARD}
            >
              <span
                className="text-2xl sm:text-3xl font-black bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #F7971E, #E8395F)" }}
              >
                {s.step}
              </span>
              <h3 className="font-bold text-sm mt-3 mb-1.5" style={{ color: "#1A1207" }}>{s.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "#8A8171" }}>{s.description}</p>
              {i < STEPS.length - 1 && (
                <div className="hidden sm:block absolute top-1/2 -right-3 -translate-y-1/2" style={{ color: "#D9CBAA" }}>
                  <IconArrowRight size={18} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* FAQ */}
      <motion.div
        className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="font-black text-xl sm:text-2xl md:text-3xl tracking-tight" style={{ color: "#1A1207" }}>Frequently asked questions</h2>
          <p className="text-xs sm:text-sm mt-2" style={{ color: "#8A8171" }}>Everything you need to know before you start.</p>
        </div>
        <div className="flex flex-col gap-2.5 sm:gap-3">
          {FAQS.map((f, i) => (
            <FaqItem key={f.q} q={f.q} a={f.a} defaultOpen={i === 0} />
          ))}
        </div>
      </motion.div>

      {/* About / Footer */}
      <div className="relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12 grid gap-8 sm:grid-cols-2 md:grid-cols-[1.3fr_1fr_1fr] md:gap-10">
          <div>
            <Image src="/pics/Logo17.png" alt="MyCareerGuru" width={196} height={74} className="h-12 sm:h-14 md:h-16 w-auto object-contain mb-3" />
            <p className="text-xs leading-relaxed max-w-sm" style={{ color: "#8A8171" }}>
              MyCareerGuru is an AI-guided study companion built for self-paced learning: a personalized roadmap,
              homework help, and practice tests for whatever you&apos;re studying — no classroom required.
              It&apos;s part of the Gradelytics platform, and institutes can enable it for their students too.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#4A4030" }}>Get started</p>
            <div className="flex flex-col gap-2">
              <Link href="/mycareerguru/register" className="text-xs transition-colors" style={{ color: "#8A8171" }}>
                Create an account
              </Link>
              <Link href="/mycareerguru/login" className="text-xs transition-colors" style={{ color: "#8A8171" }}>
                Log in
              </Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#4A4030" }}>What you get</p>
            <div className="flex flex-col gap-2">
              <span className="text-xs" style={{ color: "#8A8171" }}>AI-built weekly roadmaps</span>
              <span className="text-xs" style={{ color: "#8A8171" }}>Homework help & AI notes</span>
              <span className="text-xs" style={{ color: "#8A8171" }}>Practice tests with instant feedback</span>
            </div>
          </div>
        </div>
        <div className="py-5 text-center px-4">
          <p className="text-[11px] font-medium" style={{ color: "#B3A78F" }}>
            © {new Date().getFullYear()} MyCareerGuru — The Personal Learning Assistant. Part of the Gradelytics platform.
          </p>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl overflow-hidden" style={CARD}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5 sm:py-4 text-left"
      >
        <span className="font-semibold text-xs sm:text-sm" style={{ color: "#1A1207" }}>{q}</span>
        <IconChevronDown
          size={18}
          className="shrink-0 transition-transform duration-300"
          style={{ color: "#F7971E", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 sm:px-5">
          <p className="text-xs leading-relaxed" style={{ color: "#8A8171" }}>{a}</p>
        </div>
      )}
    </div>
  );
}
