"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  clearPetLevelPortrait,
  uploadPetLevelPortrait,
} from "@/app/actions/pet-portrait-actions";
import { listPetLevelPresentations } from "@/lib/constants/petLevelPresentation";
import { resolvePetLevelImageSrc } from "@/lib/domain/petPortrait";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/field-label";
import type { PetDTO } from "@/types/domain";

const LEVELS = listPetLevelPresentations().map((r) => r.level);

function formatServerActionError(e: unknown): string {
  if (e instanceof TypeError && e.message === "Failed to fetch") {
    return "请求失败：请确认开发服务在运行；上传大图勿超过 4MB；勿混用 localhost 与 127.0.0.1。修改 next.config 后需重启 dev。";
  }
  if (e instanceof Error && e.message) return e.message;
  return "操作失败，请稍后重试";
}

type Props = {
  pet: PetDTO;
  disabled?: boolean;
  onError?: (message: string) => void;
};

export function PetLevelPortraitsEditor({ pet, disabled, onError }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  function setInputRef(level: number, el: HTMLInputElement | null) {
    inputRefs.current[level] = el;
  }

  return (
    <div className="mt-4 rounded-2xl border border-line bg-surface-muted/40 p-4">
      <FieldLabel className="mb-3 block text-ink">
        各等级形象（本宠物独立）
      </FieldLabel>
      <p className="mb-3 text-xs text-ink-muted">
        上传后乐园页按当前等级显示对应图；未上传的等级使用全局默认图。支持 JPG / PNG / WebP / GIF /
        SVG，单张 ≤ 4MB。
      </p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {LEVELS.map((lv) => {
          const src = resolvePetLevelImageSrc(lv, pet.levelPortraits);
          const isCustom = Boolean(pet.levelPortraits[lv]);
          return (
            <li
              key={lv}
              className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-3"
            >
              <span className="text-center text-xs font-bold text-ink-muted">
                Lv.{lv}
              </span>
              <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-line bg-surface-muted">
                <img
                  src={src}
                  alt=""
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
              <input
                ref={(el) => setInputRef(lv, el)}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                className="sr-only"
                id={`pet-${pet.id}-lv-${lv}`}
                disabled={disabled || pending}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  const fd = new FormData();
                  fd.set("file", file);
                  startTransition(async () => {
                    try {
                      const r = await uploadPetLevelPortrait(pet.id, lv, fd);
                      if (r.ok) router.refresh();
                      else onError?.(r.error);
                    } catch (e) {
                      onError?.(formatServerActionError(e));
                    }
                  });
                }}
              />
              <div className="flex flex-col gap-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="compact"
                  className="w-full text-xs"
                  disabled={disabled || pending}
                  onClick={() => inputRefs.current[lv]?.click()}
                >
                  上传
                </Button>
                {isCustom ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="compact"
                    className="w-full text-xs text-ink-muted underline"
                    disabled={disabled || pending}
                    onClick={() => {
                      startTransition(async () => {
                        try {
                          const r = await clearPetLevelPortrait(pet.id, lv);
                          if (r.ok) router.refresh();
                          else onError?.(r.error);
                        } catch (e) {
                          onError?.(formatServerActionError(e));
                        }
                      });
                    }}
                  >
                    恢复默认
                  </Button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
