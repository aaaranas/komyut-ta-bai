import type { Metadata } from "next";
import RouteBrowser from "@/components/routes/RouteBrowser";

export const metadata: Metadata = {
  title: "Routes — Komyut ta Bai",
};

export default function RoutesPage() {
  return <RouteBrowser />;
}
