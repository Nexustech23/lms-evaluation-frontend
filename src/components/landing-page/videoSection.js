import React from "react";
import Reveal from "./Reveal";

function VideoSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300 py-12">

            {/* Background Blur */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 blur-3xl rounded-full"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-200/10 blur-3xl rounded-full"></div>

           <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 grid lg:grid-cols-2 gap-24 items-center">
               {/* Left Side — Dual Videos */}
<Reveal>
<div className="relative h-[550px]  flex items-center mt-24 justify-center">

    {/* Top Left Video */}
    <div className="absolute top-0 left-0 w-[80%] z-20">

        {/* Floating Badge */}
        <div className="absolute -top-8 -left-10 hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl 
        bg-white/15 backdrop-blur-xl border border-white/20 shadow-2xl z-30">

            <span className="text-lg">⚡</span>

            <p className="text-sm font-medium text-white">
                AI Powered Feedback
            </p>
        </div>

        {/* Video Card */}
        <div className="relative overflow-hidden rounded-3xl  
         shadow-xl shadow-black/40">

            <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full rounded-2xl object-cover"
            >
                <source src="/videos/video1.mp4" type="video/mp4" />
            </video>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>

        </div>
    </div>

    {/* Bottom Right Video */}
    <div className="absolute bottom-0 right-0 w-[80%] z-10">

        {/* Video Card */}
      {/* Video Card */}
        <div className="relative overflow-hidden rounded-3xl  
         shadow-xl shadow-black/40">

              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full rounded-2xl object-cover"
            >
                <source src="/videos/video2.mp4" type="video/mp4" />
            </video>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>

        </div>

        {/* Floating Card */}
        <div className="absolute -bottom-10 -right-12 hidden md:flex items-center gap-3 px-5 py-3 rounded-2xl 
        bg-white/15 backdrop-blur-xl border border-white/20 shadow-2xl">

            <span className="text-xl">✨</span>

            <div>
                <h3 className="text-sm font-semibold text-white">
                    Detailed Analytics
                </h3>

                <p className="text-xs text-white/80">
                    Save hours of analyzing performance 
                </p>
            </div>

        </div>

    </div>

</div>

</Reveal>
                {/* Right Side — Text */}
                <div className="flex flex-col gap-7 text-center lg:text-left">

                    {/* Heading */}
                    <Reveal delay={0.1}>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                        Built for Responsible AI
                        <span className="block text-orange-200">
                            in Higher Education
                        </span>
                    </h2>
                    </Reveal>

                    {/* Points */}
                    <div className="flex flex-col gap-5 pt-2 text-left">
                        {[
                            { title: "Human oversight", desc: "AI assists; authorised academic personnel retain final control." },
                            { title: "Privacy", desc: "Student and examination data handled under defined institutional policies." },
                            { title: "Auditability", desc: "Every evaluation action can be traced." },
                            { title: "Role-based access", desc: "COE, faculty, moderators and administrators see only what they are authorised to access." },
                            { title: "Institutional control", desc: "Rubrics, marking schemes and evaluation workflows remain institution-defined." },
                        ].map(({ title, desc }, idx) => (
                            <Reveal key={title} delay={0.15 + idx * 0.12}>
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/10">
                                    <div className="min-w-[40px] h-10 rounded-xl bg-orange-400 flex items-center justify-center text-white font-bold shadow-lg">
                                        ✓
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-lg">{title}</h3>
                                        <p className="text-white/80 text-sm mt-1">{desc}</p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>

                </div>

            </div>
        </section>
    );
}

export default VideoSection;