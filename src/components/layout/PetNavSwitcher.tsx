"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setCurrentPet } from "@/app/actions/settings-actions";
import { cn } from "@/lib/utils";

export function PetNavSwitcher({
  pets,
  currentPetId,
}: {
  pets: { id: string; name: string }[];
  currentPetId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  if (pets.length <= 1) return null;

  return (
    <div className="mb-4 rounded-2xl border border-line bg-surface-muted/50 p-2">
      <p className="mb-2 px-1 text-xs font-semibold text-ink-muted">当前宠物</p>
      <div className="flex flex-col gap-1">
        {pets.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={pending}
            onClick={() => {
              if (p.id === currentPetId) return;
              startTransition(async () => {
                await setCurrentPet(p.id);
                router.refresh();
              });
            }}
            className={cn(
              "rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors",
              p.id === currentPetId
                ? "bg-peach text-white"
                : "text-ink hover:bg-surface",
            )}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
