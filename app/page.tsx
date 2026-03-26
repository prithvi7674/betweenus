"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Home() {
  const router = useRouter();
  const { loading, profile } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!profile) {
      router.replace("/login");
      return;
    }

    if (profile.role === "admin") {
      router.replace("/admin");
      return;
    }

    if (profile.role === "user") {
      router.replace("/home");
      return;
    }

  }, [loading, profile, router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow">
        <p className="text-sm text-gray-500">BetweenUs</p>
        <h1 className="text-xl font-semibold mt-2">
          Getting things ready
        </h1>
        <p className="text-gray-500 mt-1">
          Checking your session...
        </p>
      </div>
    </main>
  );
}