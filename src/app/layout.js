import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./AuthContext";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import ReactQueryProvider from "./ReactQueryProvider";
// import Navbar from "@/components/navbar/navbar";
// import Footer from "@/components/footer/footer"
import ProtectedRoute from "@/components/ProtectedRoute";

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

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ReactQueryProvider>
            <AuthProvider>

              {/* GLOBAL ROUTE PROTECTION */}
              <ProtectedRoute>
                {children}
              </ProtectedRoute>

            </AuthProvider>

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  fontSize: "14px",
                },
              }}
            />
          </ReactQueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}