"use server";

import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import { join } from "path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getDefaultUserId } from "@/lib/auth-context";
import {
  deletePetLevelPortraitRaw,
  fetchOnePetLevelPortraitImagePath,
  upsertPetLevelPortraitRaw,
} from "@/lib/db/petLevelPortraitRaw";

const MAX_BYTES = 4 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

async function assertPetOwned(petId: string, userId: string) {
  const pet = await prisma.pet.findFirst({
    where: { id: petId, userId },
  });
  return pet;
}

function publicPathFor(petId: string, filename: string) {
  return `/uploads/pets/${petId}/${filename}`;
}

async function unlinkPublicImage(imagePath: string) {
  if (!imagePath.startsWith("/uploads/pets/") || imagePath.includes("..")) return;
  const rel = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
  try {
    await unlink(join(process.cwd(), "public", rel));
  } catch {
    /* 文件已不存在 */
  }
}

export async function uploadPetLevelPortrait(
  petId: string,
  level: number,
  formData: FormData,
) {
  if (level < 1 || level > 6) {
    return { ok: false as const, error: "等级须在 1–6" };
  }
  const userId = await getDefaultUserId();
  const pet = await assertPetOwned(petId, userId);
  if (!pet) return { ok: false as const, error: "宠物不存在" };

  const raw = formData.get("file");
  if (!(raw instanceof File) || raw.size === 0) {
    return { ok: false as const, error: "请选择图片文件" };
  }
  if (raw.size > MAX_BYTES) {
    return { ok: false as const, error: "单张不超过 4MB" };
  }
  const ext = MIME_TO_EXT[raw.type];
  if (!ext) {
    return { ok: false as const, error: "仅支持 JPG / PNG / WebP / GIF / SVG" };
  }

  const filename = `lv${level}-${randomUUID()}.${ext}`;
  const imagePath = publicPathFor(petId, filename);
  const dir = join(process.cwd(), "public", "uploads", "pets", petId);
  const absFile = join(dir, filename);

  const existingPath = await fetchOnePetLevelPortraitImagePath(petId, level);
  if (existingPath) {
    await unlinkPublicImage(existingPath);
  }

  const buf = Buffer.from(await raw.arrayBuffer());
  await mkdir(dir, { recursive: true });
  await writeFile(absFile, buf);

  const rowId = `plp_${randomUUID().replace(/-/g, "")}`;
  try {
    await upsertPetLevelPortraitRaw(rowId, petId, level, imagePath);
  } catch (e) {
    await unlinkPublicImage(imagePath);
    throw e;
  }

  revalidatePath("/settings");
  revalidatePath("/pet-paradise");
  return { ok: true as const, imagePath };
}

export async function clearPetLevelPortrait(petId: string, level: number) {
  if (level < 1 || level > 6) {
    return { ok: false as const, error: "等级须在 1–6" };
  }
  const userId = await getDefaultUserId();
  const pet = await assertPetOwned(petId, userId);
  if (!pet) return { ok: false as const, error: "宠物不存在" };

  const existingPath = await fetchOnePetLevelPortraitImagePath(petId, level);
  if (existingPath) {
    await unlinkPublicImage(existingPath);
    await deletePetLevelPortraitRaw(petId, level);
  }

  revalidatePath("/settings");
  revalidatePath("/pet-paradise");
  return { ok: true as const };
}
