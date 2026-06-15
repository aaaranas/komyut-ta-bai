"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { INSTALL_PROMPT_DISMISS_KEY } from "@/lib/constants";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function useDeferredInstallPrompt() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const captureInstallPrompt = (event: Event) => {
      event.preventDefault();
      const wasDismissed =
        localStorage.getItem(INSTALL_PROMPT_DISMISS_KEY) === "1";
      if (wasDismissed) return;
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
    return () =>
      window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
  }, []);

  const accept = async () => {
    await installEvent?.prompt();
    setInstallEvent(null);
  };

  const dismiss = () => {
    localStorage.setItem(INSTALL_PROMPT_DISMISS_KEY, "1");
    setInstallEvent(null);
  };

  return { isVisible: installEvent !== null, accept, dismiss };
}

export default function InstallPrompt() {
  const { isVisible, accept, dismiss } = useDeferredInstallPrompt();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/95 p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="mx-auto flex max-w-md items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Download className="size-5" />
        </span>
        <p className="flex-1 text-sm text-foreground">
          Install Komyut ta Bai for offline trip planning anywhere in Cebu.
        </p>
        <Button type="button" size="sm" onClick={accept}>
          Install
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Dismiss install prompt"
          onClick={dismiss}
          className="text-muted-foreground"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
