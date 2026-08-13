"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TestEnginePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/self-learner/test-engine/create-test");
  }, [router]);

  return null;
}
