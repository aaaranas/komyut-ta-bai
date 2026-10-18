import type { Metadata } from "next";
import AlertsView from "@/components/alerts/AlertsView";

export const metadata: Metadata = {
  title: "Live conditions — Komyut ta Bai",
};

export default function AlertsPage() {
  return <AlertsView />;
}
