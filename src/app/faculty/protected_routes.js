"use client"
import { useContext } from "react";
import { AuthContext } from "../AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;

  return user ? children : null;
};

export default ProtectedRoute;