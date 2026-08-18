import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { TypingTagline } from "@/components/typing-tagline";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main
      className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-10"
      style={{
        backgroundImage:
          "linear-gradient(rgba(41, 40, 36, 0.42), rgba(41, 40, 36, 0.42)), url('/landing-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <section className="grid w-full gap-8 rounded-2xl bg-white/88 p-8 shadow-[0_20px_60px_-30px_rgba(41,40,36,0.45)] backdrop-blur md:grid-cols-2 md:p-12">
        <div className="space-y-6">
          <BrandMark />
          <div className="space-y-3">
            <h1 className="text-4xl text-brand-charcoal md:text-5xl">Residential Apartment Management</h1>
            <TypingTagline />
          </div>
          <p className="max-w-md text-brand-charcoal/80">
            A secure tenant, staff, and operations platform for buildings, maintenance workflows, payments, and community communication.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/login">
              <Button>Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary">Create Account</Button>
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full max-w-sm rounded-xl border border-brand-sand/70 bg-brand-cream p-6">
            <h2 className="text-xl">What You Can Manage</h2>
            <ul className="mt-4 space-y-2 text-sm text-brand-charcoal/85">
              <li>Authentication and role-based access</li>
              <li>Maintenance request lifecycle with updates</li>
              <li>Payment proof and verification tracking</li>
              <li>Tenant documents and security reports</li>
              <li>Announcements, notifications, and analytics</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
