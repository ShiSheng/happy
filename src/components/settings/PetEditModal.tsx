"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePetSettings } from "@/app/actions/settings-actions";
import { getPetLevelPresentation } from "@/lib/constants/petLevelPresentation";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/field-label";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PetLevelPortraitsEditor } from "@/components/settings/PetLevelPortraitsEditor";
import type { PetDTO } from "@/types/domain";

const LEVELS = [1, 2, 3, 4, 5, 6] as const;

function emptyLevelNames(): Record<number, string> {
  const o: Record<number, string> = {};
  for (const lv of LEVELS) o[lv] = "";
  return o;
}

function initialLevelNames(pet: PetDTO): Record<number, string> {
  const next = emptyLevelNames();
  for (const lv of LEVELS) {
    next[lv] = pet.levelDisplayNames[lv] ?? "";
  }
  return next;
}

type Props = {
  pet: PetDTO | null;
  open: boolean;
  onClose: () => void;
  onError: (message: string | null) => void;
};

function PetEditModalBody({
  pet,
  onClose,
  onError,
}: {
  pet: PetDTO;
  onClose: () => void;
  onError: (message: string | null) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [nameDraft, setNameDraft] = useState(pet.name);
  const [levelNamesDraft, setLevelNamesDraft] = useState(() =>
    initialLevelNames(pet),
  );

  function setLevelName(lv: number, value: string) {
    setLevelNamesDraft((prev) => ({ ...prev, [lv]: value }));
  }

  function handleSave() {
    onError(null);
    startTransition(async () => {
      const r = await updatePetSettings(pet.id, {
        name: nameDraft,
        levelNames: levelNamesDraft,
      });
      if (!r.ok) {
        onError(r.error);
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <label className="flex flex-col gap-1.5">
        <FieldLabel>宠物名称</FieldLabel>
        <Input
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          disabled={pending}
          aria-label="宠物名称"
        />
      </label>

      <div className="rounded-2xl border border-line bg-surface-muted/30 p-4">
        <p className="mb-3 text-sm font-semibold text-ink">各等级称呼</p>
        <p className="mb-3 text-xs text-ink-muted">
          留空或与全局默认相同时，乐园页使用该等级全局默认称呼；可为本宠物单独起名。
        </p>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {LEVELS.map((lv) => (
            <li key={lv}>
              <label className="flex flex-col gap-1">
                <FieldLabel className="text-xs text-ink-muted">
                  Lv.{lv}（默认：{getPetLevelPresentation(lv).defaultName}）
                </FieldLabel>
                <Input
                  value={levelNamesDraft[lv] ?? ""}
                  placeholder={getPetLevelPresentation(lv).defaultName}
                  onChange={(e) => setLevelName(lv, e.target.value)}
                  disabled={pending}
                  maxLength={40}
                  aria-label={`Lv.${lv} 称呼`}
                />
              </label>
            </li>
          ))}
        </ul>
      </div>

      <PetLevelPortraitsEditor
        pet={pet}
        disabled={pending}
        onError={onError}
      />

      <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={onClose}
        >
          取消
        </Button>
        <Button
          type="button"
          variant="positive"
          disabled={pending}
          onClick={handleSave}
        >
          {pending ? "保存中…" : "保存"}
        </Button>
      </div>
    </div>
  );
}

export function PetEditModal({ pet, open, onClose, onError }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="编辑宠物">
      {open && pet ? (
        <PetEditModalBody key={pet.id} pet={pet} onClose={onClose} onError={onError} />
      ) : null}
    </Modal>
  );
}
