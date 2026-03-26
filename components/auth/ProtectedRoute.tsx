"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { type UserRole } from "@/firebase/firestore";

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export function ProtectedRoute({
  allowedRoles,
  children,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { loading, profile, user } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!profile) {
      router.replace("/login");
      return;
    }

    if (!allowedRoles.includes(profile.role)) {
      router.replace(profile.role === "admin" ? "/admin" : "/home");
    }
  }, [allowedRoles, loading, profile, router, user]);

  if (loading || !user || !profile || !allowedRoles.includes(profile.role)) {
    return (
      <main className="page-shell">
        <div className="card">
          <p className="eyebrow">BetweenUs</p>
          <h1>Checking access</h1>
          <p className="muted">Making sure you are in the right place.</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
