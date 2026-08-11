import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { SidebarDemo } from "@/components/sidebar";
import ProtectedRoute from "./protected_routes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "grAdelytIcs",
  description: "AI-Powered Evaluation Management System",
  icons: {
    icon: "/pics/Logo5.png",
  },
};

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute>
      <SidebarDemo>
        {children}
      </SidebarDemo>
    </ProtectedRoute>
  );
}