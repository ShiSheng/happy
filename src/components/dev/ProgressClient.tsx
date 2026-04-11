"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const KEYS = [
  { id: "nav", label: "导航壳与路由" },
  { id: "pet", label: "宠物形态与数值展示" },
  { id: "interaction", label: "今日互动（A/B 多选确认）" },
  { id: "shop", label: "小卖部（上架/兑换/历史）" },
  { id: "rules", label: "分值规则与等级表" },
  { id: "settings", label: "系统设置（宠物增删）" },
] as const;

const STORAGE_KEY = "happy-dev-progress";

export function ProgressClient() {
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setDone(JSON.parse(raw) as Record<string, boolean>);
      } catch {
        /* ignore */
      }
    });
  }, []);

  function toggle(id: string, checked: boolean) {
    setDone((prev) => {
      const next = { ...prev, [id]: checked };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  const total = KEYS.length;
  const count = KEYS.filter((k) => done[k.id]).length;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader
        title="开发进度"
        description="勾选表示已在浏览器中完成目视验收（状态保存在本机 localStorage）。"
      />
      <div className="inline-flex rounded-full border border-line bg-bubble/60 px-4 py-2 text-sm font-semibold text-ink">
        进度 {count}/{total}
      </div>
      <ul className="space-y-3">
        {KEYS.map((k) => (
          <li key={k.id}>
            <Card className="p-0">
              <CardBody className="flex items-center gap-3 px-4 py-3">
                <input
                  id={k.id}
                  type="checkbox"
                  className="h-5 w-5 rounded border-line text-peach focus:ring-peach"
                  checked={!!done[k.id]}
                  onChange={(e) => toggle(k.id, e.target.checked)}
                />
                <label htmlFor={k.id} className="cursor-pointer text-sm text-ink">
                  {k.label}
                </label>
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
