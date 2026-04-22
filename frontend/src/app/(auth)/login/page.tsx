"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/auth/context";
import { loginUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useTranslations } from "@/lib/i18n";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const { login } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await loginUser({ email, password });
      login(user);
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) setError(t.auth.login.invalidCredentials);
        else if (err.status === 403) setError(t.auth.login.accountDisabled);
        else setError(t.auth.login.genericError);
      } else {
        setError(t.auth.login.genericError);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-indigo-600">Local AE</span>
          <span className="ml-1.5 text-xl font-semibold text-gray-500">CRM</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            {t.auth.login.title}
          </h1>
          <p className="text-sm text-gray-500 mb-6">{t.auth.login.subtitle}</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label={t.auth.login.email}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.auth.login.emailPlaceholder}
              autoComplete="email"
              required
            />

            <Input
              label={t.auth.login.password}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.auth.login.passwordPlaceholder}
              autoComplete="current-password"
              required
            />

            {error && (
              <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              {isLoading ? t.auth.login.submitting : t.auth.login.submit}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
