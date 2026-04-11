"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getDefaultPetIdForUser, getDefaultUserId } from "@/lib/auth-context";
import { exchangeGiftLogic } from "@/lib/domain/exchangeGiftLogic";

export async function fetchShopData() {
  const userId = await getDefaultUserId();
  const petId = await getDefaultPetIdForUser(userId);
  const [pet, gifts, exchanges] = await Promise.all([
    prisma.pet.findUniqueOrThrow({ where: { id: petId } }),
    prisma.gift.findMany({ orderBy: { name: "asc" } }),
    prisma.exchangeLog.findMany({
      where: { petId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { gift: true },
    }),
  ]);
  return {
    coins: pet.coins,
    gifts: gifts.map((g) => ({
      id: g.id,
      name: g.name,
      pointCost: g.pointCost,
    })),
    exchangeHistory: exchanges.map((e) => ({
      id: e.id,
      createdAt: e.createdAt.toISOString(),
      giftName: e.gift.name,
      pointsSpent: e.pointsSpent,
    })),
  };
}

export async function createGift(name: string, pointCost: number) {
  if (!name.trim()) return { ok: false as const, error: "名称必填" };
  if (pointCost < 0) return { ok: false as const, error: "价格无效" };
  await prisma.gift.create({
    data: { name: name.trim(), pointCost },
  });
  revalidatePath("/shop");
  return { ok: true as const };
}

export async function updateGift(
  id: string,
  name: string,
  pointCost: number,
) {
  if (!name.trim()) return { ok: false as const, error: "名称必填" };
  if (pointCost < 0) return { ok: false as const, error: "价格无效" };
  await prisma.gift.update({
    where: { id },
    data: { name: name.trim(), pointCost },
  });
  revalidatePath("/shop");
  return { ok: true as const };
}

export async function deleteGift(id: string) {
  await prisma.gift.delete({ where: { id } });
  revalidatePath("/shop");
  return { ok: true as const };
}

export async function exchangeGift(giftId: string) {
  const userId = await getDefaultUserId();
  const petId = await getDefaultPetIdForUser(userId);
  const [pet, gift] = await Promise.all([
    prisma.pet.findUniqueOrThrow({ where: { id: petId } }),
    prisma.gift.findUniqueOrThrow({ where: { id: giftId } }),
  ]);
  const ex = exchangeGiftLogic({
    currentCoins: pet.coins,
    giftPrice: gift.pointCost,
  });
  if (!ex.ok) return { ok: false as const, error: ex.error };
  await prisma.$transaction([
    prisma.pet.update({
      where: { id: petId },
      data: { coins: ex.newBalance },
    }),
    prisma.exchangeLog.create({
      data: {
        petId,
        giftId: gift.id,
        pointsSpent: gift.pointCost,
      },
    }),
  ]);
  revalidatePath("/shop");
  revalidatePath("/pet-paradise");
  return { ok: true as const };
}
