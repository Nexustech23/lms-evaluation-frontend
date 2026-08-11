"use client";
import { useRouter } from "next/navigation";
import React, { useState, useContext } from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { Mail, Lock, X } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import { AuthContext } from "@/app/AuthContext";
import { useTranslations } from "next-intl";

const Login = ({ close }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();
  const { fetchUser } = useContext(AuthContext);
  const t = useTranslations("auth");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const response = await fetch(`/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || data?.error) {
        setError(data?.error || t("invalidCredentials"));
        return;
      }

      await fetchUser();
      setRedirecting(true);

      switch (data.user.role) {
        case 1: router.push("/super-admin/dashboard"); break;
        case 2: router.push("/admin/dashboard"); break;
        case 3: router.push("/faculty/dashboard"); break;
        case 4: router.push("/institute-student/dashboard"); break;
        case 5: router.push("/tutor/dashboard"); break;
        case 6: router.push("/student/dashboard"); break;
        case 7: router.push("/self-learner/dashboard"); break;
        default: router.push("/"); break;
      }
    } catch (err) {
      console.error("Error during Login:", err);
      setError(err?.message || t("loginError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4"
         style={{ background: "rgba(13,5,0,0.85)", backdropFilter: "blur(24px)" }}>

      {/* Atmospheric glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-orange-700/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-amber-600/10 blur-[100px] pointer-events-none" />

      {/* Modal card */}
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.9)]"
        style={{
          background: "linear-gradient(160deg, rgba(30,12,2,0.95) 0%, rgba(20,8,1,0.98) 100%)",
          border: "1px solid rgba(234,88,12,0.2)",
        }}
      >
        {/* Top accent strip */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #C2410C, #EA580C, #F97316, #FCD34D)" }} />

        {/* Close button */}
        <button
          onClick={close}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-white/40
                     bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white/70 transition-all"
        >
          <X size={16} />
        </button>

        <div className="px-8 py-8">

          {/* Logo + heading */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-15 h-16 rounded-2xl overflow-hidden mb-5 shadow-[0_0_30px_rgba(234,88,12,0.3)]"
              style={{ background: "linear-gradient(135deg, #ffffff, #fcfcfc)" }}
            >
              <img src="/pics/Logo5.png" alt="grAdelytics" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Welcome back</h2>
            <p className="text-white/35 text-xs mt-1.5 font-medium">Sign in to your grAdelytics account</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-xl border text-xs font-medium"
                 style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.25)", color: "#FCA5A5" }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                {t("email")}
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={e => { e.target.style.border = "1px solid rgba(234,88,12,0.5)"; e.target.style.background = "rgba(234,88,12,0.06)"; }}
                  onBlur={e => { e.target.style.border = "1px solid rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                {t("password")}
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={e => { e.target.style.border = "1px solid rgba(234,88,12,0.5)"; e.target.style.background = "rgba(234,88,12,0.06)"; }}
                  onBlur={e => { e.target.style.border = "1px solid rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <IconEye size={18} /> : <IconEyeOff size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || redirecting}
              className="mt-2 w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all duration-300"
              style={{
                background: loading || redirecting
                  ? "rgba(234,88,12,0.35)"
                  : "linear-gradient(135deg, #C2410C 0%, #EA580C 50%, #F97316 100%)",
                boxShadow: loading || redirecting ? "none" : "0 0 30px rgba(234,88,12,0.4)",
                cursor: loading || redirecting ? "not-allowed" : "pointer",
              }}
            >
              {redirecting ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Redirecting…
                </span>
              ) : loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner className="h-4 w-4" />
                  {t("loggingIn")}
                </span>
              ) : (
                t("login")
              )}
            </button>
          </form>

          {/* Footer link */}
          <p className="mt-6 text-center text-xs text-white/30">
            New to grAdelytics?{" "}
            <button
              type="button"
              onClick={() => {
                close();
                setTimeout(() => {
                  const signupSection = document.getElementById("signup");
                  if (signupSection) signupSection.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 200);
              }}
              className="text-orange-400 font-semibold hover:text-orange-300 transition-colors"
            >
              Create an account
            </button>
          </p>

          {/* Brand footer */}
          <div className="mt-6 pt-5 border-t border-white/6 text-center">
            <p className="text-[10px] text-white/20 font-medium uppercase tracking-widest">
              AI Powered Assessment Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
