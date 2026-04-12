"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordInteraction } from "@/app/actions/pet-actions";
import { getPetLevelPresentation } from "@/lib/constants/petLevelPresentation";
import { computeLevel, getLevelProgress } from "@/lib/domain/computeLevel";
import {
  resolvePetLevelDisplayName,
  resolvePetLevelImageSrc,
} from "@/lib/domain/petPortrait";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { InteractionHistoryModal } from "@/components/pet/InteractionHistoryModal";
import { PetCornerStats } from "@/components/pet/PetCornerStats";
import { PetDisplayStage } from "@/components/pet/PetDisplayStage";
import {
  SettlementCelebration,
  type SettlementCelebrationPayload,
} from "@/components/pet/SettlementCelebration";
import type {
  InteractionHistoryItemDTO,
  InteractionRuleDTO,
  PetDTO,
} from "@/types/domain";

type Props = {
  pet: PetDTO;
  rules: InteractionRuleDTO[];
  history: InteractionHistoryItemDTO[];
};

type InteractionWizard =
  | { kind: "idle" }
  | { kind: "polarity" }
  | { kind: "rules"; polarity: "positive" | "negative" }
  | { kind: "celebration"; payload: SettlementCelebrationPayload };

/** 参考图左上角锁形按钮（功能仍为互动历史） */
function IconLock({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </svg>
  );
}

function IconPawAccent({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 14c-2 0-3.5 1.5-4 3.5-.3 1.2.5 2.5 1.8 2.5h4.4c1.3 0 2.1-1.3 1.8-2.5-.5-2-2-3.5-4-3.5zM6.5 9.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm11 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM9 7a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
    </svg>
  );
}

export function PetParadiseClient({ pet, rules, history }: Props) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [pending, startTransition] = useTransition();
  const [wizard, setWizard] = useState<InteractionWizard>({ kind: "idle" });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string | null>(null);
  const [rewardPulse, setRewardPulse] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (wizard.kind !== "celebration") return;
    const t = window.setTimeout(() => {
      setWizard({ kind: "idle" });
    }, 5200);
    return () => window.clearTimeout(t);
  }, [wizard]);

  const { level, graduated } = useMemo(
    () => computeLevel(pet.xp),
    [pet.xp],
  );

  const levelProgress = useMemo(() => getLevelProgress(pet.xp), [pet.xp]);

  const levelVisual = useMemo(
    () => getPetLevelPresentation(level),
    [level],
  );

  const showcasePortraitSrc = useMemo(
    () => resolvePetLevelImageSrc(level, pet.levelPortraits),
    [level, pet.levelPortraits],
  );

  const progressPct = useMemo(
    () =>
      levelProgress.maxedOut
        ? 100
        : Math.round(levelProgress.progressInSegment * 100),
    [levelProgress],
  );

  const rulesPolarity =
    wizard.kind === "rules" ? wizard.polarity : null;

  const filteredRules = useMemo(() => {
    if (!rulesPolarity) return [];
    return rules.filter((r) => r.polarity === rulesPolarity && r.active);
  }, [rules, rulesPolarity]);

  const modalOpen = wizard.kind !== "idle";

  function closeModal() {
    setWizard({ kind: "idle" });
    setSelected(new Set());
    setMessage(null);
  }

  function toggleRule(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function onConfirm() {
    setMessage(null);
    const ids = [...selected];
    startTransition(async () => {
      const res = await recordInteraction(ids);
      if (!res.ok) {
        setMessage(res.error);
        return;
      }
      setWizard({
        kind: "celebration",
        payload: {
          totalXp: res.totalXp,
          totalCoins: res.totalCoins,
          polarity: res.polarity,
        },
      });
      setRewardPulse((n) => n + 1);
      setSelected(new Set());
      router.refresh();
    });
  }

  const modalTitle =
    wizard.kind === "rules"
      ? wizard.polarity === "positive"
        ? "正向行为 · 选择具体事项"
        : "负向行为 · 选择具体事项"
      : "选择互动类型";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="宠物乐园"
        description="看看你的宠物，记录今天的互动，攒经验与金币。"
      />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={modalTitle}
        hideTitleBar={wizard.kind === "celebration"}
        ariaLabel={
          wizard.kind === "celebration" ? "互动记录已保存" : undefined
        }
      >
        {wizard.kind === "polarity" ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <Button
                variant="positive"
                className="w-full"
                autoFocus
                onClick={() => {
                  setSelected(new Set());
                  setMessage(null);
                  setWizard({ kind: "rules", polarity: "positive" });
                }}
              >
                正向行为
              </Button>
              <Button
                variant="negative"
                className="w-full"
                onClick={() => {
                  setSelected(new Set());
                  setMessage(null);
                  setWizard({ kind: "rules", polarity: "negative" });
                }}
              >
                负向行为
              </Button>
            </div>
          </div>
        ) : null}

        {wizard.kind === "rules" ? (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="compact"
              className="justify-start px-0 underline"
              onClick={() => {
                setWizard({ kind: "polarity" });
                setSelected(new Set());
                setMessage(null);
              }}
            >
              ← 返回选择类型
            </Button>
            <p className="text-sm text-ink-muted">
              可多选，确认后一次性结算。
            </p>
            {message ? (
              <p className="rounded-2xl bg-terracotta-soft px-3 py-2 text-sm text-terracotta">
                {message}
              </p>
            ) : null}
            {filteredRules.length === 0 ? (
              <p className="rounded-2xl bg-surface-muted px-3 py-4 text-center text-sm text-ink-muted">
                该类型下暂无可选规则，请先到「分值规则」添加或启用规则。
              </p>
            ) : null}
            <ul className="max-h-[min(50vh,320px)] space-y-2 overflow-y-auto pr-1">
              {filteredRules.map((r) => (
                <li key={r.id}>
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border-2 border-line bg-surface-muted/50 px-3 py-2 transition-colors hover:border-peach/50">
                    <input
                      type="checkbox"
                      className="h-5 w-5 shrink-0 rounded border-line text-peach focus:ring-peach"
                      checked={selected.has(r.id)}
                      onChange={() => toggleRule(r.id)}
                    />
                    <span className="flex-1 text-sm font-medium text-ink">
                      {r.name}
                    </span>
                    <span className="shrink-0 text-xs text-ink-muted">
                      XP {r.xpDelta > 0 ? "+" : ""}
                      {r.xpDelta} · 币 {r.coinDelta > 0 ? "+" : ""}
                      {r.coinDelta}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <Button
              variant="primary"
              className="w-full"
              disabled={
                pending || selected.size === 0 || filteredRules.length === 0
              }
              onClick={() => void onConfirm()}
            >
              {pending ? "提交中…" : "确认结算"}
            </Button>
          </div>
        ) : null}

        {wizard.kind === "celebration" ? (
          <SettlementCelebration
            payload={wizard.payload}
            petName={pet.name}
            reducedMotion={reducedMotion}
            onDismiss={() => setWizard({ kind: "idle" })}
          />
        ) : null}
      </Modal>

      <InteractionHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
      />

      <section
        aria-labelledby="pet-stage-title"
        className="mx-auto w-full max-w-2xl"
      >
        <h2 id="pet-stage-title" className="sr-only">
          我的宠物
        </h2>

        <div className="rounded-[28px] border border-white/90 bg-[#fffffe] p-5 shadow-[0_24px_80px_-32px_rgba(74,55,40,0.14)] sm:p-6">
          <div className="relative min-h-[12rem] w-full sm:min-h-[14rem]">
            <div className="absolute left-0 top-0 z-[4] flex flex-col items-start gap-2 sm:left-1">
              <span className="rounded-full bg-peach px-3 py-1 text-xs font-bold tracking-tight text-white shadow-sm">
                Lv.{level}
              </span>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#e8ddd0] bg-[#faf7f2] text-ink shadow-sm transition-colors hover:bg-[#f3ebe0] active:scale-[0.98]"
                aria-label="互动历史"
                onClick={() => setHistoryOpen(true)}
              >
                <IconLock className="h-6 w-6" />
              </button>
            </div>

            <div className="absolute right-0 top-0 z-[4] flex justify-end sm:right-1">
              <PetCornerStats xp={pet.xp} coins={pet.coins} />
            </div>

            <div className="flex justify-center px-2 pt-10 sm:pt-12">
              <PetDisplayStage
                key={`${pet.id}-Lv${level}-${showcasePortraitSrc ?? "emoji"}`}
                variant="showcase"
                portraitSrc={showcasePortraitSrc}
                emoji={levelVisual.emojiFallback}
                reducedMotion={reducedMotion}
                rewardPulse={rewardPulse}
              />
            </div>
          </div>

          <div className="mt-5 space-y-4 border-t border-[#efe6dc] pt-5">
            <div className="text-left">
              <p className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
                {pet.name}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">
                阶段形象：
                {resolvePetLevelDisplayName(level, pet.levelDisplayNames)}
              </p>
              <p className="mt-1 text-sm font-medium text-ink-muted">
                {graduated
                  ? "已满级毕业"
                  : `当前等级 Lv.${level}，加油升到 Lv.${levelProgress.nextLevel}`}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-ink">
                {levelProgress.maxedOut ? (
                  <>
                    经验进度已满 <span className="text-peach">🎓</span>
                  </>
                ) : (
                  <>
                    距 Lv.{levelProgress.nextLevel} 差{" "}
                    <span className="tabular-nums font-bold text-peach">
                      {levelProgress.xpToNext}
                    </span>{" "}
                    XP
                  </>
                )}
              </p>
              <div
                className="relative h-2.5 w-full py-0.5"
                role="progressbar"
                aria-valuenow={progressPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={
                  levelProgress.maxedOut
                    ? "已满级"
                    : `距离 Lv${levelProgress.nextLevel} 还需 ${levelProgress.xpToNext} 经验`
                }
              >
                <div className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-[#ece6de] shadow-[inset_0_1px_2px_rgba(74,55,40,0.06)]" />
                <div
                  className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#f38e3b] to-[#f6d365] transition-[width] duration-500 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
                <div
                  className="absolute top-1/2 z-[1] h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-white shadow-[0_0_12px_rgba(255,255,255,1),0_0_16px_rgba(243,142,59,0.5)]"
                  style={{
                    left:
                      progressPct <= 0
                        ? "0.5rem"
                        : progressPct >= 100
                          ? "calc(100% - 0.5rem)"
                          : `${progressPct}%`,
                  }}
                />
              </div>
            </div>

            <Button
              variant="primary"
              className="grid min-h-[3rem] w-full grid-cols-[1fr_auto_1fr] items-center rounded-2xl border-0 bg-peach px-4 text-base font-bold text-white shadow-[0_12px_32px_-8px_rgba(243,142,59,0.55)] hover:bg-peach-hover"
              onClick={() => {
                setMessage(null);
                setWizard({ kind: "polarity" });
              }}
            >
              <span aria-hidden className="inline-block w-6 sm:w-8" />
              <span className="text-center">今日互动</span>
              <span className="flex justify-end pr-1">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
                  <IconPawAccent className="h-5 w-5 text-white opacity-95" />
                </span>
              </span>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
