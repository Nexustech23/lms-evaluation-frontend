"use client";
import Navbar from "@/components/ui/Navbar";
import { useTranslations } from "next-intl";
import { AuthContext } from "@/app/AuthContext";
import { useContext } from "react";
const Dashboard = () => {
    const { user, loading } = useContext(AuthContext);
  const t = useTranslations("dashboard");

  return (
   <div
  className="min-h-screen flex flex-col"
  style={{ backgroundColor: user?.color }}
>
      <Navbar 
  title={t("title")} 
  style={{ backgroundColor: user?.color }} 
/>
      <div className="flex-1 flex flex-col items-center justify-center px-6 ">
        <div className="bg-white rounded-lg shadow-md overflow-hidden p-8 w-full max-w-md rounded-xl ">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold " style={{ color: user?.color }} >
              {t("title")}
            </h1>
            <p className="text-gray-600 mt-2">
             {t("welcome", { name: user?.fullName || "User" })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;