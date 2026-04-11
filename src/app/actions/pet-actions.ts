"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getDefaultPetIdForUser, getDefaultUserId } from "@/lib/auth-context";
import { applyInteractionLogic } from "@/lib/domain/applyInteractionLogic";
import { fetchOnePetLevelDisplayNames } from "@/lib/db/petLevelDisplayNamesRaw";
import { fetchPetLevelPortraitRows } from "@/lib/db/petLevelPortraitRaw";
import { toPetDTO } from "@/lib/mappers/petDto";
import type { InteractionRuleDTO } from "@/types/domain";

function toRuleDTO(r: {
  id: string;
  polarity: string;
  name: string;
  xpDelta: number;
  coinDelta: number;
  active: boolean;
}): InteractionRuleDTO {
  const polarity = r.polarity === "negative" ? "negative" : "positive";
  return {
    id: r.id,
    polarity,
    name: r.name,
    xpDelta: r.xpDelta,
    coinDelta: r.coinDelta,
    active: r.active,
  };
}

export async function fetchPetParadiseData() {
  const userId = await getDefaultUserId();
  const petId = await getDefaultPetIdForUser(userId);
  const [pet, rules, logs, portraitRows, levelDisplayNamesRaw] =
    await Promise.all([
      prisma.pet.findUniqueOrThrow({ where: { id: petId } }),
      prisma.interactionRule.findMany({ where: { active: true } }),
      prisma.interactionLog.findMany({
        where: { petId },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { items: { include: { rule: true } } },
      }),
      fetchPetLevelPortraitRows([petId]),
      fetchOnePetLevelDisplayNames(petId),
    ]);
  return {
    pet: toPetDTO(pet, portraitRows, levelDisplayNamesRaw),
    rules: rules.map(toRuleDTO),
    history: logs.map((log) => ({
      id: log.id,
      createdAt: log.createdAt.toISOString(),
      polarity: (log.polarity === "negative" ? "negative" : "positive") as
        | "positive"
        | "negative",
      ruleNames: log.items.map((i) => i.rule.name),
      xpDelta: log.totalXp,
      coinDelta: log.totalCoins,
    })),
  };
}

export async function recordInteraction(selectedRuleIds: string[]) {
  const userId = await getDefaultUserId();
  const petId = await getDefaultPetIdForUser(userId);
  const rules = await prisma.interactionRule.findMany({
    where: { active: true },
  });
  const dtos = rules.map(toRuleDTO);
  const result = applyInteractionLogic({ rules: dtos, selectedRuleIds });
  if (!result.ok) {
    return { ok: false as const, error: result.error };
  }
  const polarity = result.totalXp >= 0 ? "positive" : "negative";
  await prisma.$transaction(async (tx) => {
    await tx.interactionLog.create({
      data: {
        petId,
        totalXp: result.totalXp,
        totalCoins: result.totalCoins,
        polarity,
        items: {
          create: result.appliedRules.map((r) => ({
            ruleId: r.id,
          })),
        },
      },
    });
    await tx.pet.update({
      where: { id: petId },
      data: {
        xp: { increment: result.totalXp },
        coins: { increment: result.totalCoins },
      },
    });
  });
  revalidatePath("/pet-paradise");
  revalidatePath("/shop");
  revalidatePath("/rules");
  revalidatePath("/settings");
  return {
    ok: true as const,
    totalXp: result.totalXp,
    totalCoins: result.totalCoins,
    polarity: (polarity === "negative" ? "negative" : "positive") as
      | "positive"
      | "negative",
  };
}
