"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import Reveal from "./Reveal";

// "100-Script Evaluation Challenge" pilot section. The wrapper keeps
// id="signup" because the navbar and the login modal scroll to that anchor.
const GIVE_US = [
  "100 anonymised answer scripts",
  "question paper",
  "faculty marking scheme",
  "existing faculty marks",
];

const WE_GIVE = [
  "AI marks",
  "confidence scores",
  "question-wise comparison",
  "faculty-AI deviation",
  "evaluation time",
  "sample feedback",
  "pilot validation report",
];

function Column({ title, items, accent }) {
  return (
    <div className="h-full rounded-3xl bg-white border border-orange-100 shadow-lg p-7 text-left">
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <ul className="mt-5 flex flex-col gap-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-gray-700">
            <CheckCircle2 size={20} className={`${accent} shrink-0 mt-0.5`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const Signup = () => {
  return (
    <section
      id="signup"
      className="relative overflow-hidden px-4 py-24 bg-gradient-to-br from-orange-100 via-orange-200 to-amber-100"
    >
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/40 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-200/40 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <Reveal>
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
          Ready to rethink academic evaluation?
        </h2>
        <p className="text-gray-700 text-lg md:text-xl mt-5 max-w-2xl mx-auto">
          Don&apos;t take our word for it. Test it on your own scripts.
        </p>
        </Reveal>

        <Reveal delay={0.15}>
        <div className="inline-flex mt-10 px-5 py-2 rounded-full bg-orange-500 text-white text-sm font-semibold shadow-lg">
          100-Script Evaluation Challenge
        </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Reveal delay={0.1} className="h-full"><Column title="Give us" items={GIVE_US} accent="text-orange-500" /></Reveal>
          <Reveal delay={0.25} className="h-full"><Column title="We give you" items={WE_GIVE} accent="text-emerald-500" /></Reveal>
        </div>

        <Reveal>
        <p className="mt-10 text-xl md:text-2xl font-bold text-gray-900">
          Your data. Your faculty. Your benchmark.
        </p>
        </Reveal>

        <Reveal delay={0.15}>
        <Link
          href="/get-a-demo"
          className="inline-flex mt-8 px-9 py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-sm shadow-xl hover:scale-105 transition-all duration-300"
        >
          Start Your Pilot
        </Link>
        </Reveal>
      </div>
    </section>
  );
};

export default Signup;
