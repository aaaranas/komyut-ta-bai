"use client";

import { useState } from "react";
import type { Itinerary } from "@/core/planner";
import { formatPeso } from "@/core/transit/fare";
import { formatDuration } from "@/core/transit/time";
import type { Stop } from "@/core/transit/types";
import { MODE_CONFIG, routeCode } from "@/lib/presentation";

const W = 720;
const H = 400;
const PAD = 40;

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function buildCanvas(
  origin: Stop,
  destination: Stop,
  itinerary: Itinerary
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // --- Background ---
  ctx.fillStyle = "#16181D";
  drawRoundRect(ctx, 0, 0, W, H, 24);
  ctx.fill();

  // --- App label ---
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "bold 18px system-ui, sans-serif";
  ctx.fillText("Komyut ta Bai", PAD, PAD + 14);

  // --- From → To ---
  const fromY = PAD + 56;
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = "500 15px system-ui, sans-serif";
  ctx.fillText("From", PAD, fromY);
  ctx.fillText("To", W / 2 + 20, fromY);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px system-ui, sans-serif";

  // Truncate long names
  function truncate(text: string, maxW: number): string {
    if (ctx.measureText(text).width <= maxW) return text;
    while (ctx.measureText(text + "…").width > maxW && text.length > 0) {
      text = text.slice(0, -1);
    }
    return text + "…";
  }

  ctx.fillText(truncate(origin.name, W / 2 - PAD - 30), PAD, fromY + 30);
  ctx.fillText(
    truncate(destination.name, W / 2 - PAD - 20),
    W / 2 + 20,
    fromY + 30
  );

  // Arrow between stops
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "bold 22px system-ui, sans-serif";
  ctx.fillText("→", W / 2 - 18, fromY + 28);

  // --- Divider ---
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, fromY + 50);
  ctx.lineTo(W - PAD, fromY + 50);
  ctx.stroke();

  // --- Stats row ---
  const statsY = fromY + 80;
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "500 13px system-ui, sans-serif";
  ctx.fillText("Fare", PAD, statsY);
  ctx.fillText("Travel time", W / 3 + PAD, statsY);
  const rides = itinerary.legs.filter((leg) => leg.kind === "ride");
  ctx.fillText("Rides", (W / 3) * 2 + PAD, statsY);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px system-ui, sans-serif";
  ctx.fillText(formatPeso(itinerary.fare), PAD, statsY + 36);
  ctx.fillText(formatDuration(itinerary.total_mins), W / 3 + PAD, statsY + 36);
  ctx.fillText(String(rides.length), (W / 3) * 2 + PAD, statsY + 36);

  // --- Leg chips ---
  const chipY = statsY + 64;
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "500 12px system-ui, sans-serif";
  ctx.fillText("Vehicles", PAD, chipY);

  let chipX = PAD;
  const chipH = 32;
  for (let i = 0; i < rides.length; i++) {
    const leg = rides[i];
    const config = MODE_CONFIG[leg.kind === "ride" ? leg.route.mode : "walk"];
    const chipText = leg.kind === "ride" ? routeCode(leg.route) : config.short;
    ctx.font = "bold 12px system-ui, sans-serif";
    const textW = ctx.measureText(chipText).width;
    const chipW = textW + 24;

    // Chip background
    ctx.fillStyle = config.hex;
    drawRoundRect(ctx, chipX, chipY + 8, chipW, chipH, 6);
    ctx.fill();

    // Chip text
    ctx.fillStyle = config.ink;
    ctx.font = "bold 12px system-ui, sans-serif";
    ctx.fillText(chipText, chipX + 12, chipY + 8 + chipH / 2 + 4);

    chipX += chipW + 8;

    // Arrow between chips
    if (i < rides.length - 1) {
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "14px system-ui, sans-serif";
      ctx.fillText("→", chipX, chipY + 8 + chipH / 2 + 4);
      chipX += 22;
    }
  }

  // --- Footer ---
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "13px system-ui, sans-serif";
  ctx.fillText("Komyut ta Bai. Times and fares are estimates.", PAD, H - PAD + 8);

  const dateStr = new Date().toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  ctx.textAlign = "right";
  ctx.fillText(dateStr, W - PAD, H - PAD + 8);
  ctx.textAlign = "left";

  return canvas;
}

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("canvas.toBlob returned null"));
    }, "image/png");
  });
}

interface Props {
  origin: Stop;
  destination: Stop;
  itinerary: Itinerary;
}

export default function ShareTripButton({ origin, destination, itinerary }: Props) {
  const [busy, setBusy] = useState(false);

  const handleShare = async () => {
    setBusy(true);
    try {
      const canvas = buildCanvas(origin, destination, itinerary);
      const blob = await canvasToBlob(canvas);
      const file = new File([blob], "komyut-trip.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `${origin.name} → ${destination.name}`,
          text: `${formatDuration(itinerary.total_mins)} for ${formatPeso(itinerary.fare)}, planned with Komyut ta Bai`,
          files: [file],
        });
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "komyut-trip.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // Share sheet dismissed or unavailable; nothing to do.
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={busy}
      className="font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-60"
    >
      {busy ? "Preparing image" : "Share"}
    </button>
  );
}
