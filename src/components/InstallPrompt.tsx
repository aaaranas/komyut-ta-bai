"use client";

import { useEffect, useState } from "react";
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
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex max-w-md items-center gap-3">
        <span className="text-2xl" aria-hidden="true">
          📲
        </span>
        <p className="flex-1 text-sm text-gray-700">
          Install Komyut ta Bai for offline trip planning anywhere in Cebu.
        </p>
        <button
          type="button"
          onClick={accept}
          className="min-h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-white"
        >
          Install
        </button>
        <button
          type="button"
          aria-label="Dismiss install prompt"
          onClick={dismiss}
          className="flex h-11 w-11 items-center justify-center rounded-full text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
