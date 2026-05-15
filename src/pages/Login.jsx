import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, selectAuth } from "../store/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector(selectAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(login({ email, password })).unwrap();
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  useEffect(() => {
    document.title = "Sign in | Recruit ATS";
  }, []);

  const logoSrc = `${import.meta.env.VITE_FRONTEND_BASE_PATH || "/"}logo.jpg`;

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4 py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.12] via-background to-background"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-1/4 size-[28rem] rounded-full bg-primary/5 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-0 size-[24rem] rounded-full bg-chart-2/10 blur-3xl"
        aria-hidden
      />

      <Card className="relative z-10 w-full max-w-md border-border/80 shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <img
            src={logoSrc}
            alt=""
            className="mx-auto h-14 w-auto object-contain"
          />
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Welcome back
            </CardTitle>
            <CardDescription>Sign in to manage candidates and jobs.</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {auth.error ? (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {auth.error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email or ID</Label>
              <Input
                id="login-email"
                type="text"
                autoComplete="username"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-11"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0.5 top-1/2 size-9 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="mt-2 h-11 w-full text-base font-medium shadow-sm"
              disabled={auth.loading}
            >
              {auth.loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col border-t bg-muted/30 px-6 py-4 text-center text-sm text-muted-foreground">
          <p>
            Need access?{" "}
            <a
              href="#"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Contact your admin
            </a>
          </p>
        </CardFooter>
      </Card>

      <p className="relative z-10 mt-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Immortal Technovation. All rights reserved.
      </p>
    </div>
  );
}
