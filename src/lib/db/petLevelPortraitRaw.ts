import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type PetLevelPortraitRow = {
  petId: string;
  level: number;
  imagePath: string;
};

export async function fetchPetLevelPortraitRows(
  petIds: string[],
): Promise<PetLevelPortraitRow[]> {
  if (petIds.length === 0) return [];
  return prisma.$queryRaw<PetLevelPortraitRow[]>(
    Prisma.sql`
      SELECT "petId", "level", "imagePath"
      FROM "PetLevelPortrait"
      WHERE "petId" IN (${Prisma.join(petIds)})
    `,
  );
}

export async function fetchOnePetLevelPortraitImagePath(
  petId: string,
  level: number,
): Promise<string | null> {
  const rows = await prisma.$queryRaw<{ imagePath: string }[]>(
    Prisma.sql`
      SELECT "imagePath" FROM "PetLevelPortrait"
      WHERE "petId" = ${petId} AND "level" = ${level}
      LIMIT 1
    `,
  );
  return rows[0]?.imagePath ?? null;
}

export async function upsertPetLevelPortraitRaw(
  id: string,
  petId: string,
  level: number,
  imagePath: string,
): Promise<void> {
  await prisma.$executeRaw(
    Prisma.sql`
      INSERT INTO "PetLevelPortrait" ("id", "petId", "level", "imagePath", "createdAt", "updatedAt")
      VALUES (${id}, ${petId}, ${level}, ${imagePath}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT ("petId", "level") DO UPDATE SET
        "imagePath" = EXCLUDED."imagePath",
        "updatedAt" = CURRENT_TIMESTAMP
    `,
  );
}

export async function deletePetLevelPortraitRaw(
  petId: string,
  level: number,
): Promise<void> {
  await prisma.$executeRaw(
    Prisma.sql`
      DELETE FROM "PetLevelPortrait"
      WHERE "petId" = ${petId} AND "level" = ${level}
    `,
  );
}
