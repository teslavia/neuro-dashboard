"use client";

import { useRef, useEffect } from "react";
import type { BoundingBox } from "@/lib/types";

interface DetectionImagePreviewProps {
  frameData: string; // base64 JPEG
  boxes: BoundingBox[];
  width?: number;
  height?: number;
  className?: string;
}

const BOX_COLORS: Record<string, string> = {
  person: "#ef4444",
  car: "#3b82f6",
  dog: "#f59e0b",
  cat: "#8b5cf6",
};

function getBoxColor(className: string): string {
  return BOX_COLORS[className.toLowerCase()] || "#22c55e";
}

export function DetectionImagePreview({
  frameData,
  boxes,
  width = 640,
  height = 480,
  className,
}: DetectionImagePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      for (const box of boxes) {
        const x = box.xMin * img.width;
        const y = box.yMin * img.height;
        const w = (box.xMax - box.xMin) * img.width;
        const h = (box.yMax - box.yMin) * img.height;
        const color = getBoxColor(box.className);

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        const label = `${box.className} ${(box.confidence * 100).toFixed(0)}%`;
        ctx.font = "12px Inter, sans-serif";
        const textWidth = ctx.measureText(label).width;
        ctx.fillStyle = color;
        ctx.fillRect(x, y - 18, textWidth + 8, 18);
        ctx.fillStyle = "#fff";
        ctx.fillText(label, x + 4, y - 4);
      }
    };
    img.src = `data:image/jpeg;base64,${frameData}`;
  }, [frameData, boxes]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{ maxWidth: "100%", height: "auto" }}
    />
  );
}
