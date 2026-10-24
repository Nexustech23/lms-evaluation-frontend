"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import "@/lib/clientDiagnostics";

export default function DiagnosticNavigation() {
  const pathname = usePathname();
  useEffect(() => {
    window.__lmsDiagnostics?.record({ event: "ui.navigation", path: pathname });
  }, [pathname]);
  return null;
}
