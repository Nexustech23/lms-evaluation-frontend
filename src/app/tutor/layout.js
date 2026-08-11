import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import ProtectedRoute from "../admin/protected_routes";
import { SidebarDemo } from "@/components/sidebar";

export const metadata = {
  title: "grAdelytIcs",
  description: "AI-Powered Evaluation Management System",
  icons: {
    icon: "/pics/Logo5.png",
  },
};

export default function RootLayout({ children}) {

  return (
        <ProtectedRoute><SidebarDemo>{children}</SidebarDemo></ProtectedRoute>
  );
}