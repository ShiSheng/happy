"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** 宠物主展示区：仅等级形象图或 emoji，无 WebGL/渐变框 */
export function PetDisplayStage({
  emoji,
  portraitSrc,
  reducedMotion,
  rewardPulse = 0,
  variant = "default",
}: {
  emoji: string;
  /** 等级对应图片（public 路径）；失败时回退 emoji */
  portraitSrc?: string | null;
  reducedMotion: boolean;
  /** 每次结算成功 +1，触发一次宠物形象轻跳动效 */
  rewardPulse?: number;
  /** showcase：乐园页放大居中主图 */
  variant?: "default" | "showcase";
}) {
  const [portraitFailed, setPortraitFailed] = useState(false);
  const isShowcase = variant === "showcase";
  const showPortrait = Boolean(portraitSrc) && !portraitFailed;

  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center bg-transparent",
        isShowcase
          ? "box-border h-64 px-3 py-4 sm:h-96 sm:px-4 sm:py-5"
          : "h-52",
        isShowcase ? "max-w-2xl" : "max-w-lg",
      )}
    >
      {showPortrait ? (
        isShowcase ? (
          <div className="flex h-full min-h-0 w-full items-center justify-center">
            <img
              key={
                rewardPulse > 0
                  ? `${portraitSrc}-${rewardPulse}`
                  : (portraitSrc ?? "")
              }
              src={portraitSrc!}
              alt=""
              className={cn(
                "relative z-[1] max-h-full max-w-full h-auto w-auto select-none object-contain object-center drop-shadow-md transition-transform duration-300 hover:scale-105",
                rewardPulse > 0 &&
                  !reducedMotion &&
                  "[animation:reward-pop_0.55s_ease-out]",
              )}
              onError={() => setPortraitFailed(true)}
            />
          </div>
        ) : (
          <img
            key={
              rewardPulse > 0
                ? `${portraitSrc}-${rewardPulse}`
                : (portraitSrc ?? "")
            }
            src={portraitSrc!}
            alt=""
            className={cn(
              "relative z-[1] h-28 w-28 select-none object-contain sm:h-32 sm:w-32 drop-shadow-md transition-transform duration-300 hover:scale-105",
              rewardPulse > 0 &&
                !reducedMotion &&
                "[animation:reward-pop_0.55s_ease-out]",
            )}
            onError={() => setPortraitFailed(true)}
          />
        )
      ) : (
        <span
          key={rewardPulse > 0 ? String(rewardPulse) : emoji}
          className={cn(
            "relative z-[1] inline-block select-none leading-none drop-shadow-md transition-transform duration-300 hover:scale-105",
            isShowcase
              ? "text-[clamp(4.5rem,42vmin,12rem)] sm:text-[clamp(5.5rem,38vmin,14rem)]"
              : "text-7xl",
            rewardPulse > 0 &&
              !reducedMotion &&
              "[animation:reward-pop_0.55s_ease-out]",
          )}
          aria-hidden
        >
          {emoji}
        </span>
      )}
    </div>
  );
}
