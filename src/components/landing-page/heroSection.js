"use client";
import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import dashboardImg from "../../../public/pics/dashbord2.png";

function HeroPage() {
    return (
        <section
            className="relative overflow-hidden min-h-screen flex flex-col items-center"
            style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 40%, #FFF7ED 65%, #FFEDD5 85%, #FED7AA 100%)" }}
        >

            {/* === Background atmosphere === */}
            {/* Warm pools anchored at the bottom corners, echoing the reference —
                sized tall enough that their feathered top edge bleeds up into the
                headline/CTA area, fading fully to white well before the navbar. */}
            <div
                className="absolute bottom-[-30%] left-[-15%] w-[1200px] h-[1150px] rounded-full pointer-events-none"
                style={{
                    background: "radial-gradient(circle, #FF7A3D 0%, #FFB088 30%, #FFE4CC 55%, rgba(255,228,204,0) 80%)",
                    filter: "blur(50px)",
                }}
            />
            <div
                className="absolute bottom-[-30%] right-[-15%] w-[1200px] h-[1150px] rounded-full pointer-events-none"
                style={{
                    background: "radial-gradient(circle, #FF7A3D 0%, #FFB088 30%, #FFE4CC 55%, rgba(255,228,204,0) 80%)",
                    filter: "blur(50px)",
                }}
            />
            {/* Centered wash directly behind the headline/subheadline/CTA band,
                so that middle area isn't left pale between the two corner glows. */}
            <div
                className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1500px] h-[800px] rounded-full pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse, #FFB088 0%, #FFE4CC 45%, rgba(255,228,204,0) 78%)",
                    filter: "blur(60px)",
                }}
            />

            {/* Subtle grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(251,146,60,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(251,146,60,0.6) 1px, transparent 1px)",
                    backgroundSize: "64px 64px",
                }}
            />

            {/* === Hero content === */}
            <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center px-6 pt-40 pb-12">

                {/* Eyebrow pill */}
                <Reveal immediate delay={0}><div className="inline-flex items-center gap-2.5 bg-orange-50 border border-orange-200 text-orange-600 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-8">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                    AI-Powered Education Management System
                </div></Reveal>

                {/* Main headline */}
                <Reveal immediate delay={0.12}><h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-gray-900 leading-[0.88] tracking-tight mb-6">
                    Smarter
                    <br />
                    <span
                        className="text-transparent bg-clip-text"
                        style={{ backgroundImage: "linear-gradient(90deg, #F97316 0%, #FCD34D 50%, #FB923C 100%)" }}
                    >
                        Learning.
                    </span>
                    <br />
                    Better Results.
                </h1></Reveal>

                {/* Sub-headline */}
                <Reveal immediate delay={0.24}><p className="text-gray-900 text-xl md:text-2xl font-bold leading-snug max-w-3xl mb-2">
                    From Answer Sheets to Academic Intelligence
                </p></Reveal>
                <Reveal immediate delay={0.32}><p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-3xl mb-8">
                    AI-powered evaluation for faster results, better academic decisions and measurable learning outcomes.
                </p></Reveal>

                {/* Key points */}
                <div className="grid gap-5 sm:grid-cols-3 max-w-4xl w-full text-left mb-10">
                    {[
                        { title: "Evaluate faster.", desc: "AI-assisted handwritten answer evaluation." },
                        { title: "Validate with confidence.", desc: "Faculty remain in control with AI scores, rubrics and confidence indicators." },
                        { title: "Turn marks into insight.", desc: "CO-PO attainment, learning gaps, analytics and accreditation-ready evidence." },
                    ].map(({ title, desc }, idx) => (
                        <Reveal key={title} immediate delay={0.42 + idx * 0.12} className="h-full"><div className="h-full rounded-2xl bg-white/70 backdrop-blur border border-orange-100 px-5 py-4 shadow-sm hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
                            <h3 className="text-gray-900 font-bold text-base">{title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mt-1.5">{desc}</p>
                        </div></Reveal>
                    ))}
                </div>

                {/* CTA button */}
                <Reveal immediate delay={0.8}><div className="flex items-center justify-center mb-16">
                    <Link
                        href="/get-a-demo"
                        className="px-9 py-4 rounded-2xl text-white font-bold text-sm bg-gradient-to-r from-orange-600 to-amber-500
                            shadow-[0_0_40px_rgba(234,88,12,0.4)] hover:shadow-[0_0_60px_rgba(234,88,12,0.65)]
                            hover:scale-105 transition-all duration-300"
                    >
                        Request a Live Demo
                    </Link>
                </div></Reveal>
            </div>

            {/* === Product screenshot mockup === */}
            <Reveal immediate delay={1} y={40} className="w-full"><div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-20">

                {/* Ambient glow beneath the card */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-2/3 h-24 bg-orange-600/25 blur-3xl pointer-events-none" />

                {/* Browser chrome card */}
                <div
                    className="relative rounded-2xl overflow-hidden border border-gray-200
                        shadow-[0_30px_90px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.02)]"
                    style={{ background: "#FFFFFF" }}
                >
                    {/* Browser top bar */}
                    <div
                        className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-200"
                        style={{ background: "#F3F4F6" }}
                    >
                        {/* Traffic lights */}
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>

                        {/* URL bar */}
                        <div
                            className="flex-1 ml-3 flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-mono text-gray-400"
                            style={{ background: "#EAECEF" }}
                        >
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                <path d="M6 1L9 4H7.5V8H4.5V4H3L6 1Z" fill="currentColor" opacity="0.5" />
                                <rect x="1" y="9" width="10" height="2" rx="1" fill="currentColor" opacity="0.5" />
                            </svg>
                            gradelytics.ai/dashboard
                        </div>

                        {/* Right side controls */}
                        <div className="flex items-center gap-2 ml-2">
                            <div className="w-5 h-5 rounded-md border border-gray-200 bg-gray-50" />
                            <div className="w-5 h-5 rounded-md border border-gray-200 bg-gray-50" />
                        </div>
                    </div>

                    {/* Dashboard screenshot */}
                    <Image
                        src={dashboardImg}
                        alt="grAdelytics Dashboard"
                        className="w-full h-auto block"
                        priority
                    />

                    {/* Subtle bottom fade */}
                    <div
                        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
                        style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.9))" }}
                    />
                </div>

                {/* Floating feature badges */}
                <div className="absolute -left-3 top-20 hidden lg:flex flex-col gap-2">
                    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-gray-800 text-xs font-semibold bg-orange-50 border border-orange-100 shadow-xl">
                        <span className="text-base">⚡</span>
                        Smart Assessments
                    </div>
                    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-gray-800 text-xs font-semibold bg-amber-50 border border-amber-100 shadow-xl">
                        <span className="text-base">🧠</span>
                        AI Analytics
                    </div>
                </div>

                <div className="absolute -right-3 top-20 hidden lg:flex flex-col gap-2">
                    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-gray-800 text-xs font-semibold bg-orange-50 border border-orange-100 shadow-xl">
                        <span className="text-base">🚀</span>
                        Fast Evaluation
                    </div>
                    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-gray-800 text-xs font-semibold bg-red-50 border border-red-100 shadow-xl">
                        <span className="text-base">📊</span>
                        Deep Insights
                    </div>
                </div>
            </div></Reveal>
        </section>
    );
}

export default HeroPage;
