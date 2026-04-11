"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { Polarity } from "@/types/domain";

export async function fetchRulesData() {
  const rules = await prisma.interactionRule.findMany({
    orderBy: [{ polarity: "asc" }, { name: "asc" }],
  });
  return {
    rules: rules.map((r) => ({
      id: r.id,
      polarity: (r.polarity === "negative" ? "negative" : "positive") as Polarity,
      name: r.name,
      xpDelta: r.xpDelta,
      coinDelta: r.coinDelta,
      active: r.active,
    })),
  };
}

export async function createRule(input: {
  polarity: Polarity;
  name: string;
  xpDelta: number;
  coinDelta: number;
}) {
  if (!input.name.trim()) return { ok: false as const, error: "名称必填" };
  await prisma.interactionRule.create({
    data: {
      polarity: input.polarity,
      name: input.name.trim(),
      xpDelta: input.xpDelta,
      coinDelta: input.coinDelta,
    },
  });
  revalidatePath("/rules");
  revalidatePath("/pet-paradise");
  return { ok: true as const };
}

export async function updateRule(
  id: string,
  input: {
    polarity: Polarity;
    name: string;
    xpDelta: number;
    coinDelta: number;
    active: boolean;
  },
) {
  if (!input.name.trim()) return { ok: false as const, error: "名称必填" };
  await prisma.interactionRule.update({
    where: { id },
    data: {
      polarity: input.polarity,
      name: input.name.trim(),
      xpDelta: input.xpDelta,
      coinDelta: input.coinDelta,
      active: input.active,
    },
  });
  revalidatePath("/rules");
  revalidatePath("/pet-paradise");
  return { ok: true as const };
}

export async function deleteRule(id: string) {
  await prisma.interactionRule.update({
    where: { id },
    data: { active: false },
  });
  revalidatePath("/rules");
  revalidatePath("/pet-paradise");
  return { ok: true as const };
}
