"use client";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
  useInView,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
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
  IconTrendingUp,
  IconCircleCheck,
  IconCheck,
  IconFileText,
  IconCalendarEvent,
  IconMail,
  IconPhone,
  IconMapPin,
} from "@tabler/icons-react";

// A two-color light palette drawn straight from the MyCareerGuru mark itself
// (its navy silhouette + gold "G") — sky blue stands in for the mark's navy,
// gold stays gold. Each has a "text" shade tuned for contrast on light tints,
// and a "tint"/"border" pair for soft chips and cards.
const SKY = { vivid: "#38BDF8", deep: "#0EA5E9", text: "#0369A1", tint: "rgba(14,165,233,0.10)", border: "rgba(14,165,233,0.30)" };
const GOLD = { vivid: "#F7971E", deep: "#E8A33D", text: "#B45309", tint: "rgba(247,151,30,0.10)", border: "rgba(247,151,30,0.32)" };
const NAVY = "#0F2748";

const FEATURES = [
  {
    icon: <IconTarget size={22} />,
    title: "Personalized Roadmaps",
    description: "An AI-built, week-by-week learning plan tailored to your subject, goal, and pace.",
    accent: SKY,
    visual: "roadmap",
  },
  {
    icon: <IconRobot size={22} />,
    title: "Homework Help & AI Notes",
    description: "Upload a problem set or study material and get worked solutions or structured notes back.",
    accent: GOLD,
    visual: "notes",
  },
  {
    icon: <IconChecklist size={22} />,
    title: "Test Engine",
    description: "Practice tests generated for exactly what you're studying, with instant feedback.",
    accent: SKY,
    visual: "quiz",
  },
];

const STATS = [
  { icon: <IconSparkles size={18} />, label: "AI-built roadmaps", value: "100%", accent: SKY },
  { icon: <IconClockHour4 size={18} />, label: "Learn at your pace", value: "24/7", accent: GOLD },
  { icon: <IconBulb size={18} />, label: "Instant feedback", value: "Every test", accent: SKY },
];

// Same four subjects as before; each now also carries a tiny sample roadmap
// shown in the interactive preview under the chips.
const SUBJECTS = [
  {
    name: "Mathematics", icon: "📐", accent: GOLD,
    weeks: [
      { week: "Week 1", topic: "Algebra Foundations", steps: ["Core concepts", "Practice Set", "10-Min Diagnostic"] },
      { week: "Week 2", topic: "Functions & Graphs", steps: ["Worked examples", "Practice Set", "Mini Test"] },
      { week: "Week 3", topic: "Intro to Calculus", steps: ["Limits primer", "Practice Set", "Checkpoint Quiz"] },
    ],
  },
  {
    name: "Physics", icon: "⚛️", accent: SKY,
    weeks: [
      { week: "Week 1", topic: "Laws of Motion", steps: ["Concept notes", "Practice Set", "10-Min Diagnostic"] },
      { week: "Week 2", topic: "Kinematics", steps: ["Graph reading", "Practice Set", "Mini Test"] },
      { week: "Week 3", topic: "Work, Energy & Power", steps: ["Worked solutions", "Practice Set", "Checkpoint Quiz"] },
    ],
  },
  {
    name: "English", icon: "📖", accent: GOLD,
    weeks: [
      { week: "Week 1", topic: "Grammar Essentials", steps: ["Rules & examples", "Practice Set", "10-Min Diagnostic"] },
      { week: "Week 2", topic: "Reading Comprehension", steps: ["Passage strategies", "Practice Set", "Mini Test"] },
      { week: "Week 3", topic: "Essay Writing", steps: ["Structure notes", "Draft & review", "Checkpoint Quiz"] },
    ],
  },
  {
    name: "History", icon: "🏛️", accent: SKY,
    weeks: [
      { week: "Week 1", topic: "Ancient Civilizations", steps: ["Timeline notes", "Practice Set", "10-Min Diagnostic"] },
      { week: "Week 2", topic: "Empires & Trade", steps: ["Key events", "Practice Set", "Mini Test"] },
      { week: "Week 3", topic: "Modern World", steps: ["Cause & effect notes", "Practice Set", "Checkpoint Quiz"] },
    ],
  },
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

// Deterministic stardust positions (no Math.random → no hydration mismatch).
const DUST = [
  [8, 20, 5, "g"], [18, 70, 4, "s"], [30, 12, 3, "s"], [42, 88, 5, "g"], [55, 8, 4, "g"],
  [66, 80, 3, "s"], [78, 18, 5, "s"], [90, 62, 4, "g"], [12, 45, 3, "g"], [88, 38, 3, "s"],
  [24, 92, 3, "s"], [72, 50, 4, "g"], [48, 30, 3, "s"], [96, 84, 4, "g"],
];

const EASE = [0.22, 1, 0.36, 1];

const CARD = { background: "#FFFFFF", border: "1px solid #E7EEF5", boxShadow: "0 4px 24px rgba(15,45,75,0.06)" };
const GLASS = {
  background: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  border: "1px solid rgba(255,255,255,0.85)",
  boxShadow: "0 20px 50px -12px rgba(11,31,58,0.10)",
};

/* ───────────────────────── hooks ───────────────────────── */

// Touch-first devices: skip hover tilt / magnetic / pointer parallax.
function useIsTouch() {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    const on = () => setTouch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return touch;
}

/* ───────────────────────── page ───────────────────────── */

export default function MyCareerGuruLanding() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="relative overflow-x-clip"
      style={{
        // One continuous atmospheric canvas — soft layered gradients, no hard colour bands.
        background: [
          "radial-gradient(60% 38% at 14% 0%, rgba(125,190,255,0.30), transparent 70%)",
          "radial-gradient(45% 30% at 92% 14%, rgba(247,151,30,0.13), transparent 70%)",
          "radial-gradient(60% 24% at 18% 40%, rgba(255,236,205,0.85), transparent 70%)",
          "radial-gradient(55% 24% at 88% 56%, rgba(150,205,255,0.26), transparent 70%)",
          "radial-gradient(60% 26% at 30% 80%, rgba(255,236,205,0.80), transparent 70%)",
          "#F4F9FF",
        ].join(","),
      }}
    >
      {/* Scroll progress */}
      <motion.div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-50 h-[3px] origin-left"
        style={{ scaleX: progress, background: `linear-gradient(90deg, ${GOLD.vivid}, #FB923C, ${GOLD.deep})` }}
      />

      {/* Nav — sticky; morphs into a floating glass pill once the page scrolls */}
      <div className="sticky top-0 z-40 flex justify-center px-2 sm:px-4 pointer-events-none">
        <motion.nav
          layout
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          className="pointer-events-auto flex w-full items-center justify-between"
          style={{
            maxWidth: scrolled ? "72rem" : "100%",
            marginTop: scrolled ? 10 : 0,
            borderRadius: scrolled ? 9999 : 0,
            padding: scrolled ? "6px 14px" : "12px 16px",
            background: scrolled ? "rgba(255,255,255,0.72)" : "rgba(240,249,255,0.0)",
            backdropFilter: scrolled ? "blur(20px)" : "none",
            WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
            border: scrolled ? "1px solid rgba(255,255,255,0.7)" : "1px solid transparent",
            boxShadow: scrolled ? "0 12px 32px rgba(15,45,75,0.12)" : "none",
          }}
        >
          <Link href="/mycareerguru" className="flex items-center shrink-0 md:ml-6">
            <Image
              src="/pics/Logo17.png"
              alt="MyCareerGuru"
              width={224}
              height={84}
              className={`w-auto object-contain transition-all duration-300 ${
                scrolled ? "h-10 sm:h-12" : "h-11 sm:h-14 md:h-16 lg:h-20"
              }`}
              priority
            />
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-3 md:mr-6">
            <Link
              href="/mycareerguru/login"
              className="px-2.5 py-2 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors hover:text-[#B45309]"
              style={{ color: NAVY }}
            >
              Log in
            </Link>
            <Magnetic strength={0.25}>
              <Link
                href="/mycareerguru/register"
                className="relative inline-flex overflow-hidden px-3 py-2 sm:px-5 rounded-full text-xs sm:text-sm font-semibold text-white whitespace-nowrap"
                style={{
                  background: `linear-gradient(135deg, ${GOLD.vivid} 0%, ${GOLD.deep} 100%)`,
                  boxShadow: "0 8px 20px rgba(247,151,30,0.35)",
                }}
              >
                <Sheen />
                <span className="relative">Get started</span>
              </Link>
            </Magnetic>
          </div>
        </motion.nav>
      </div>

      {/* Hero */}
      <HeroSection />

      {/* Subjects + live sample roadmap */}
      <SubjectExplorer />

      {/* Features */}
      <div className="relative">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 px-4 sm:px-6 py-14 sm:py-20">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} f={f} i={i} />
          ))}
        </div>
      </div>

      {/* How it works */}
      <HowItWorks />

      {/* FAQ */}
      <div className="relative">
        <motion.div
          className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="font-black text-2xl sm:text-3xl md:text-4xl tracking-tight" style={{ color: NAVY }}>Frequently asked questions</h2>
            <p className="text-xs sm:text-sm mt-2" style={{ color: "#7A8CA0" }}>Everything you need to know before you start.</p>
          </div>
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {FAQS.map((f, i) => (
              <FaqItem key={f.q} q={f.q} a={f.a} defaultOpen={i === 0} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Pre-footer conversion strip */}
      <CtaStrip />

      {/* About / Footer — deep navy band, echoing the logo's own navy */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, #123A63 0%, #0B2540 100%)" }}>
        {/* footer atmosphere: gold hairline, warm + cool glows, faint dot texture */}
        <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.vivid}, transparent)` }} />
        <div aria-hidden="true" className="absolute -top-24 -left-16 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(247,151,30,0.16)" }} />
        <div aria-hidden="true" className="absolute -bottom-32 right-0 w-[28rem] h-[28rem] rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(56,189,248,0.14)" }} />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "22px 22px" }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-14 grid gap-8 sm:grid-cols-2 md:grid-cols-[1.3fr_1fr_1fr] md:gap-10">
          <div>
            {/* Logo plate — the logo file is untouched. A gold-to-sky gradient frame around a bright
                "studio" panel makes the navy + orange mark pop against the dark footer. */}
            <motion.div
              className="relative mb-6 w-fit"
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <div
                aria-hidden="true"
                className="absolute -inset-5 rounded-[2.5rem] blur-3xl pointer-events-none"
                style={{ background: "radial-gradient(60% 60% at 50% 55%, rgba(247,151,30,0.45), rgba(56,189,248,0.22) 65%, transparent)" }}
              />
              <div
                className="relative rounded-[1.75rem] p-[2px]"
                style={{
                  background: "linear-gradient(135deg, #FFD166 0%, rgba(255,255,255,0.65) 38%, #38BDF8 100%)",
                  boxShadow: "0 24px 50px -16px rgba(0,0,0,0.6)",
                }}
              >
                <div
                  className="relative overflow-hidden rounded-[calc(1.75rem-2px)] px-5 sm:px-7 py-2"
                  style={{ background: "radial-gradient(120% 130% at 25% 0%, #FFFFFF 0%, #F2F8FF 52%, #FFEFD2 100%)" }}
                >
                  {/* slow light sweep */}
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-y-0 w-1/3 -skew-x-12 pointer-events-none"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)" }}
                    initial={{ left: "-40%" }}
                    animate={{ left: ["-40%", "130%"] }}
                    transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 4.5, ease: "easeInOut" }}
                  />
                  <Image
                    src="/pics/Logo17.png"
                    alt="MyCareerGuru"
                    width={300}
                    height={113}
                    className="relative h-28 sm:h-32 w-auto object-contain -my-2"
                  />
                </div>
              </div>
            </motion.div>
            <p className="text-xs leading-relaxed max-w-sm" style={{ color: "#9FB6CC" }}>
              MyCareerGuru is an AI-guided study companion built for self-paced learning: a personalized roadmap,
              homework help, and practice tests for whatever you&apos;re studying — no classroom required.
              It&apos;s part of the Gradelytics platform, and institutes can enable it for their students too.
            </p>
            {/* Contact details — same as the Gradelytics landing footer */}
            <div className="mt-4 flex flex-col gap-2.5 text-xs" style={{ color: "#C7D6E6" }}>
              <div className="flex items-center gap-2.5">
                <IconMail size={16} style={{ color: "#FFD166" }} />
                <span>info@antarpath.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <IconPhone size={16} style={{ color: "#FFD166" }} />
                <span>+91 72780 03671</span>
              </div>
              <div className="flex items-center gap-2.5">
                <IconMapPin size={16} style={{ color: "#FFD166" }} />
                <span>India</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#FFD166" }}>Get started</p>
            <div className="flex flex-col gap-2">
              <Link href="/mycareerguru/register" className="text-xs transition-colors hover:text-white" style={{ color: "#9FB6CC" }}>
                Create an account
              </Link>
              <Link href="/mycareerguru/login" className="text-xs transition-colors hover:text-white" style={{ color: "#9FB6CC" }}>
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

/* ───────────────────────── small shared pieces ───────────────────────── */

// Light sweep across a button on hover (parent needs `group`-free hover: uses whileHover on a wrapper).
function Sheen() {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 -translate-x-full transition-transform duration-700 ease-out group-hover:translate-x-full"
      style={{ background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)" }}
    />
  );
}

// Pulls toward the cursor, springs back. No-op on touch.
function Magnetic({ children, strength = 0.35, className = "" }) {
  const ref = useRef(null);
  const touch = useIsTouch();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 15, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 15, mass: 0.4 });
  return (
    <motion.div
      ref={ref}
      className={`group inline-block ${className}`}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (touch || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.div>
  );
}

// Masked, word-by-word reveal. `gradient` paints each word with the gold gradient.
function Words({ text, delay = 0, gradient = false }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom pt-[0.06em] pb-[0.22em] pl-[0.06em] pr-[0.06em] -mt-[0.06em] -mb-[0.1em] -ml-[0.06em] mr-[0.2em] last:mr-0">
          <motion.span
            className={`inline-block ${gradient ? "bg-clip-text text-transparent" : ""}`}
            style={
              gradient === "brand"
                ? { backgroundImage: "linear-gradient(100deg, #FF7A00 0%, #FF9A1F 45%, #FFB52E 100%)", paddingRight: "0.04em" }
                : gradient
                ? { backgroundImage: `linear-gradient(135deg, ${GOLD.vivid}, #FB923C 60%, ${GOLD.deep})` }
                : undefined
            }
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, delay: delay + i * 0.08, ease: EASE }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </>
  );
}

/* ───────────────────────── hero ───────────────────────── */

function HeroSection() {
  const { scrollY } = useScroll();
  const yA = useTransform(scrollY, [0, 600], [0, -50]);
  const yB = useTransform(scrollY, [0, 600], [0, -100]);

  return (
    <div className="relative">
      <div className="absolute top-10 left-1/4 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#38BDF8]/15 blur-[100px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/5 w-60 h-60 sm:w-80 sm:h-80 rounded-full bg-[#F7971E]/15 blur-[90px] sm:blur-[120px] pointer-events-none" />

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

      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 pt-6 sm:pt-12 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 mb-4 sm:mb-5 px-3 py-1.5 sm:px-3.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider"
          style={{ ...GLASS, color: GOLD.text, border: `1px solid ${GOLD.border}` }}
        >
          <span className="relative flex items-center justify-center w-4 h-4">
            <span className="absolute inline-flex w-full h-full rounded-full animate-ping" style={{ background: GOLD.vivid, opacity: 0.35 }} />
            <IconRocket size={13} className="relative" />
          </span>
          The Personal Learning Assistant
        </motion.div>

        <h1 className="text-[2rem] sm:text-5xl md:text-6xl font-black leading-[1.08]" style={{ color: NAVY, letterSpacing: "-0.03em" }}>
          <Words text="Learn anything, guided by" delay={0.1} />
          <Words text="MyCareerGuru" delay={0.45} gradient="brand" />
          <br />
          <span className="relative inline-block mt-1">
            <Words text="at your own pace." delay={0.6} gradient />
            <motion.span
              aria-hidden="true"
              className="absolute left-0 -bottom-0.5 h-[5px] w-full rounded-full origin-left"
              style={{ background: `linear-gradient(90deg, ${GOLD.vivid}, #FB923C)` }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.35, duration: 0.9, ease: EASE }}
            />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.7 }}
          className="mt-5 sm:mt-6 text-sm sm:text-base md:text-lg max-w-xl mx-auto"
          style={{ color: "#4C6178" }}
        >
          MyCareerGuru builds you a personalized roadmap, helps with homework, and tests what you&apos;ve learned —
          no institute account needed.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.7 }}
          className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <Magnetic className="w-full sm:w-auto">
            <Link
              href="/mycareerguru/register"
              className="relative overflow-hidden w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-white font-bold text-sm"
              style={{
                background: `linear-gradient(180deg, ${GOLD.vivid} 0%, ${GOLD.deep} 100%)`,
                boxShadow:
                  "0 10px 28px rgba(247,151,30,0.38), inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -4px 0 rgba(160,90,0,0.30)",
              }}
            >
              <Sheen />
              <span className="relative">Create your free account</span>
              <IconArrowRight size={16} className="relative transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
          </Magnetic>
          <Magnetic strength={0.2} className="w-full sm:w-auto">
            <Link
              href="/mycareerguru/login"
              className="w-full sm:w-auto inline-block text-center px-6 py-3.5 rounded-2xl text-sm font-semibold transition-colors hover:bg-white"
              style={{ ...GLASS, color: NAVY, border: `1px solid ${SKY.border}` }}
            >
              I already have an account
            </Link>
          </Magnetic>
        </motion.div>
      </div>

      {/* 3D diorama + floating glass cards */}
      <div className="relative z-10 max-w-5xl mx-auto h-[300px] sm:h-[360px] mt-2">
        <Diorama />
        <motion.div style={{ y: yA }} className="hidden md:block absolute left-[4%] top-[16%] z-20">
          <FloatCard delay={1.5}>
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: SKY.tint, color: SKY.text }}>
                <IconTrendingUp size={18} />
              </span>
              <div>
                <p className="text-[11px] font-medium" style={{ color: "#7A8CA0" }}>Week 2 • Kinematics Roadmap</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 w-28 rounded-full overflow-hidden" style={{ background: "#E2E8F0" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${GOLD.vivid}, ${GOLD.deep})` }}
                      initial={{ width: 0 }}
                      animate={{ width: "84%" }}
                      transition={{ delay: 2, duration: 1.2, ease: EASE }}
                    />
                  </div>
                  <span className="text-xs font-bold" style={{ color: NAVY }}>84%</span>
                </div>
              </div>
            </div>
          </FloatCard>
        </motion.div>
        <motion.div style={{ y: yB }} className="hidden md:block absolute right-[4%] top-[38%] z-20">
          <FloatCard delay={1.8}>
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.12)", color: "#059669" }}>
                <IconCircleCheck size={18} />
              </span>
              <div>
                <p className="text-[11px] font-medium" style={{ color: "#7A8CA0" }}>Instant Test Feedback</p>
                <p className="text-lg font-black leading-tight" style={{ color: NAVY }}>
                  9<span style={{ color: "#94A3B8" }}>/10</span>
                </p>
              </div>
            </div>
          </FloatCard>
        </motion.div>
      </div>

      {/* Stat strip — 3D tilted pills, staggered in */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 px-4 pb-4" style={{ perspective: 900 }}>
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 40, rotateX: 25 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, type: "spring", stiffness: 110, damping: 16 }}
            whileHover={{ y: -4 }}
            className="group flex items-center gap-2 sm:gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full"
            style={GLASS}
          >
            <span
              className="transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110"
              style={{ color: s.accent.text }}
            >
              {s.icon}
            </span>
            <span className="font-bold text-xs sm:text-sm" style={{ color: NAVY }}>{s.value}</span>
            <span className="text-[11px] sm:text-xs" style={{ color: "#7A8CA0" }}>{s.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function FloatCard({ children, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 120, damping: 16 }}
    >
      <motion.div
        className="rounded-2xl p-4"
        style={GLASS}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5 + delay, repeat: Infinity, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ───────── CSS-3D diorama (real 3D transforms, no extra dependencies) ───────── */

// A true 3D box from six transformed faces. `faces` overrides per-face styles.
function Cuboid({ w, h, d, faces }) {
  const base = { position: "absolute", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };
  const f = (k) => faces[k] || faces.all || {};
  return (
    <div style={{ position: "relative", width: w, height: h, transformStyle: "preserve-3d", marginLeft: -w / 2, marginTop: -h / 2 }}>
      <div style={{ ...base, width: w, height: h, transform: `translateZ(${d / 2}px)`, ...f("front") }} />
      <div style={{ ...base, width: w, height: h, transform: `rotateY(180deg) translateZ(${d / 2}px)`, ...f("back") }} />
      <div style={{ ...base, width: d, height: h, left: (w - d) / 2, transform: `rotateY(90deg) translateZ(${w / 2}px)`, ...f("right") }} />
      <div style={{ ...base, width: d, height: h, left: (w - d) / 2, transform: `rotateY(-90deg) translateZ(${w / 2}px)`, ...f("left") }} />
      <div style={{ ...base, width: w, height: d, top: (h - d) / 2, transform: `rotateX(90deg) translateZ(${h / 2}px)`, ...f("top") }} />
      <div style={{ ...base, width: w, height: d, top: (h - d) / 2, transform: `rotateX(-90deg) translateZ(${h / 2}px)`, ...f("bottom") }} />
    </div>
  );
}

// Zero-size anchor so children can be positioned by their centre in 3D space.
function At({ x = 0, y = 0, z = 0, ry = 0, children, style }) {
  return (
    <div
      style={{
        position: "absolute", left: "50%", top: "50%", width: 0, height: 0,
        transformStyle: "preserve-3d",
        transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${ry}deg)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const PAGES = {
  background: "repeating-linear-gradient(180deg, #FFF8EC 0 3px, #F0E4CC 3px 4px)",
};
function Book({ w, h, d, color, shade, ...pos }) {
  const cover = { background: `linear-gradient(135deg, ${color}, ${shade})` };
  return (
    <At {...pos}>
      <Cuboid
        w={w} h={h} d={d}
        faces={{
          top: cover, bottom: cover, back: cover,
          left: { background: `linear-gradient(180deg, ${shade}, ${color})` },
          front: PAGES,
          right: PAGES,
        }}
      />
    </At>
  );
}

function Spin({ children, duration = 20, reverse = false }) {
  return (
    <motion.div
      style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0, transformStyle: "preserve-3d" }}
      animate={{ rotateY: reverse ? [360, 0] : [0, 360] }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.div>
  );
}

function Diorama() {
  const reduced = useReducedMotion();
  const touch = useIsTouch();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const ry = useSpring(useTransform(mx, [-1, 1], [-32, 32]), { stiffness: 70, damping: 18 });
  const rxRaw = useTransform(my, [-1, 1], [-8, 8]);
  const rx = useSpring(useTransform(rxRaw, (v) => v - 16), { stiffness: 70, damping: 18 });
  const live = !reduced && !touch;

  // Cursor parallax across the whole viewport, not just the canvas.
  useEffect(() => {
    if (!live) { mx.set(0); my.set(0); return undefined; }
    const on = (e) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, [live, mx, my]);

  const loop = (dur, delay = 0) => (reduced ? {} : { duration: dur, delay, repeat: Infinity, ease: "easeInOut" });

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ perspective: 1100 }}
    >
      <div className="relative scale-[0.78] sm:scale-100" style={{ width: 340, height: 320 }}>
        {/* glow + ground shadow */}
        <div className="absolute left-1/2 top-[62%] w-72 h-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(247,151,30,0.28), rgba(56,189,248,0.18) 55%, transparent 72%)" }} />
        <div className="absolute left-1/2 bottom-[8%] w-56 h-7 -translate-x-1/2 rounded-full blur-md" style={{ background: "rgba(15,39,72,0.18)" }} />

        <motion.div
          style={{
            position: "absolute", inset: 0, transformStyle: "preserve-3d",
            rotateX: live ? rx : -16, rotateY: live ? ry : -20,
          }}
        >
          {/* books */}
          <Book w={160} h={26} d={112} color="#F7B23B" shade="#D9790A" y={72} ry={4} />
          <Book w={148} h={24} d={106} color="#38BDF8" shade="#0B78B8" y={46} ry={-14} />
          <Book w={136} h={24} d={100} color="#1E4E85" shade="#0F2748" y={22} ry={9} />

          {/* graduation cap, floating above the stack */}
          <motion.div
            style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}
            animate={reduced ? undefined : { y: [0, -9, 0] }}
            transition={loop(4.5)}
          >
            <At y={-14} ry={0}>
              <Cuboid w={70} h={34} d={70} faces={{ all: { background: "linear-gradient(135deg,#1E4E85,#0B2540)" }, top: { background: "#0B2540" } }} />
            </At>
            <At y={-36} ry={45}>
              <Cuboid
                w={150} h={9} d={150}
                faces={{
                  top: { background: "linear-gradient(135deg,#2A62A4,#0F2748)" },
                  bottom: { background: "#0B2540" },
                  all: { background: "linear-gradient(180deg,#F7B23B,#D9790A)" },
                }}
              />
            </At>
            {/* button + tassel */}
            <At y={-45}>
              <div style={{ width: 14, height: 14, marginLeft: -7, marginTop: -7, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, #FFE29A, #F7971E)" }} />
            </At>
            <At x={0} y={-28} z={0} ry={45}>
              <At x={73} y={0} z={73}>
                <div style={{ width: 3, height: 40, marginLeft: -1.5, background: "linear-gradient(#FFD166,#E8A33D)", borderRadius: 2 }} />
                <div style={{ position: "absolute", top: 34, left: -6, width: 12, height: 22, borderRadius: 6, background: "linear-gradient(135deg,#FFE29A,#E8920F)", boxShadow: "0 4px 10px rgba(232,146,15,0.5)" }} />
              </At>
            </At>
          </motion.div>

          {/* orbiting artifacts */}
          <Spin duration={16}>
            <At x={150} y={-70}>
              <Spin duration={16} reverse>
                <motion.div
                  animate={reduced ? undefined : { y: [0, -10, 0] }}
                  transition={loop(3.4)}
                  style={{ width: 46, height: 46, marginLeft: -23, marginTop: -23, borderRadius: "50%", border: "8px solid rgba(125,211,252,0.65)", background: "rgba(255,255,255,0.25)", boxShadow: "0 8px 20px rgba(14,165,233,0.35), inset 0 0 8px rgba(255,255,255,0.8)", backdropFilter: "blur(2px)" }}
                />
              </Spin>
            </At>
          </Spin>
          <Spin duration={22} reverse>
            <At x={-140} y={20}>
              <motion.div
                style={{ position: "relative", transformStyle: "preserve-3d" }}
                animate={reduced ? undefined : { rotateX: [0, 360], rotateY: [0, 360] }}
                transition={reduced ? undefined : { duration: 9, repeat: Infinity, ease: "linear" }}
              >
                <Cuboid w={34} h={34} d={34} faces={{ all: { background: "linear-gradient(135deg, rgba(125,211,252,0.9), rgba(14,165,233,0.75))", border: "1px solid rgba(255,255,255,0.6)" } }} />
              </motion.div>
            </At>
          </Spin>
          <Spin duration={13}>
            <At x={-120} y={-110}>
              <Spin duration={13} reverse>
                <motion.div
                  animate={reduced ? undefined : { y: [0, -12, 0] }}
                  transition={loop(2.8, 0.4)}
                  style={{ width: 26, height: 26, marginLeft: -13, marginTop: -13, borderRadius: "50%", background: "radial-gradient(circle at 30% 28%, #FFF1C2, #F7971E 70%)", boxShadow: "0 0 22px 6px rgba(247,151,30,0.55)" }}
                />
              </Spin>
            </At>
          </Spin>
        </motion.div>

        {/* stardust */}
        {DUST.map(([l, t, s, c], i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{ left: `${l}%`, top: `${t}%`, width: s, height: s, background: c === "g" ? "#F7B23B" : "#8FD0FF", boxShadow: `0 0 8px ${c === "g" ? "#F7B23B" : "#8FD0FF"}` }}
            animate={reduced ? { opacity: 0.7 } : { y: [0, -14, 0], opacity: [0.35, 1, 0.35] }}
            transition={loop(3 + (i % 5) * 0.7, i * 0.2)}
          />
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── subject explorer ───────────────────────── */

function SubjectExplorer() {
  const [active, setActive] = useState(1); // Physics, per the example
  const subject = SUBJECTS[active];

  return (
    <motion.div
      className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-8 sm:pb-12"
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

      <div role="tablist" aria-label="Subjects" className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {SUBJECTS.map((s, i) => {
          const on = i === active;
          return (
            <button
              key={s.name}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(i)}
              className="relative flex items-center gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-transform hover:-translate-y-0.5 active:scale-95"
              style={on ? { color: "#fff" } : { ...GLASS, color: s.accent.text, border: `1px solid ${s.accent.border}` }}
            >
              {on && (
                <motion.span
                  layoutId="subject-pill"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="absolute inset-0 rounded-full"
                  style={{ background: `linear-gradient(135deg, ${NAVY}, #1E4E85)`, boxShadow: "0 10px 24px -8px rgba(15,39,72,0.55)" }}
                />
              )}
              <span className="relative">{s.icon}</span>
              <span className="relative">{s.name}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 min-h-[21rem] sm:min-h-[11.5rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={subject.name}
            role="tabpanel"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.28 }}
            className="rounded-3xl p-4 sm:p-5 text-left"
            style={GLASS}
          >
            <p className="flex items-center gap-2 mb-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: GOLD.text }}>
              <IconCalendarEvent size={15} /> Live sample roadmap · {subject.name}
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {subject.weeks.map((w, i) => (
                <motion.div
                  key={w.week}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.07 * i }}
                  className="rounded-2xl p-3.5"
                  style={{ background: "rgba(255,255,255,0.75)", border: "1px solid #E7EEF5" }}
                >
                  <p className="text-[10px] font-bold uppercase" style={{ color: "#94A3B8" }}>{w.week}</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: NAVY }}>{w.topic}</p>
                  <p className="text-[11px] leading-relaxed mt-1.5" style={{ color: "#7A8CA0" }}>{w.steps.join(" → ")}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ───────────────────────── feature cards ───────────────────────── */

function FeatureVisual({ kind, on }) {
  if (kind === "roadmap") {
    return (
      <div className="mt-4 space-y-2" aria-hidden="true">
        {[88, 64, 40].map((w, i) => (
          <div key={i} className="h-2 rounded-full overflow-hidden" style={{ background: SKY.tint }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${GOLD.vivid}, ${GOLD.deep})` }}
              animate={{ width: on ? `${w}%` : "12%" }}
              transition={{ duration: 0.9, delay: i * 0.12, ease: EASE }}
            />
          </div>
        ))}
      </div>
    );
  }
  if (kind === "notes") {
    return (
      <div className="mt-4 flex items-center gap-3 h-14" aria-hidden="true">
        <motion.div
          className="w-10 h-12 rounded-lg flex items-center justify-center bg-white"
          style={{ border: `1px solid ${GOLD.border}`, boxShadow: "0 6px 14px rgba(15,45,75,0.10)", color: GOLD.text }}
          animate={{ rotate: on ? -6 : 0, y: on ? -4 : 0 }}
        >
          <IconFileText size={20} />
        </motion.div>
        <motion.span animate={{ x: on ? 4 : 0, opacity: on ? 1 : 0.4 }} style={{ color: GOLD.text }}>→</motion.span>
        <div className="flex-1 space-y-1.5">
          {[70, 90, 55].map((w, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-1.5"
              animate={{ opacity: on ? 1 : 0.35, x: on ? 0 : -6 }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD.vivid }} />
              <span className="h-1.5 rounded-full" style={{ width: `${w}%`, background: "#CBD5E1" }} />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="mt-4 flex gap-2.5" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
          animate={{
            scale: on ? 1 : 0.88,
            backgroundColor: on ? (i === 2 ? "#F59E0B" : "#10B981") : "#E2E8F0",
          }}
          transition={{ delay: i * 0.12, type: "spring", stiffness: 300, damping: 18 }}
        >
          <IconCheck size={18} style={{ opacity: on ? 1 : 0.4 }} />
        </motion.span>
      ))}
    </div>
  );
}

// Pointer-driven 3D tilt + moving spotlight. Flat on touch devices.
function FeatureCard({ f, i }) {
  const ref = useRef(null);
  const touch = useIsTouch();
  const [on, setOn] = useState(false);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 200, damping: 20, mass: 0.5 };
  const rotateY = useSpring(useTransform(px, [0, 1], [-9, 9]), spring);
  const rotateX = useSpring(useTransform(py, [0, 1], [9, -9]), spring);
  const mx = useTransform(px, (v) => `${v * 100}%`);
  const my = useTransform(py, (v) => `${v * 100}%`);
  const spotlight = useMotionTemplate`radial-gradient(300px circle at ${mx} ${my}, rgba(247,151,30,0.20), transparent 70%)`;

  const enter = () => setOn(true);
  const leave = () => { setOn(false); px.set(0.5); py.set(0.5); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
      style={{ perspective: 1000 }}
      className="h-full"
    >
      <motion.div
        ref={ref}
        tabIndex={0}
        onPointerEnter={enter}
        onPointerLeave={leave}
        onFocus={enter}
        onBlur={leave}
        onPointerMove={(e) => {
          if (touch || !ref.current) return;
          const r = ref.current.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width);
          py.set((e.clientY - r.top) / r.height);
        }}
        className="relative h-full rounded-3xl p-5 sm:p-6 outline-none flex flex-col"
        style={{ ...GLASS, ...(touch ? {} : { rotateX, rotateY, transformStyle: "preserve-3d" }) }}
      >
        {!touch && (
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300"
            style={{ background: spotlight, opacity: on ? 1 : 0 }}
          />
        )}
        <div
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mb-3 sm:mb-4"
          style={{ background: f.accent.tint, color: f.accent.text, transform: touch ? undefined : "translateZ(40px)" }}
        >
          {f.icon}
        </div>
        <h3 className="font-bold text-base mb-1.5" style={{ color: NAVY, transform: touch ? undefined : "translateZ(22px)" }}>{f.title}</h3>
        <p className="text-xs sm:text-[13px] leading-relaxed" style={{ color: "#7A8CA0", transform: touch ? undefined : "translateZ(14px)" }}>{f.description}</p>
        <div className="mt-auto" style={{ transform: touch ? undefined : "translateZ(22px)" }}>
          <FeatureVisual kind={f.visual} on={on} />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ───────────────────────── how it works ───────────────────────── */

function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <div className="relative" ref={ref}>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <motion.div
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <h2 className="font-black text-2xl sm:text-3xl md:text-4xl tracking-tight" style={{ color: NAVY }}>How it works</h2>
          <p className="text-xs sm:text-sm mt-2" style={{ color: "#7A8CA0" }}>Three steps from “what should I study?” to a finished plan.</p>
        </motion.div>

        <div className="relative" style={{ perspective: 1100 }}>
          {/* Self-drawing glowing dashed connector (desktop) */}
          <svg
            className="hidden sm:block absolute left-0 w-full pointer-events-none"
            style={{ top: 44, height: 28 }}
            viewBox="0 0 1000 28"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="mcg-path" x1="0" x2="1">
                <stop offset="0" stopColor={GOLD.vivid} />
                <stop offset="1" stopColor={SKY.vivid} />
              </linearGradient>
              <filter id="mcg-glow"><feGaussianBlur stdDeviation="3" /></filter>
            </defs>
            <motion.path
              d="M 80 14 C 250 -4, 340 32, 500 14 S 760 -4, 920 14"
              fill="none" stroke="url(#mcg-path)" strokeWidth="6" strokeLinecap="round" filter="url(#mcg-glow)" opacity="0.45"
              initial={{ pathLength: 0 }} animate={{ pathLength: inView ? 1 : 0 }} transition={{ duration: 1.8, ease: "easeInOut" }}
            />
            <motion.path
              d="M 80 14 C 250 -4, 340 32, 500 14 S 760 -4, 920 14"
              fill="none" stroke="url(#mcg-path)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 10"
              initial={{ pathLength: 0 }} animate={{ pathLength: inView ? 1 : 0 }} transition={{ duration: 1.8, ease: "easeInOut" }}
            />
          </svg>

          <div className="relative grid sm:grid-cols-3 gap-4 sm:gap-6">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 50, rotateX: 18 }}
                animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                transition={{ delay: 0.25 + i * 0.3, type: "spring", stiffness: 90, damping: 16 }}
                whileHover={{ y: -8, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                className="relative rounded-3xl p-5 sm:p-6"
                style={GLASS}
              >
                <span
                  className="block text-5xl sm:text-6xl font-black leading-none bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${GOLD.vivid}, ${GOLD.deep})`,
                    filter: "drop-shadow(0 1px 0 #b26a00) drop-shadow(0 2px 0 #9a5a00) drop-shadow(0 3px 0 #864d00) drop-shadow(0 8px 10px rgba(11,31,58,0.22))",
                  }}
                >
                  {s.step}
                </span>
                <h3 className="font-bold text-base mt-4 mb-1.5" style={{ color: NAVY }}>{s.title}</h3>
                <p className="text-xs sm:text-[13px] leading-relaxed" style={{ color: "#7A8CA0" }}>{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── FAQ ───────────────────────── */

function FaqItem({ q, a, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="relative rounded-2xl overflow-hidden transition-shadow"
      style={{ ...GLASS, boxShadow: open ? "0 20px 40px -12px rgba(247,151,30,0.28)" : GLASS.boxShadow }}
    >
      <motion.span
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0 w-1 origin-top"
        style={{ background: `linear-gradient(${GOLD.vivid}, ${GOLD.deep})` }}
        animate={{ scaleY: open ? 1 : 0, opacity: open ? 1 : 0 }}
      />
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5 sm:py-4 text-left"
      >
        <span className="font-semibold text-xs sm:text-sm" style={{ color: NAVY }}>{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} className="shrink-0" style={{ color: GOLD.vivid }}>
          <IconChevronDown size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 sm:px-5 text-xs leading-relaxed" style={{ color: "#7A8CA0" }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────── pre-footer CTA ───────────────────────── */

function CtaStrip() {
  return (
    <motion.div
      className="px-4 sm:px-6 pb-14 sm:pb-20"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <div
        className="relative max-w-4xl mx-auto overflow-hidden rounded-[2rem] px-6 py-12 sm:py-14 text-center"
        style={{
          background: "linear-gradient(135deg, #0B2540, #153C69)",
          border: "1px solid rgba(247,151,30,0.35)",
          boxShadow: "0 30px 70px -20px rgba(11,31,58,0.5)",
        }}
      >
        {/* perspective grid floor */}
        <div
          aria-hidden="true"
          className="absolute left-[-10%] right-[-10%] bottom-0 h-3/5 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(247,151,30,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(247,151,30,0.35) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            transform: "perspective(500px) rotateX(62deg)",
            transformOrigin: "bottom",
            WebkitMaskImage: "linear-gradient(to top, black 10%, transparent 90%)",
            maskImage: "linear-gradient(to top, black 10%, transparent 90%)",
            opacity: 0.6,
          }}
        />
        <div aria-hidden="true" className="absolute -top-20 left-1/2 -translate-x-1/2 w-2/3 h-48 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(247,151,30,0.25)" }} />
        <div className="relative">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Ready to learn at your own pace?</h2>
          <div className="mt-6 sm:mt-7">
            <Magnetic>
              <Link
                href="/mycareerguru/register"
                className="relative overflow-hidden inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-bold text-sm"
                style={{ background: `linear-gradient(135deg, ${GOLD.vivid} 0%, ${GOLD.deep} 100%)`, boxShadow: "0 10px 28px rgba(247,151,30,0.4)" }}
              >
                <Sheen />
                <span className="relative">Create your free account</span>
                <IconArrowRight size={16} className="relative transition-transform duration-300 group-hover:translate-x-1.5" />
              </Link>
            </Magnetic>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
