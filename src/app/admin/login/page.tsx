"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { t } from "@/lib/i18n";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: password }),
      });

      if (!res.ok) {
        setError(t("admin.login.error"));
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
      <div className="w-full max-w-sm p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-500/15 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-xl font-semibold">{t("admin.login.title")}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              {t("admin.login.password")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("admin.login.passwordPlaceholder")}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              autoFocus
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? t("common.loading") : t("admin.login.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
