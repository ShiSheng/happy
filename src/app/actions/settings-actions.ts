"use server";

import { rm } from "fs/promises";
import { join } from "path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getDefaultPetIdForUser, getDefaultUserId } from "@/lib/auth-context";
import { getPetLevelPresentation } from "@/lib/constants/petLevelPresentation";
import {
  fetchPetLevelDisplayNamesByPetIds,
  updatePetNameAndLevelDisplayNamesRaw,
} from "@/lib/db/petLevelDisplayNamesRaw";
import {
  clearCurrentPetIdForDeletedPet,
  setUserCurrentPetId,
} from "@/lib/db/userCurrentPetRaw";
import { fetchPetLevelPortraitRows } from "@/lib/db/petLevelPortraitRaw";
import {
  groupPortraitRowsByPetId,
  toPetDTO,
} from "@/lib/mappers/petDto";

const PET_LEVELS = [1, 2, 3, 4, 5, 6] as const;
const MAX_LEVEL_DISPLAY_NAME_LEN = 40;

export async function fetchSettingsData() {
  const userId = await getDefaultUserId();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { pets: { orderBy: { id: "asc" } } },
  });
  const petIds = user.pets.map((p) => p.id);
  const [portraitRows, displayByPet] = await Promise.all([
    fetchPetLevelPortraitRows(petIds),
    fetchPetLevelDisplayNamesByPetIds(petIds),
  ]);
  const byPet = groupPortraitRowsByPetId(portraitRows);
  const currentPetId = await getDefaultPetIdForUser(userId);
  return {
    username: user.username,
    email: user.email,
    currentPetId,
    pets: user.pets.map((p) =>
      toPetDTO(p, byPet.get(p.id) ?? [], displayByPet.get(p.id) ?? null),
    ),
  };
}

export async function setCurrentPet(petId: string) {
  const userId = await getDefaultUserId();
  const pet = await prisma.pet.findFirst({ where: { id: petId, userId } });
  if (!pet) return { ok: false as const, error: "宠物不存在" };
  await setUserCurrentPetId(userId, petId);
  revalidatePath("/pet-paradise");
  revalidatePath("/settings");
  revalidatePath("/shop");
  revalidatePath("/rules");
  return { ok: true as const };
}

export async function createPet(name: string) {
  if (!name.trim()) return { ok: false as const, error: "名称必填" };
  const userId = await getDefaultUserId();
  await prisma.pet.create({
    data: { userId, name: name.trim(), xp: 0, coins: 0 },
  });
  revalidatePath("/settings");
  revalidatePath("/pet-paradise");
  return { ok: true as const };
}

export async function updatePetSettings(
  petId: string,
  payload: { name: string; levelNames: Record<number, string> },
) {
  if (!payload.name.trim()) return { ok: false as const, error: "名称必填" };
  const userId = await getDefaultUserId();
  const pet = await prisma.pet.findFirst({ where: { id: petId, userId } });
  if (!pet) return { ok: false as const, error: "宠物不存在" };

  const next: Record<string, string> = {};
  for (const lv of PET_LEVELS) {
    const t = (payload.levelNames[lv] ?? "")
      .trim()
      .slice(0, MAX_LEVEL_DISPLAY_NAME_LEN);
    const globalDefault = getPetLevelPresentation(lv).defaultName;
    if (t.length > 0 && t !== globalDefault) {
      next[String(lv)] = t;
    }
  }

  const jsonStr =
    Object.keys(next).length > 0 ? JSON.stringify(next) : null;
  await updatePetNameAndLevelDisplayNamesRaw(
    petId,
    payload.name.trim(),
    jsonStr,
  );
  revalidatePath("/settings");
  revalidatePath("/pet-paradise");
  return { ok: true as const };
}

export async function deletePet(id: string) {
  const userId = await getDefaultUserId();
  const pet = await prisma.pet.findFirst({ where: { id, userId } });
  if (!pet) return { ok: false as const, error: "宠物不存在" };
  const count = await prisma.pet.count({ where: { userId } });
  if (count <= 1) {
    return { ok: false as const, error: "至少保留一只宠物" };
  }
  await clearCurrentPetIdForDeletedPet(id);
  await prisma.pet.delete({ where: { id } });
  try {
    await rm(join(process.cwd(), "public", "uploads", "pets", id), {
      recursive: true,
      force: true,
    });
  } catch {
    /* 目录不存在 */
  }
  revalidatePath("/settings");
  revalidatePath("/pet-paradise");
  return { ok: true as const };
}
