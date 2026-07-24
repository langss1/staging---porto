"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { validateRedirectPath } from "@/lib/security";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid login credentials.");
      setLoading(false);
    } else if (data.session) {
      // CRIT-03: Do NOT manually set document.cookie — let the Supabase SDK
      //          manage the session cookie. Setting it via document.cookie would
      //          make it readable by JavaScript (no HttpOnly), which enables
      //          session token theft via XSS.
      //
      // CRIT-02: Validate the ?from= redirect target. Only relative paths
      //          starting with "/" are allowed to prevent open-redirect attacks.
      const searchParams = new URLSearchParams(window.location.search);
      const rawFrom = searchParams.get("from");
      const redirectTo = validateRedirectPath(rawFrom, "/admin/dashboard");

      // Use router.push so Next.js handles navigation without full reload.
      // This also ensures the Supabase session cookie is available immediately.
      router.push(redirectTo);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Secure portal for portfolio management
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin} suppressHydrationWarning>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                required
                suppressHydrationWarning
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm mt-1"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                suppressHydrationWarning
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm mt-1"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
