import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import PrivacyCenter from "@/components/privacy/PrivacyCenter";

export const metadata: Metadata = {
  title: "Privacy & contributions — Komyut ta Bai",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-12 pt-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
        <ShieldCheck className="size-6 text-primary" />
        Privacy &amp; your contributions
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Komyut ta Bai has no accounts. Everything you share is opt-in and tied only to a pseudonym on this phone.
      </p>
      <PrivacyCenter />
    </main>
  );
}
