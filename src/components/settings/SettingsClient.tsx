"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPet, deletePet, setCurrentPet } from "@/app/actions/settings-actions";
import {
  defaultNewPetName,
  listPetLevelPresentations,
} from "@/lib/constants/petLevelPresentation";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldLabel } from "@/components/ui/field-label";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { PetEditModal } from "@/components/settings/PetEditModal";
import type { PetDTO } from "@/types/domain";

const LEVEL_ROWS = listPetLevelPresentations();

type Props = {
  email: string | null;
  pets: PetDTO[];
  currentPetId: string;
};

export function SettingsClient({ email, pets, currentPetId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [editPetId, setEditPetId] = useState<string | null>(null);

  const editPet = useMemo(() => {
    if (!editPetId) return null;
    return pets.find((p) => p.id === editPetId) ?? null;
  }, [editPetId, pets]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="系统设置"
        description="账号信息与宠物管理（演示环境为单用户）。"
      />

      {msg ? (
        <p className="rounded-2xl bg-terracotta-soft px-4 py-2 text-sm text-terracotta">
          {msg}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>账号</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-ink-muted">
            邮箱：{" "}
            <span className="font-medium text-ink">{email ?? "（未设置）"}</span>
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>等级与形象</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          <p className="text-sm text-ink-muted">
            每个等级对应所需累计经验、新建宠物时的默认称呼参考，以及乐园页展示图（可替换{" "}
            <code className="rounded bg-surface-muted px-1 text-xs">public/pet-levels/*.svg</code>）。
          </p>
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-muted/50 text-ink-muted">
                  <th className="px-3 py-2.5 font-semibold">等级</th>
                  <th className="px-3 py-2.5 font-semibold">所需经验（累计）</th>
                  <th className="px-3 py-2.5 font-semibold">初始名称</th>
                  <th className="px-3 py-2.5 font-semibold">形象</th>
                </tr>
              </thead>
              <tbody>
                {LEVEL_ROWS.map((row) => (
                  <tr
                    key={row.level}
                    className="border-b border-line/80 last:border-0"
                  >
                    <td className="px-3 py-2.5 font-bold text-ink">
                      Lv.{row.level}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-ink">
                      {row.minXp}
                    </td>
                    <td className="px-3 py-2.5 text-ink">{row.defaultName}</td>
                    <td className="px-3 py-2.5">
                      <img
                        src={row.imageSrc}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-xl border border-line/80 bg-surface-muted object-cover"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>宠物管理</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="flex flex-1 flex-col gap-1 sm:max-w-xs">
              <FieldLabel>新宠物名称</FieldLabel>
              <Input
                value={name}
                placeholder={defaultNewPetName()}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <Button
              variant="positive"
              disabled={pending}
              onClick={() => {
                setMsg(null);
                startTransition(async () => {
                  const r = await createPet(name);
                  if (!r.ok) setMsg(r.error);
                  else {
                    setName("");
                    router.refresh();
                  }
                });
              }}
            >
              添加宠物
            </Button>
          </div>
          <ul className="space-y-0">
            {pets.map((p) => (
              <li key={p.id} className="border-b border-line/80 py-4 last:border-0">
                <div className="flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div>
                    <div className="font-bold text-ink">{p.name}</div>
                    <div className="text-xs text-ink-muted">
                      经验 {p.xp} · 金币 {p.coins}
                    </div>
                    <p className="mt-1 text-xs text-ink-muted">
                      编辑内可修改名称、各等级称呼与形象图。
                    </p>
                    {p.id === currentPetId ? (
                      <p className="mt-1 text-xs font-semibold text-peach">
                        当前在乐园参展
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.id !== currentPetId ? (
                      <Button
                        variant="positive"
                        size="compact"
                        disabled={pending}
                        onClick={() => {
                          setMsg(null);
                          startTransition(async () => {
                            const r = await setCurrentPet(p.id);
                            if (!r.ok) setMsg(r.error);
                            else router.refresh();
                          });
                        }}
                      >
                        设为当前参展
                      </Button>
                    ) : null}
                    <Button
                      variant="secondary"
                      size="compact"
                      disabled={pending}
                      onClick={() => {
                        setMsg(null);
                        setEditPetId(p.id);
                      }}
                    >
                      编辑
                    </Button>
                    <Button
                      variant="danger"
                      size="compact"
                      disabled={pending}
                      onClick={() => {
                        setMsg(null);
                        startTransition(async () => {
                          const r = await deletePet(p.id);
                          if (!r.ok) setMsg(r.error);
                          else router.refresh();
                        });
                      }}
                    >
                      移除
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <PetEditModal
        pet={editPet}
        open={editPetId !== null && editPet !== null}
        onClose={() => setEditPetId(null)}
        onError={setMsg}
      />
    </div>
  );
}
