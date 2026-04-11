"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/** 参考图：金色奖牌 + 星 */
function IconMedalStar({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const g = `${uid}-medal`;

  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
      <defs>
        <linearGradient id={g} x1="8" y1="4" x2="24" y2="28">
          <stop stopColor="#ffe566" />
          <stop offset="0.45" stopColor="#f6c13a" />
          <stop offset="1" stopColor="#e8a020" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="13" r="8.5" fill={`url(#${g})`} stroke="#d49210" strokeWidth="0.75" />
      <path
        fill="#fffbea"
        d="M16 8.2l1.35 3.95h4.35l-3.52 2.56 1.34 4.14L16 16.5l-3.52 2.55 1.34-4.14-3.52-2.56h4.35L16 8.2z"
      />
      <path
        fill="#e8a020"
        d="M10 21.5h12l-1.2 3.5H11.2L10 21.5z"
      />
      <path fill="#c98612" d="M12 21.5l2 3.5h4l2-3.5H12z" opacity="0.35" />
    </svg>
  );
}

/** 参考图：叠放金币 */
function IconCoinStack({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
      <ellipse cx="16" cy="22" rx="9" ry="3.2" fill="#e8a838" opacity="0.45" />
      <ellipse cx="16" cy="18.5" rx="9" ry="3.2" fill="#f6d365" stroke="#d49210" strokeWidth="0.75" />
      <ellipse cx="16" cy="15" rx="9" ry="3.2" fill="#ffe566" stroke="#e8a838" strokeWidth="0.75" />
      <ellipse cx="16" cy="11.5" rx="8" ry="2.8" fill="#fff4c4" stroke="#e8a838" strokeWidth="0.65" />
      <path
        stroke="#c98612"
        strokeWidth="0.85"
        strokeLinecap="round"
        d="M13.5 11.5h5M16 10v3.2"
      />
    </svg>
  );
}

export function PetCornerStats({
  xp,
  coins,
  className,
}: {
  xp: number;
  coins: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none flex w-full max-w-[11.5rem] flex-col gap-2 select-none sm:max-w-[12.5rem]",
        className,
      )}
      aria-label={`经验币 ${xp}，金币 ${coins}`}
    >
      <div className="flex items-center gap-2 rounded-2xl bg-[#ede6dc] px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
        <IconMedalStar className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" />
        <span className="min-w-0 shrink text-xs font-bold text-[#6b5a4a] sm:text-[0.8125rem]">
          经验币
        </span>
        <span className="ml-auto shrink-0 text-base font-extrabold tabular-nums text-ink sm:text-lg">
          {xp}
        </span>
      </div>
      <div className="flex items-center gap-2 rounded-2xl bg-[#ede6dc] px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
        <IconCoinStack className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" />
        <span className="min-w-0 shrink text-xs font-bold text-[#6b5a4a] sm:text-[0.8125rem]">
          金币
        </span>
        <span className="ml-auto shrink-0 text-base font-extrabold tabular-nums text-ink sm:text-lg">
          {coins}
        </span>
      </div>
    </div>
  );
}
