"use client";
import { useState, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { Mail, Lock } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import { AuthContext } from "@/app/AuthContext";

export default function MyCareerGuruLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { fetchUser } = useContext(AuthContext);

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
        setError(data?.error || "Invalid email or password.");
        return;
      }

      await fetchUser();
      setRedirecting(true);
      // MyCareerGuru's own door always lands on the self-learner
      // experience — institute students who came in this way, or who
      // reach it via their institute's MyCareerGuru sidebar link, share
      // the exact same dashboard; access itself is enforced server-side
      // (see app.api.deps.can_use_mycareerguru), not by this redirect.
      router.push("/self-learner/dashboard");
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-3 sm:p-4 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #FFFBF3 55%, #FFF6E7 100%)" }}
    >
      <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-[#F7971E]/10 blur-[100px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-[#FF6584]/8 blur-[90px] sm:blur-[100px] pointer-events-none" />

      <div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl"
        style={{ background: "#FFFFFF", border: "1px solid #F0E6D2", boxShadow: "0 30px 80px rgba(35,25,10,0.12)" }}
      >
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #F7971E, #FFB347, #FFD166, #FF6584)" }} />

        <div className="px-6 py-7 sm:px-8 sm:py-8">
          <div className="flex flex-col items-center mb-7 sm:mb-8">
            <Link href="/mycareerguru" className="mb-2">
              <Image src="/pics/Logo17.png" alt="MyCareerGuru" width={196} height={74} className="h-14 sm:h-16 w-auto object-contain" priority />
            </Link>
            <p className="text-xs mt-1.5 font-medium text-center" style={{ color: "#8A8171" }}>Welcome back — sign in to continue learning</p>
          </div>

          {error && (
            <div
              className="mb-5 p-3 rounded-xl border text-xs font-medium"
              style={{ background: "rgba(225,29,72,0.06)", borderColor: "rgba(225,29,72,0.25)", color: "#BE123C" }}
            >
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#A79C86" }}>Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#C4B79A" }} />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all"
                  style={{ background: "#FDFBF6", border: "1px solid #EFE5CF", color: "#1A1207" }}
                  onFocus={(e) => { e.target.style.border = "1px solid rgba(247,151,30,0.55)"; e.target.style.background = "#FFF9EE"; }}
                  onBlur={(e) => { e.target.style.border = "1px solid #EFE5CF"; e.target.style.background = "#FDFBF6"; }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#A79C86" }}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#C4B79A" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm outline-none transition-all"
                  style={{ background: "#FDFBF6", border: "1px solid #EFE5CF", color: "#1A1207" }}
                  onFocus={(e) => { e.target.style.border = "1px solid rgba(247,151,30,0.55)"; e.target.style.background = "#FFF9EE"; }}
                  onBlur={(e) => { e.target.style.border = "1px solid #EFE5CF"; e.target.style.background = "#FDFBF6"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#C4B79A" }}
                >
                  {showPassword ? <IconEye size={18} /> : <IconEyeOff size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || redirecting}
              className="mt-2 w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all duration-300"
              style={{
                background: loading || redirecting ? "rgba(247,151,30,0.35)" : "linear-gradient(135deg, #F7971E 0%, #E8A33D 50%, #FF6584 100%)",
                boxShadow: loading || redirecting ? "none" : "0 8px 24px rgba(247,151,30,0.28)",
                cursor: loading || redirecting ? "not-allowed" : "pointer",
              }}
            >
              {redirecting ? (
                <span className="flex items-center justify-center gap-2"><Spinner className="h-4 w-4" /> Redirecting…</span>
              ) : loading ? (
                <span className="flex items-center justify-center gap-2"><Spinner className="h-4 w-4" /> Signing in…</span>
              ) : (
                "Log in"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs" style={{ color: "#A79C86" }}>
            New to MyCareerGuru?{" "}
            <Link href="/mycareerguru/register" className="font-semibold transition-colors" style={{ color: "#B45309" }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
