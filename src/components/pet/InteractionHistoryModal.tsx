"use client";

import { useMemo, useState } from "react";
import { formatDateTimeChina } from "@/lib/format-display";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { InteractionHistoryItemDTO } from "@/types/domain";

const PAGE_SIZE = 10;

function PaginatedHistoryBody({
  history,
}: {
  history: InteractionHistoryItemDTO[];
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(history.length / PAGE_SIZE));
  const maxPage = totalPages - 1;
  const safePage = Math.min(page, maxPage);

  const slice = useMemo(
    () =>
      history.slice(
        safePage * PAGE_SIZE,
        safePage * PAGE_SIZE + PAGE_SIZE,
      ),
    [history, safePage],
  );

  return (
    <>
      <ul className="divide-y divide-line">
        {slice.map((h) => (
          <li
            key={h.id}
            className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between"
          >
            <div>
              <span
                className={
                  h.polarity === "positive"
                    ? "font-semibold text-peach"
                    : "font-semibold text-terracotta"
                }
              >
                {h.polarity === "positive" ? "正向" : "负向"}
              </span>
              <span className="ml-2 text-ink">{h.ruleNames.join("、")}</span>
            </div>
            <div className="text-xs text-ink-muted">
              {formatDateTimeChina(h.createdAt)} · XP{" "}
              {h.xpDelta > 0 ? "+" : ""}
              {h.xpDelta} · 币 {h.coinDelta > 0 ? "+" : ""}
              {h.coinDelta}
            </div>
          </li>
        ))}
      </ul>
      {totalPages > 1 ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <Button
            variant="secondary"
            size="compact"
            disabled={safePage <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            上一页
          </Button>
          <span className="text-sm text-ink-muted">
            第 {safePage + 1} / {totalPages} 页（每页 {PAGE_SIZE} 条）
          </span>
          <Button
            variant="secondary"
            size="compact"
            disabled={safePage >= maxPage}
            onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
          >
            下一页
          </Button>
        </div>
      ) : null}
    </>
  );
}

export function InteractionHistoryModal({
  open,
  onClose,
  history,
}: {
  open: boolean;
  onClose: () => void;
  history: InteractionHistoryItemDTO[];
}) {
  return (
    <Modal open={open} onClose={onClose} title="互动历史">
      {open ? (
        history.length === 0 ? (
          <p className="text-center text-sm text-ink-muted">暂无记录</p>
        ) : (
          <PaginatedHistoryBody
            key={history.map((h) => h.id).join("|")}
            history={history}
          />
        )
      ) : null}
    </Modal>
  );
}
