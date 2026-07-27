"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/salesman/customers?tab=onboard");
  }, [router]);

  return (
    <div className="p-8 text-center text-xs text-muted-foreground font-sans">
      <p className="font-bold text-foreground">Redirecting to Swatch Paints Customers & Dealer Onboarding Center...</p>
    </div>
  );
}
