import { notFound } from "next/navigation";
import { ProgressClient } from "@/components/dev/ProgressClient";

/** 与 shop/rules 等一致，避免 build 阶段静态预渲染时执行 layout 内 DB 查询（空库会失败） */
export const dynamic = "force-dynamic";

export default function DevProgressPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return <ProgressClient />;
}
