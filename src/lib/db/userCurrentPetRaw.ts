import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function fetchUserCurrentPetId(
  userId: string,
): Promise<string | null> {
  const rows = await prisma.$queryRaw<{ currentPetId: string | null }[]>(
    Prisma.sql`
      SELECT "currentPetId" FROM "User" WHERE "id" = ${userId} LIMIT 1
    `,
  );
  return rows[0]?.currentPetId ?? null;
}

export async function setUserCurrentPetId(
  userId: string,
  petId: string | null,
): Promise<void> {
  await prisma.$executeRaw(
    Prisma.sql`
      UPDATE "User" SET "currentPetId" = ${petId} WHERE "id" = ${userId}
    `,
  );
}

/** 删除宠物前/后：清除指向该宠物的「当前宠物」指针 */
export async function clearCurrentPetIdForDeletedPet(
  petId: string,
): Promise<void> {
  await prisma.$executeRaw(
    Prisma.sql`
      UPDATE "User" SET "currentPetId" = NULL WHERE "currentPetId" = ${petId}
    `,
  );
}
