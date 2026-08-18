"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerSchema } from "@/lib/formSchemas";
import { authService } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await authService.register(values);
      await refresh();
      toast.success("Tenant account created successfully.");
      router.push("/portal");
    } catch (error: any) {
      toast.error(error.message || "Unable to register.");
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
      <section className="w-full max-w-4xl rounded-2xl bg-white/90 p-8 shadow-[0_20px_60px_-30px_rgba(41,40,36,0.35)] backdrop-blur">
        <div className="mb-6 space-y-2">
          <BrandMark />
          <h1 className="text-3xl">Create Your HomeNest Account</h1>
          <p className="text-sm text-brand-charcoal/75">New accounts are registered as tenant accounts.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
            <Input id="fullName" {...register("fullName")} />
            {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="phone" className="text-sm font-medium">Phone</label>
            <Input id="phone" {...register("phone")} />
            {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
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
          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
            <div className="flex gap-2">
              <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} {...register("confirmPassword")} />
              <Button type="button" variant="ghost" onClick={() => setShowConfirmPassword((v) => !v)}>
                {showConfirmPassword ? "Hide" : "Show"}
              </Button>
            </div>
            {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>
          <div className="md:col-span-2 space-y-3">
            <p className="text-xs text-brand-charcoal/70">Password must be 8+ characters with uppercase, lowercase, and a number.</p>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Account"}</Button>
            <p className="text-sm text-brand-charcoal/70">
              Already registered? <Link className="text-brand-terracotta underline" href="/login">Sign in</Link>
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}
