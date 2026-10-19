import type { Metadata } from "next";
import PrivacyCenter from "@/components/privacy/PrivacyCenter";

export const metadata: Metadata = {
  title: "Privacy & contributions — Komyut ta Bai",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 pt-8">
      <h1 className="text-[2rem] font-extrabold leading-tight tracking-[-0.025em]">Privacy</h1>
      <p className="mt-1 max-w-prose text-sm text-muted-foreground">
        There are no accounts. Everything you share is optional and tied only to a pseudonym on this phone.
      </p>
      <PrivacyCenter />
    </main>
  );
}
