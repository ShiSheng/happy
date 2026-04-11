"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createGift,
  deleteGift,
  exchangeGift,
  updateGift,
} from "@/app/actions/shop-actions";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldLabel } from "@/components/ui/field-label";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { formatDateTimeUtc } from "@/lib/format-display";
import type { ExchangeHistoryItemDTO, GiftDTO } from "@/types/domain";

type Props = {
  coins: number;
  gifts: GiftDTO[];
  exchangeHistory: ExchangeHistoryItemDTO[];
};

export function ShopClient({ coins, gifts, exchangeHistory }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState(10);
  const [editing, setEditing] = useState<GiftDTO | null>(null);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="小卖部"
        description={
          <>
            用金币换小礼物。当前金币：
            <span className="ml-1 font-bold text-coral">{coins}</span>
          </>
        }
      />

      {msg ? (
        <p className="rounded-2xl border border-line bg-bubble/80 px-4 py-3 text-sm text-ink">
          {msg}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>礼物列表</CardTitle>
        </CardHeader>
        <CardBody>
          <ul className="grid gap-3 sm:grid-cols-2">
            {gifts.map((g) => (
              <li
                key={g.id}
                className="flex flex-col gap-3 rounded-2xl border-2 border-line bg-surface-muted/40 p-4"
              >
                <div>
                  <div className="font-bold text-ink">{g.name}</div>
                  <div className="text-xs text-ink-muted">
                    {g.pointCost} 金币
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="positive"
                    size="compact"
                    className="flex-1"
                    disabled={pending || coins < g.pointCost}
                    onClick={() => {
                      setMsg(null);
                      startTransition(async () => {
                        const r = await exchangeGift(g.id);
                        if (!r.ok) setMsg(r.error);
                        else {
                          setMsg(`已兑换「${g.name}」`);
                          router.refresh();
                        }
                      });
                    }}
                  >
                    确认兑换
                  </Button>
                  <Button
                    variant="secondary"
                    size="compact"
                    onClick={() => setEditing(g)}
                  >
                    编辑
                  </Button>
                  <Button
                    variant="danger"
                    size="compact"
                    onClick={() => {
                      startTransition(async () => {
                        await deleteGift(g.id);
                        router.refresh();
                      });
                    }}
                  >
                    删除
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>新增礼物</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="flex flex-1 flex-col gap-1">
              <FieldLabel>名称</FieldLabel>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 sm:w-36">
              <FieldLabel>金币价格</FieldLabel>
              <Input
                type="number"
                min={0}
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
              />
            </label>
            <Button
              variant="primary"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  const r = await createGift(newName, newPrice);
                  if (!r.ok) setMsg(r.error);
                  else {
                    setNewName("");
                    setNewPrice(10);
                    router.refresh();
                  }
                });
              }}
            >
              确认上架
            </Button>
          </div>
        </CardBody>
      </Card>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4 backdrop-blur-[2px]">
          <div
            className="w-full max-w-md rounded-3xl border-2 border-line bg-surface p-6 shadow-[0_20px_60px_-20px_rgba(61,52,41,0.35)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-gift-title"
          >
            <h3 id="edit-gift-title" className="mb-4 text-lg font-bold text-ink">
              编辑礼物
            </h3>
            <div className="space-y-3">
              <Input
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
              />
              <Input
                type="number"
                min={0}
                value={editing.pointCost}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    pointCost: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" size="compact" onClick={() => setEditing(null)}>
                取消
              </Button>
              <Button
                variant="primary"
                size="compact"
                onClick={() => {
                  startTransition(async () => {
                    await updateGift(editing.id, editing.name, editing.pointCost);
                    setEditing(null);
                    router.refresh();
                  });
                }}
              >
                保存
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>兑换历史</CardTitle>
        </CardHeader>
        <CardBody>
          {exchangeHistory.length === 0 ? (
            <p className="text-sm text-ink-muted">暂无兑换</p>
          ) : (
            <ul className="text-sm text-ink">
              {exchangeHistory.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-wrap justify-between gap-2 border-b border-line py-3 last:border-0"
                >
                  <span className="font-medium">{e.giftName}</span>
                  <span className="text-ink-muted">
                    -{e.pointsSpent} 金币 ·{" "}
                    {formatDateTimeUtc(e.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
