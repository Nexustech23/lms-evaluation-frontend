"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import Signup from "./Signup";
import Login from "./Login";

function Navbar() {
    const [openSignup, setOpenSignup] = useState(false);
    const [openLogin, setOpenLogin] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);

    const handleSignUp = () => {
        setOpenSignup(true);
        setOpenLogin(false);
    };

    const handleLogin = () => {
        setOpenLogin(true);
        setOpenSignup(false);
    };

    return (
        <>
            {/* Floating Frosted Glass Navbar */}
            <nav className="absolute top-0 left-0 right-0 z-50 px-4 pt-4">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl px-6 py-3 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)]">

                        {/* Logo */}
                        <Link href="/" className="flex items-center">
                            <Image
                                src="/pics/Logo7.png"
                                alt="Logo"
                                width={160}
                                height={44}
                                className="object-contain"
                            />
                        </Link>

                        {/* Desktop Links */}
                        <div className="hidden lg:flex items-center gap-8 text-white/70 text-sm font-medium">
                            <Link href="/pricing" className="hover:text-orange-400 transition-colors duration-200">
                                Pricing
                            </Link>
                            <Link href="/get-a-demo" className="hover:text-orange-400 transition-colors duration-200">
                                Get a Demo
                            </Link>
                            <button
                                onClick={() => {
                                    const section = document.getElementById("aboutus");
                                    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
                                }}
                                className="hover:text-orange-400 transition-colors duration-200"
                            >
                                About Us
                            </button>
                            <Link href="/contact-us" className="hover:text-orange-400 transition-colors duration-200">
                                Contact Us
                            </Link>
                        </div>

                        {/* Desktop Auth Buttons */}
                        <div className="hidden lg:flex items-center gap-3">
                            <button
                                onClick={handleLogin}
                                className="px-5 py-2 rounded-xl text-white/80 text-sm font-medium border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200"
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => {
                                    const section = document.getElementById("signup");
                                    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
                                }}
                                className="px-5 py-2 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-orange-600 to-amber-500 shadow-[0_0_20px_rgba(234,88,12,0.35)] hover:shadow-[0_0_30px_rgba(234,88,12,0.55)] hover:scale-105 transition-all duration-200"
                            >
                                Sign Up Free
                            </button>
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setMobileMenu(!mobileMenu)}
                            className="lg:hidden text-white/80 hover:text-white transition-colors"
                        >
                            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {mobileMenu && (
                        <div className="mt-2 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl px-6 py-6 flex flex-col gap-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                            <Link href="/pricing" className="text-white/70 hover:text-orange-400 text-sm font-medium transition-colors">
                                Pricing
                            </Link>
                            <Link href="/get-a-demo" className="text-white/70 hover:text-orange-400 text-sm font-medium transition-colors">
                                Get a Demo
                            </Link>
                            <Link href="/contact-us" className="text-white/70 hover:text-orange-400 text-sm font-medium transition-colors">
                                Contact Us
                            </Link>
                            <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
                                <button
                                    onClick={handleLogin}
                                    className="w-full py-3 rounded-xl text-white/80 text-sm border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={handleSignUp}
                                    className="w-full py-3 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-orange-600 to-amber-500 transition-all"
                                >
                                    Sign Up Free
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Modals */}
            {openSignup && (
                <Signup
                    close={() => setOpenSignup(false)}
                    openLogin={() => { setOpenSignup(false); setOpenLogin(true); }}
                />
            )}
            {openLogin && (
                <Login
                    close={() => setOpenLogin(false)}
                    openSignup={() => { setOpenLogin(false); setOpenSignup(true); }}
                />
            )}
        </>
    );
}

export default Navbar;
