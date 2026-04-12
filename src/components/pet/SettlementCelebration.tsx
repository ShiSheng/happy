"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";

export type SettlementCelebrationPayload = {
  totalXp: number;
  totalCoins: number;
  polarity: "positive" | "negative";
};

const CHEER_POSITIVE = [
  "太棒了，为你骄傲！",
  "做得好，宠物都变开心啦！",
  "星光闪闪，继续加油！",
  "每一份努力都值得被看见～",
];

const CHEER_NEGATIVE = [
  "记下来了，下次一起进步～",
  "没关系，我们都在学习中成长。",
  "诚实面对超勇敢，加油！",
];

function pickLine(polarity: "positive" | "negative", seed: number) {
  const list = polarity === "positive" ? CHEER_POSITIVE : CHEER_NEGATIVE;
  return list[Math.abs(seed) % list.length] ?? list[0];
}

function formatDelta(n: number, unit: string) {
  if (n === 0) return `${unit} 0`;
  const sign = n > 0 ? "+" : "";
  return `${unit} ${sign}${n}`;
}

export function SettlementCelebration({
  payload,
  petName,
  reducedMotion,
  onDismiss,
}: {
  payload: SettlementCelebrationPayload;
  petName: string;
  reducedMotion: boolean;
  onDismiss: () => void;
}) {
  const seed = useMemo(
    () => payload.totalXp + payload.totalCoins * 17,
    [payload.totalCoins, payload.totalXp],
  );
  const line = pickLine(payload.polarity, seed);
  const isPositive = payload.polarity === "positive";

  const shellClass = isPositive
    ? "border-peach/35 bg-gradient-to-br from-bubble via-bubble/80 to-surface-muted shadow-[0_12px_40px_-16px_rgba(243,142,59,0.35)]"
    : "border-honey/50 bg-gradient-to-br from-honey/35 via-bubble/70 to-surface-muted shadow-[0_12px_40px_-16px_rgba(244,162,97,0.25)]";

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border-2 px-4 py-5 sm:px-6 ${shellClass}`}
      role="status"
      aria-live="polite"
    >
      {!reducedMotion ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {["✨", "·", "✦", "·", "⭐"].map((ch, i) => (
            <span
              key={i}
              className="absolute text-lg opacity-0 [animation:celebrate-float_2.2s_ease-out_forwards]"
              style={{
                left: `${12 + i * 18}%`,
                top: "55%",
                animationDelay: `${i * 0.12}s`,
              }}
            >
              {ch}
            </span>
          ))}
        </div>
      ) : null}

      <div className="relative text-center">
        <p className="text-2xl font-bold tracking-tight text-ink" aria-hidden>
          {isPositive ? "🎉" : "💛"}
        </p>
        <p className="mt-1 text-base font-semibold text-ink">{line}</p>
        <p className="mt-0.5 text-sm text-ink-muted">
          {petName} 已更新：{formatDelta(payload.totalXp, "XP")} ·{" "}
          {formatDelta(payload.totalCoins, "币")}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="compact"
          className="mt-3 text-ink-muted underline"
          onClick={onDismiss}
        >
          好的
        </Button>
      </div>
    </div>
  );
}
