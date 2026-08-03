import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Вход и регистрация — SATPrep" },
      {
        name: "description",
        content: "Войдите или создайте аккаунт SATPrep, чтобы сохранять прогресс подготовки к SAT.",
      },
      { property: "og:title", content: "Вход и регистрация — SATPrep" },
      { property: "og:description", content: "Аккаунт SATPrep: практика, аналитика и прогресс." },
    ],
  }),
  component: AuthPage,
});

const credentials = z.object({
  email: z.string().trim().email({ message: "Введите корректный email" }).max(255),
  password: z.string().min(6, { message: "Пароль должен быть не короче 6 символов" }).max(72),
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [loading, user, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = credentials.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Проверьте данные");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name.trim().slice(0, 80) },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setEmailSent(true);
          toast.success("Проверьте почту и подтвердите адрес, чтобы войти");
          return;
        }
        toast.success("Аккаунт создан!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
        toast.success("С возвращением!");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось выполнить вход");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Не удалось войти через Google");
      return;
    }
    if (result.redirected) return;
    setBusy(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary/50">
      <header className="px-4 py-4">
        <Link to="/" className="inline-flex items-center gap-2 font-bold">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </span>
          SATPrep
        </Link>
      </header>

      <div className="flex flex-1 items-start justify-center px-4 pb-16">
        <div className="surface-card w-full max-w-md p-6">
          <h1 className="text-2xl font-bold">
            {mode === "signup" ? "Создать аккаунт" : "Вход в аккаунт"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Прогресс, серия дней и аналитика сохраняются в вашем аккаунте.
          </p>

          <Tabs
            value={mode}
            onValueChange={(value) => {
              setMode(value as "signin" | "signup");
              setEmailSent(false);
            }}
            className="mt-5"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Вход</TabsTrigger>
              <TabsTrigger value="signup">Регистрация</TabsTrigger>
            </TabsList>
          </Tabs>

          {emailSent ? (
            <div className="mt-5 rounded-xl bg-success-soft p-4 text-sm">
              Мы отправили письмо на <strong>{email}</strong>. Подтвердите адрес и вернитесь, чтобы
              войти.
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {mode === "signup" ? (
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  value={name}
                  maxLength={80}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Алина"
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                maxLength={255}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                maxLength={72}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {mode === "signup" ? "Зарегистрироваться" : "Войти"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            или
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" size="lg" disabled={busy} onClick={handleGoogle}>
            Продолжить с Google
          </Button>
        </div>
      </div>
    </div>
  );
}
