"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Analytics moved out of Test Engine into its own top-level module — this
// route is kept as a redirect so old links/bookmarks still land somewhere.
export default function TestEngineAnalyticsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/self-learner/analytics");
  }, [router]);

  return null;
}
