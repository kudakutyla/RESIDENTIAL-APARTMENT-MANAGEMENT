"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { BrandMark } from "@/components/brand-mark";
import { TypingTagline } from "@/components/typing-tagline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/formSchemas";
import { authService } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await authService.login(values);
      await refresh();
      toast.success("Logged in successfully.");
      router.push("/portal");
    } catch (error: any) {
      toast.error(error.message || "Unable to login.");
    }
  };

  return (
    <main
      className="mx-auto flex min-h-screen w-full items-center px-6 py-10"
      style={{
        backgroundImage:
          "linear-gradient(rgba(41, 40, 36, 0.52), rgba(41, 40, 36, 0.52)), url('/landing-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <section className="grid w-full max-w-6xl gap-6 rounded-2xl bg-white/90 p-8 shadow-[0_20px_60px_-30px_rgba(41,40,36,0.35)] backdrop-blur md:grid-cols-[1.1fr_1fr]">
        <div className="space-y-5">
          <BrandMark />
          <TypingTagline />
          <h1 className="text-3xl">Welcome Back</h1>
          <p className="text-brand-charcoal/75">Sign in to manage apartments, operations, and community updates.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl bg-brand-cream p-6">
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <div className="flex gap-2">
              <Input id="password" type={showPassword ? "text" : "password"} {...register("password")} />
              <Button type="button" variant="ghost" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? "Hide" : "Show"}
              </Button>
            </div>
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing In..." : "Login"}
          </Button>
          <p className="text-sm text-brand-charcoal/70">
            No account? <Link className="text-brand-terracotta underline" href="/register">Create an account</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
