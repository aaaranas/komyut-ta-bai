"use client";

import { Download, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MODE_CONFIG } from "@/lib/constants";
import type { JourneyResult, Stop } from "@/lib/types";
import { formatFare } from "@/lib/utils/fare";
import { formatDuration } from "@/lib/utils/time";

const W = 720;
const H = 400;
const PAD = 40;

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

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
  result: JourneyResult
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // --- Background ---
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0f4c3a");
  bg.addColorStop(1, "#0a7a5e");
  ctx.fillStyle = bg;
  drawRoundRect(ctx, 0, 0, W, H, 24);
  ctx.fill();

  // --- Subtle grid texture ---
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // --- App label ---
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "bold 18px system-ui, sans-serif";
  ctx.fillText("KOMYUT TA BAI", PAD, PAD + 14);

  // --- From → To ---
  const fromY = PAD + 56;
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = "500 15px system-ui, sans-serif";
  ctx.fillText("FROM", PAD, fromY);
  ctx.fillText("TO", W / 2 + 20, fromY);

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
  ctx.fillText("TOTAL FARE", PAD, statsY);
  ctx.fillText("TRAVEL TIME", W / 3 + PAD, statsY);
  const rideCount = result.legs.filter((l) => l.mode !== "transfer").length;
  ctx.fillText("RIDES", (W / 3) * 2 + PAD, statsY);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px system-ui, sans-serif";
  ctx.fillText(formatFare(result.total_fare), PAD, statsY + 36);
  ctx.fillText(
    formatDuration(result.total_duration_mins),
    W / 3 + PAD,
    statsY + 36
  );
  ctx.fillText(String(rideCount), (W / 3) * 2 + PAD, statsY + 36);

  // --- Leg chips ---
  const chipY = statsY + 64;
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "500 12px system-ui, sans-serif";
  ctx.fillText("ROUTE", PAD, chipY);

  let chipX = PAD;
  const chipH = 32;
  const transitLegs = result.legs.filter((l) => l.mode !== "transfer");

  for (let i = 0; i < transitLegs.length; i++) {
    const leg = transitLegs[i];
    const config = MODE_CONFIG[leg.mode as keyof typeof MODE_CONFIG];
    const label = config ? config.label.toUpperCase() : leg.mode.toUpperCase();
    const chipText = `${label}`;
    ctx.font = "bold 12px system-ui, sans-serif";
    const textW = ctx.measureText(chipText).width;
    const chipW = textW + 24;

    // Chip background
    const { r, g, b } = hexToRgb(config?.hex ?? "#64748b");
    ctx.fillStyle = `rgba(${r},${g},${b},0.85)`;
    drawRoundRect(ctx, chipX, chipY + 8, chipW, chipH, chipH / 2);
    ctx.fill();

    // Chip text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px system-ui, sans-serif";
    ctx.fillText(chipText, chipX + 12, chipY + 8 + chipH / 2 + 4);

    chipX += chipW + 8;

    // Arrow between chips
    if (i < transitLegs.length - 1) {
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "14px system-ui, sans-serif";
      ctx.fillText("→", chipX, chipY + 8 + chipH / 2 + 4);
      chipX += 22;
    }
  }

  // --- Footer ---
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "13px system-ui, sans-serif";
  ctx.fillText("komyut-ta-bai.vercel.app", PAD, H - PAD + 8);

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
  result: JourneyResult;
}

export default function ShareTripButton({ origin, destination, result }: Props) {
  const [busy, setBusy] = useState(false);

  const handleShare = async () => {
    setBusy(true);
    try {
      const canvas = buildCanvas(origin, destination, result);
      const blob = await canvasToBlob(canvas);
      const file = new File([blob], "komyut-trip.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `${origin.name} → ${destination.name}`,
          text: `₱${result.total_fare} · ${formatDuration(result.total_duration_mins)} · Komyut ta Bai`,
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
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      disabled={busy}
      className="gap-1.5 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
    >
      {busy ? (
        <Download className="size-3.5 animate-bounce" />
      ) : (
        <Share2 className="size-3.5" />
      )}
      Share trip
    </Button>
  );
}
