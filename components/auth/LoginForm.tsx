"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { FirebaseError } from "firebase/app";
import { useRouter } from "next/navigation";
import { loginWithEmailPassword, logoutUser } from "@/firebase/auth";
import { getUserProfileByEmail } from "@/firebase/firestore";
import { useAuth } from "@/components/providers/AuthProvider";

function getFirebaseErrorMessage(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return "Something went wrong while signing you in.";
  }

  switch (error.code) {
    case "auth/invalid-credential":
    case "auth/invalid-email":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "The email or password is incorrect.";
    default:
      return error.message || "Unable to sign in right now.";
  }
}

export function LoginForm() {
  const router = useRouter();
  const { loading, profile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (loading || !profile) {
      return;
    }

    router.replace(profile.role === "admin" ? "/admin" : "/home");
  }, [loading, profile, router]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      try {
        const user = await loginWithEmailPassword(email, password);
        const userEmail = user.email;

        if (!userEmail) {
          await logoutUser();
          setError("This account does not have an email address.");
          return;
        }

        const userProfile = await getUserProfileByEmail(userEmail);

        if (!userProfile) {
          await logoutUser();
          setError('No Firestore role found. Create a document in the "users" collection with this email.');
          return;
        }

        router.replace(userProfile.role === "admin" ? "/admin" : "/home");
      } catch (submitError) {
        setError(getFirebaseErrorMessage(submitError));
      }
    });
  };

  return (
    <div className="card">
      <div className="title-stack">
        <p className="eyebrow">BetweenUs</p>
        <h1>Welcome back</h1>
        <p className="muted">
          Sign in with your Firebase email and password to continue.
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error ? <div className="status-box error">{error}</div> : null}

        <button className="primary-button" type="submit" disabled={isPending}>
          {isPending ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
