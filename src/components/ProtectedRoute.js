"use client";

import { useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthContext } from "../app/AuthContext";
import { ROLE_ROUTES } from "./constants/roles";

const PUBLIC_ROUTES = [
  "/",
  "/pricing",
  "/get-a-demo",
  "/contact-us",
  "/privacy-policy",
  "/terms-conditions",
  "/faq",
];

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  const router = useRouter();
  const pathname = usePathname();

  const [authorized, setAuthorized] = useState(true);

  useEffect(() => {
    if (loading) return;

    // Public routes
    if (PUBLIC_ROUTES.includes(pathname)) {
      setAuthorized(true);
      return;
    }

    // Not logged in
    if (!user) {
      setAuthorized(false);
      router.replace("/");
      return;
    }

    const allowedBaseRoute = ROLE_ROUTES[user.role];

    // Unauthorized route
    if (allowedBaseRoute && !pathname.startsWith(allowedBaseRoute)) {
      setAuthorized(false);
      router.back();
      return;
    }

    setAuthorized(true);
  }, [user, loading, pathname, router]);

  // Initial auth loading only
  if (loading) {
    return null;
  }

  // Prevent rendering protected page
  if (!authorized) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
