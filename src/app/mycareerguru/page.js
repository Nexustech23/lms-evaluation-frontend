"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
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
  IconPencil,
  IconRuler2,
  IconBook2,
  IconCalculator,
} from "@tabler/icons-react";

// A two-color light palette drawn straight from the MyCareerGuru mark itself
// (its navy silhouette + gold "G") — sky blue stands in for the mark's navy,
// gold stays gold. Each has a "text" shade tuned for contrast on light tints,
// and a "tint"/"border" pair for soft chips and cards.
const SKY = { vivid: "#38BDF8", deep: "#0EA5E9", text: "#0369A1", tint: "rgba(14,165,233,0.10)", border: "rgba(14,165,233,0.30)" };
const GOLD = { vivid: "#F7971E", deep: "#E8A33D", text: "#B45309", tint: "rgba(247,151,30,0.10)", border: "rgba(247,151,30,0.32)" };
const ACCENTS_CYCLE = [SKY, GOLD];

const FEATURES = [
  {
    icon: <IconTarget size={22} />,
    title: "Personalized Roadmaps",
    description: "An AI-built, week-by-week learning plan tailored to your subject, goal, and pace.",
    accent: SKY,
  },
  {
    icon: <IconRobot size={22} />,
    title: "Homework Help & AI Notes",
    description: "Upload a problem set or study material and get worked solutions or structured notes back.",
    accent: GOLD,
  },
  {
    icon: <IconChecklist size={22} />,
    title: "Test Engine",
    description: "Practice tests generated for exactly what you're studying, with instant feedback.",
    accent: SKY,
  },
];

const STATS = [
  { icon: <IconSparkles size={18} />, label: "AI-built roadmaps", value: "100%", accent: SKY },
  { icon: <IconClockHour4 size={18} />, label: "Learn at your pace", value: "24/7", accent: GOLD },
  { icon: <IconBulb size={18} />, label: "Instant feedback", value: "Every test", accent: SKY },
];

const SUBJECTS = [
  { name: "Mathematics", icon: "📐", accent: GOLD },
  { name: "Physics", icon: "⚛️", accent: SKY },
  { name: "English", icon: "📖", accent: GOLD },
  { name: "History", icon: "🏛️", accent: SKY },
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

const DOODLES = [
  { Icon: IconPencil, top: "14%", left: "6%", size: 34, rotate: -18, color: SKY.deep },
  { Icon: IconRuler2, top: "62%", left: "9%", size: 30, rotate: 12, color: GOLD.deep },
  { Icon: IconBook2, top: "20%", left: "91%", size: 36, rotate: 14, color: GOLD.deep },
  { Icon: IconCalculator, top: "68%", left: "89%", size: 28, rotate: -10, color: SKY.deep },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: "easeOut" } }),
};

const CARD = { background: "#FFFFFF", border: "1px solid #E7EEF5", boxShadow: "0 4px 24px rgba(15,45,75,0.06)" };

export default function MyCareerGuruLanding() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative overflow-hidden" style={{ background: "#FDFEFF" }}>
      {/* Nav — sky-tinted, gains a blurred backdrop + shadow once the page scrolls */}
      <nav
        className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 md:px-12 py-3 sm:py-4 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(255,255,255,0.85)" : "rgba(240,249,255,0.6)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: scrolled ? "1px solid #E7EEF5" : "1px solid transparent",
          boxShadow: scrolled ? "0 8px 24px rgba(15,45,75,0.06)" : "none",
        }}
      >
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
            className="px-2.5 py-2 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
            style={{ color: "#0F2748" }}
          >
            Log in
          </Link>
          <Link
            href="/mycareerguru/register"
            className="px-3 py-2 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all whitespace-nowrap"
            style={{ background: `linear-gradient(135deg, ${GOLD.vivid} 0%, ${GOLD.deep} 100%)` }}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero band — sky wash */}
      <div className="relative" style={{ background: "linear-gradient(180deg, #F0F9FF 0%, #E6F4FF 100%)" }}>
        <div className="absolute top-10 left-1/4 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#38BDF8]/12 blur-[100px] sm:blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/5 w-60 h-60 sm:w-80 sm:h-80 rounded-full bg-[#F7971E]/12 blur-[90px] sm:blur-[120px] pointer-events-none" />

        {/* Decorative educational doodles */}
        <div className="hidden md:block">
          {DOODLES.map(({ Icon, top, left, size, rotate, color }, i) => (
            <motion.div
              key={i}
              className="absolute pointer-events-none"
              style={{ top, left, color, opacity: 0.22 }}
              animate={{ y: [0, -10, 0], rotate: [rotate, rotate + 6, rotate] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
            >
              <Icon size={size} stroke={1.5} />
            </motion.div>
          ))}
        </div>

        <motion.div
          className="relative z-10 max-w-3xl mx-auto text-center px-4 sm:px-6 pt-8 sm:pt-14 pb-8"
          initial="hidden"
          animate="show"
        >
          <motion.div
            custom={0}
            variants={fadeUp}
            className="inline-flex items-center gap-2 mb-4 sm:mb-5 px-3 py-1.5 sm:px-3.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider"
            style={{ background: GOLD.tint, border: `1px solid ${GOLD.border}`, color: GOLD.text }}
          >
            <IconRocket size={13} /> The Personal Learning Assistant
          </motion.div>

          <motion.h1
            custom={0.08}
            variants={fadeUp}
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight"
            style={{ color: "#0F2748" }}
          >
            Learn anything, guided by AI —
            <br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${GOLD.vivid}, ${GOLD.deep})` }}>
              at your own pace.
            </span>
          </motion.h1>
          <motion.p
            custom={0.16}
            variants={fadeUp}
            className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg max-w-xl mx-auto"
            style={{ color: "#4C6178" }}
          >
            MyCareerGuru builds you a personalized roadmap, helps with homework, and tests what you&apos;ve learned —
            no institute account needed.
          </motion.p>
          <motion.div custom={0.24} variants={fadeUp} className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/mycareerguru/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:scale-[1.03]"
              style={{
                background: `linear-gradient(135deg, ${GOLD.vivid} 0%, ${GOLD.deep} 100%)`,
                boxShadow: "0 8px 24px rgba(247,151,30,0.3)",
              }}
            >
              Create your free account <IconArrowRight size={16} />
            </Link>
            <Link
              href="/mycareerguru/login"
              className="w-full sm:w-auto text-center px-6 py-3.5 rounded-xl text-sm font-semibold transition-all"
              style={{ color: "#0F2748", border: `1px solid ${SKY.border}`, background: "#FFFFFF" }}
            >
              I already have an account
            </Link>
          </motion.div>

          {/* Mascot — a small pseudo-3D graduation-cap-and-books illustration */}
          <motion.div custom={0.3} variants={fadeUp} className="mt-6 sm:mt-8 flex justify-center">
            <Mascot className="w-24 h-24 sm:w-28 sm:h-28" />
          </motion.div>

          {/* Stat strip */}
          <motion.div custom={0.36} variants={fadeUp} className="mt-6 sm:mt-9 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {STATS.map((s) => (
              <div key={s.label} className="flex items-center gap-2 sm:gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl" style={CARD}>
                <span style={{ color: s.accent.text }}>{s.icon}</span>
                <span className="font-bold text-xs sm:text-sm" style={{ color: "#0F2748" }}>{s.value}</span>
                <span className="text-[11px] sm:text-xs" style={{ color: "#7A8CA0" }}>{s.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Subjects strip */}
        <motion.div
          className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-12 sm:pb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <div className="flex items-center justify-center gap-3 mb-4 sm:mb-5">
            <span className="h-px w-8 sm:w-12" style={{ background: SKY.border }} />
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest" style={{ color: "#7A8CA0" }}>
              Study any subject, your way
            </p>
            <span className="h-px w-8 sm:w-12" style={{ background: SKY.border }} />
          </div>
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
      </div>

      {/* Features band — warm gold wash */}
      <div className="relative" style={{ background: "linear-gradient(180deg, #FFFAF0 0%, #FFF6E6 100%)" }}>
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 px-4 sm:px-6 py-14 sm:py-20">
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
              <h3 className="font-bold text-sm mb-1.5" style={{ color: "#0F2748" }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "#7A8CA0" }}>{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How it works band — sky wash, with a dashed timeline connector */}
      <div className="relative" style={{ background: "linear-gradient(180deg, #F0F9FF 0%, #E9F5FF 100%)" }}>
        <motion.div
          className="relative max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="font-black text-xl sm:text-2xl md:text-3xl tracking-tight" style={{ color: "#0F2748" }}>How it works</h2>
            <p className="text-xs sm:text-sm mt-2" style={{ color: "#7A8CA0" }}>Three steps from “what should I study?” to a finished plan.</p>
          </div>
          <div className="relative grid sm:grid-cols-3 gap-4 sm:gap-6">
            <div
              className="hidden sm:block absolute top-[38px] left-[16%] right-[16%] border-t-2 border-dashed pointer-events-none"
              style={{ borderColor: SKY.border }}
            />
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
                  style={{ backgroundImage: `linear-gradient(135deg, ${GOLD.vivid}, ${GOLD.deep})` }}
                >
                  {s.step}
                </span>
                <h3 className="font-bold text-sm mt-3 mb-1.5" style={{ color: "#0F2748" }}>{s.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "#7A8CA0" }}>{s.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* FAQ band — warm gold wash */}
      <div className="relative" style={{ background: "linear-gradient(180deg, #FFF6E6 0%, #FFFAF0 100%)" }}>
        <motion.div
          className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="font-black text-xl sm:text-2xl md:text-3xl tracking-tight" style={{ color: "#0F2748" }}>Frequently asked questions</h2>
            <p className="text-xs sm:text-sm mt-2" style={{ color: "#7A8CA0" }}>Everything you need to know before you start.</p>
          </div>
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {FAQS.map((f, i) => (
              <FaqItem key={f.q} q={f.q} a={f.a} defaultOpen={i === 0} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* About / Footer — deep navy band, echoing the logo's own navy */}
      <div className="relative" style={{ background: "linear-gradient(160deg, #123A63 0%, #0B2540 100%)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12 grid gap-8 sm:grid-cols-2 md:grid-cols-[1.3fr_1fr_1fr] md:gap-10">
          <div>
            <div className="inline-block bg-white rounded-xl px-3 py-2 mb-3">
              <Image src="/pics/Logo17.png" alt="MyCareerGuru" width={196} height={74} className="h-10 sm:h-12 w-auto object-contain" />
            </div>
            <p className="text-xs leading-relaxed max-w-sm" style={{ color: "#9FB6CC" }}>
              MyCareerGuru is an AI-guided study companion built for self-paced learning: a personalized roadmap,
              homework help, and practice tests for whatever you&apos;re studying — no classroom required.
              It&apos;s part of the Gradelytics platform, and institutes can enable it for their students too.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#FFD166" }}>Get started</p>
            <div className="flex flex-col gap-2">
              <Link href="/mycareerguru/register" className="text-xs transition-colors" style={{ color: "#9FB6CC" }}>
                Create an account
              </Link>
              <Link href="/mycareerguru/login" className="text-xs transition-colors" style={{ color: "#9FB6CC" }}>
                Log in
              </Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#FFD166" }}>What you get</p>
            <div className="flex flex-col gap-2">
              <span className="text-xs" style={{ color: "#9FB6CC" }}>AI-built weekly roadmaps</span>
              <span className="text-xs" style={{ color: "#9FB6CC" }}>Homework help & AI notes</span>
              <span className="text-xs" style={{ color: "#9FB6CC" }}>Practice tests with instant feedback</span>
            </div>
          </div>
        </div>
        <div className="py-5 text-center px-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-[11px] font-medium" style={{ color: "#6E88A2" }}>
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
        <span className="font-semibold text-xs sm:text-sm" style={{ color: "#0F2748" }}>{q}</span>
        <IconChevronDown
          size={18}
          className="shrink-0 transition-transform duration-300"
          style={{ color: GOLD.vivid, transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 sm:px-5">
          <p className="text-xs leading-relaxed" style={{ color: "#7A8CA0" }}>{a}</p>
        </div>
      )}
    </div>
  );
}

// A small pseudo-3D graduation-cap-on-books mascot, built from gradient-filled
// SVG shapes with a soft ground shadow to fake depth — no external art asset.
function Mascot({ className }) {
  return (
    <motion.svg
      viewBox="0 0 200 190"
      className={className}
      aria-hidden="true"
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <defs>
        <linearGradient id="mg-navy" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1E4E85" />
          <stop offset="100%" stopColor="#0F2748" />
        </linearGradient>
        <linearGradient id="mg-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFD166" />
          <stop offset="100%" stopColor="#F7971E" />
        </linearGradient>
        <linearGradient id="mg-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="172" rx="58" ry="9" fill="#0F2748" opacity="0.10" />
      <rect x="52" y="128" width="96" height="18" rx="5" fill="url(#mg-gold)" />
      <rect x="58" y="110" width="84" height="18" rx="5" fill="url(#mg-sky)" />
      <rect x="64" y="92" width="72" height="18" rx="5" fill="url(#mg-navy)" />
      <polygon points="100,34 174,64 100,94 26,64" fill="url(#mg-navy)" />
      <rect x="91" y="64" width="18" height="30" rx="5" fill="#0B2540" />
      <circle cx="152" cy="76" r="6" fill="url(#mg-gold)" />
      <line x1="152" y1="64" x2="152" y2="76" stroke="#F7971E" strokeWidth="3" strokeLinecap="round" />
    </motion.svg>
  );
}
