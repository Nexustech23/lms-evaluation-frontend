import "../globals.css";

export const metadata = {
  title: "MyCareerGuru",
  description: "AI-powered personalized learning roadmaps, self-review, and practice tests",
  icons: {
    icon: "/pics/Logo5.png",
  },
};

// Deliberately NOT wrapped in the admin/self-learner ProtectedRoute — the
// landing, login, and register pages under this route are public by
// design (an individual arriving here has no session yet). Once logged
// in, users land on /self-learner/dashboard, which keeps its own existing
// guard/layout unchanged.
export default function MyCareerGuruLayout({ children }) {
  return <div className="min-h-screen bg-[#0B0620]">{children}</div>;
}
