"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";

const SuperAdminDashboard = () => {
  const [userRole, setUserRole] = useState("");
  const router = useRouter();
  
  return (
    <div className="min-h-screen flex flex-col bg-[#ff7f10]">
      <Navbar title="Dashboard" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden p-8 w-full max-w-md">
          {/* Welcome Section */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#ff7f10]">Super Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome, Super Admin!</p>
          </div>

          {/* Single Action Button */}
          {/* <button
            className="w-full px-4 py-3 bg-[#ff7f10] text-white font-medium rounded-md hover:bg-[#e6730e] transition-colors"
            onClick={() => router.push("/admin/createAdmin")}
          >
            Create New Admin
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;