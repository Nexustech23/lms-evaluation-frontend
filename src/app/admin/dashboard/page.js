"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import axios from "axios";
import Spinner from "@/components/ui/Spinner";
import { useContext } from "react";
import { AuthContext } from "@/app/AuthContext";
import { useTranslations } from "next-intl";

const Dashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const t = useTranslations("admindashboard");
  const ts = useTranslations("subjects");

 const { user ,isLoading} = useContext(AuthContext);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(
        `/api/dashboard/institute`,
        { withCredentials: true }
      );

      setData(res.data);
 
    } catch (err) {
      console.error("Dashboard fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const cards = [
    
    {
      label: ts("school"),
      value: data?.counts?.schools ?? 0,
      icon: "🏫",
      gradient: "from-orange-400 to-orange-600",
      shadow: "shadow-orange-200",
      route: "/admin/school",
      desc: t("schoolsDesc")
    },
    {
      label: ts("programme"),
      value: data?.counts?.programmes ?? 0,
      icon: "📚",
      gradient: "from-blue-400 to-blue-600",
      shadow: "shadow-blue-200",
      route: null,
      desc: t("programmesDesc")
    },
    {
      label: ts("department"),
      value: data?.counts?.departments ?? 0,
      icon: "🏢",
      gradient: "from-purple-400 to-purple-600",
      shadow: "shadow-purple-200",
      route: null,
      desc: t("departmentsDesc")
    },
    {
      label: t("faculty"),
      value: data?.counts?.faculty ?? 0,
      icon: "👨‍🏫",
      gradient: "from-green-400 to-green-600",
      shadow: "shadow-green-200",
      route: "/admin/faculty",
      desc: t("facultyDesc")
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: user?.color || "#ff7f10" }}>
        <Spinner />
      </div>
    );
  }
  return (
    <div className={`min-h-screen`} style={{ backgroundColor: user?.color || "#ff7f10" }}>
      <Navbar title={t("title")} />

      <div className="p-6 mx-auto">

        {/* ===== BANNER CARD ===== */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">

          {/* Banner Image */}
          <div className="relative w-full h-[50vh]">
            {data?.institute?.banner_url ? (
              <img
                key={data?.institute?.banner_url}
                src={data?.institute?.banner_url}
                alt="Institute Banner"
                className="w-full h-full object-cover"
                onError={(e) => (e.target.style.display = "none")}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center">
                <p className="text-white/50 text-sm">{t("noBanner")}</p>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            {/* Institute info */}
            <div className="absolute bottom-0 left-0 right-0 px-6 py-5 flex items-end gap-4">
              {data?.institute?.logo_url ? (
                <img
                  src={`${data?.institute?.logo_url}?t=${Date.now()}`}
                  alt="Logo"
                  className="w-20 h-20 rounded-2xl object-contain border-2 border-white shadow-lg bg-white p-1 flex-shrink-0"
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-[#ff7f10] font-bold text-2xl flex-shrink-0 shadow-lg border-2 border-white">
                  {data?.institute?.full_name?.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="mb-1">
                <h2 className="text-2xl font-bold text-white drop-shadow">
                  {data?.institute?.full_name || "Institute"}
                </h2>
                <p className="text-white/80 text-sm mt-0.5">{t("welcome")} 👋</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== STAT CARDS ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {cards.map((card) => (
            <div
              key={card.label}
              onClick={() => card.route && router.push(card.route)}
              className={`relative bg-white rounded-2xl overflow-hidden ${card.shadow}
              ${card.route ? "cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-200" : ""}`}
            >

              <div className={`h-2 w-full bg-gradient-to-r ${card.gradient}`} />

              <div className="p-6 flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-3xl shadow-md mb-4`}>
                  {card.icon}
                </div>

                <p className="text-4xl font-black text-gray-800 leading-none">
                  {card.value}
                </p>

                <p className="text-base font-bold text-gray-700 mt-2">
                  {card.label}
                </p>

                <p className="text-xs text-gray-400 mt-0.5">
                  {card.desc}
                </p>

                {card.route && (
                  <div className={`mt-4 text-xs font-semibold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent flex items-center gap-1`}
                   style={{color: user?.color || "#ff7f10"}}>
                   {t("viewAll")} →
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;