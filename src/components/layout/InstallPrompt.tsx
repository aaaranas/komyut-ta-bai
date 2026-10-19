"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { STORAGE_KEYS, readString, writeString } from "@/lib/storage";

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
      const wasDismissed = readString(STORAGE_KEYS.installDismissed) === "1";
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
    writeString(STORAGE_KEYS.installDismissed, "1");
    setInstallEvent(null);
  };

  return { isVisible: installEvent !== null, accept, dismiss };
}

export default function InstallPrompt() {
  const { isVisible, accept, dismiss } = useDeferredInstallPrompt();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-50 border-t bg-background md:bottom-0">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5">
        <Download className="size-4 shrink-0 text-muted-foreground" />
        <p className="flex-1 text-sm text-foreground">Add Komyut ta Bai to your home screen.</p>
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
