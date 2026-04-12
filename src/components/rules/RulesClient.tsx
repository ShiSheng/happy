"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createRule,
  deleteRule,
  updateRule,
} from "@/app/actions/rules-actions";
import { LEVEL_THRESHOLDS_DESC } from "@/lib/constants/levels";
import { formatIntegerEn } from "@/lib/format-display";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldLabel } from "@/components/ui/field-label";
import { Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import type { InteractionRuleDTO, Polarity } from "@/types/domain";

type Props = {
  rules: InteractionRuleDTO[];
};

export function RulesClient({ rules }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    polarity: "positive" as Polarity,
    name: "",
    xpDelta: 10,
    coinDelta: 2,
  });

  const positive = rules.filter((r) => r.polarity === "positive");
  const negative = rules.filter((r) => r.polarity === "negative");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="分值规则"
        description="配置互动加减分。等级阈值为只读说明。"
      />

      {msg ? (
        <p className="rounded-2xl bg-terracotta-soft px-4 py-2 text-sm text-terracotta">
          {msg}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>新增规则</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <FieldLabel>类型</FieldLabel>
              <Select
                value={form.polarity}
                onChange={(e) =>
                  setForm({
                    ...form,
                    polarity: e.target.value as Polarity,
                  })
                }
              >
                <option value="positive">正向</option>
                <option value="negative">负向</option>
              </Select>
            </label>
            <label className="flex flex-col gap-1">
              <FieldLabel>名称</FieldLabel>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1">
              <FieldLabel>经验值变化</FieldLabel>
              <Input
                type="number"
                value={form.xpDelta}
                onChange={(e) =>
                  setForm({ ...form, xpDelta: Number(e.target.value) })
                }
              />
            </label>
            <label className="flex flex-col gap-1">
              <FieldLabel>金币变化</FieldLabel>
              <Input
                type="number"
                value={form.coinDelta}
                onChange={(e) =>
                  setForm({ ...form, coinDelta: Number(e.target.value) })
                }
              />
            </label>
          </div>
          <Button
            variant="primary"
            className="mt-4"
            disabled={pending}
            onClick={() => {
              setMsg(null);
              startTransition(async () => {
                const r = await createRule(form);
                if (!r.ok) setMsg(r.error);
                else {
                  setForm({
                    polarity: "positive",
                    name: "",
                    xpDelta: 10,
                    coinDelta: 2,
                  });
                  router.refresh();
                }
              });
            }}
          >
            确认添加
          </Button>
        </CardBody>
      </Card>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="border-peach/30 bg-bubble/30">
          <CardHeader>
            <CardTitle className="text-peach">正向</CardTitle>
          </CardHeader>
          <CardBody>
            <ul className="space-y-2 text-sm">
              {positive.map((r) => (
                <RuleRow
                  key={r.id}
                  rule={r}
                  pending={pending}
                  onSave={(input) =>
                    startTransition(async () => {
                      setMsg(null);
                      const res = await updateRule(r.id, input);
                      if (!res.ok) setMsg(res.error);
                      else router.refresh();
                    })
                  }
                  onDelete={() =>
                    startTransition(async () => {
                      await deleteRule(r.id);
                      router.refresh();
                    })
                  }
                />
              ))}
            </ul>
          </CardBody>
        </Card>
        <Card className="border-terracotta/30 bg-terracotta-soft/40">
          <CardHeader>
            <CardTitle className="text-terracotta">负向</CardTitle>
          </CardHeader>
          <CardBody>
            <ul className="space-y-2 text-sm">
              {negative.map((r) => (
                <RuleRow
                  key={r.id}
                  rule={r}
                  pending={pending}
                  onSave={(input) =>
                    startTransition(async () => {
                      setMsg(null);
                      const res = await updateRule(r.id, input);
                      if (!res.ok) setMsg(res.error);
                      else router.refresh();
                    })
                  }
                  onDelete={() =>
                    startTransition(async () => {
                      await deleteRule(r.id);
                      router.refresh();
                    })
                  }
                />
              ))}
            </ul>
          </CardBody>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>宠物等级（只读）</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead>
                <tr className="border-b-2 border-line">
                  <th className="py-3 pr-4 font-semibold text-ink">等级</th>
                  <th className="py-3 pr-4 font-semibold text-ink">最低 XP</th>
                  <th className="py-3 font-semibold text-ink">说明</th>
                </tr>
              </thead>
              <tbody>
                {LEVEL_THRESHOLDS_DESC.map((row) => (
                  <tr key={row.level} className="border-b border-line">
                    <td className="py-2.5 pr-4 font-medium">Lv{row.level}</td>
                    <td className="py-2.5 pr-4 tabular-nums">
                      {formatIntegerEn(row.minXp)}
                    </td>
                    <td className="py-2.5 text-ink-muted">{row.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function RuleRow({
  rule,
  pending,
  onSave,
  onDelete,
}: {
  rule: InteractionRuleDTO;
  pending: boolean;
  onSave: (input: {
    polarity: Polarity;
    name: string;
    xpDelta: number;
    coinDelta: number;
    active: boolean;
  }) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    polarity: rule.polarity,
    name: rule.name,
    xpDelta: rule.xpDelta,
    coinDelta: rule.coinDelta,
    active: rule.active,
  });

  if (!open) {
    return (
      <li className="flex items-center justify-between gap-2 rounded-2xl border border-line bg-surface px-3 py-2.5">
        <span className="text-ink">
          {rule.name}{" "}
          <span className="text-ink-muted">
            XP {rule.xpDelta > 0 ? "+" : ""}
            {rule.xpDelta} / 币 {rule.coinDelta > 0 ? "+" : ""}
            {rule.coinDelta}
          </span>
          {!rule.active ? (
            <span className="ml-2 text-xs text-ink-muted">已停用</span>
          ) : null}
        </span>
        <span className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="compact"
            className="text-peach"
            onClick={() => {
              setDraft({
                polarity: rule.polarity,
                name: rule.name,
                xpDelta: rule.xpDelta,
                coinDelta: rule.coinDelta,
                active: rule.active,
              });
              setOpen(true);
            }}
          >
            编辑
          </Button>
          <Button variant="ghost" size="compact" className="text-berry" onClick={onDelete}>
            删除
          </Button>
        </span>
      </li>
    );
  }

  return (
    <li className="space-y-3 rounded-2xl border-2 border-line bg-surface p-3">
      <Input
        value={draft.name}
        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
      />
      <div className="flex flex-wrap gap-2">
        <Select
          className="w-auto min-w-[6rem]"
          value={draft.polarity}
          onChange={(e) =>
            setDraft({ ...draft, polarity: e.target.value as Polarity })
          }
        >
          <option value="positive">正向</option>
          <option value="negative">负向</option>
        </Select>
        <Input
          type="number"
          className="w-24"
          value={draft.xpDelta}
          onChange={(e) =>
            setDraft({ ...draft, xpDelta: Number(e.target.value) })
          }
        />
        <Input
          type="number"
          className="w-24"
          value={draft.coinDelta}
          onChange={(e) =>
            setDraft({ ...draft, coinDelta: Number(e.target.value) })
          }
        />
        <label className="flex min-h-11 items-center gap-2 text-xs text-ink">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-line text-peach"
            checked={draft.active}
            onChange={(e) =>
              setDraft({ ...draft, active: e.target.checked })
            }
          />
          启用
        </label>
      </div>
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="compact"
          disabled={pending}
          onClick={() => {
            onSave(draft);
            setOpen(false);
          }}
        >
          保存
        </Button>
        <Button variant="ghost" size="compact" onClick={() => setOpen(false)}>
          取消
        </Button>
      </div>
    </li>
  );
}
