import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

/** 批量读取各宠 levelDisplayNames（TEXT/JSON），避免依赖已生成的 Prisma 字段 */
export async function fetchPetLevelDisplayNamesByPetIds(
  petIds: string[],
): Promise<Map<string, string | null>> {
  const m = new Map<string, string | null>();
  if (petIds.length === 0) return m;
  const rows = await prisma.$queryRaw<{ id: string; levelDisplayNames: string | null }[]>(
    Prisma.sql`
      SELECT "id", "levelDisplayNames" FROM "Pet"
      WHERE "id" IN (${Prisma.join(petIds)})
    `,
  );
  for (const r of rows) {
    m.set(r.id, r.levelDisplayNames);
  }
  return m;
}

export async function fetchOnePetLevelDisplayNames(
  petId: string,
): Promise<string | null> {
  const rows = await prisma.$queryRaw<{ levelDisplayNames: string | null }[]>(
    Prisma.sql`
      SELECT "levelDisplayNames" FROM "Pet" WHERE "id" = ${petId} LIMIT 1
    `,
  );
  return rows[0]?.levelDisplayNames ?? null;
}

export async function updatePetNameAndLevelDisplayNamesRaw(
  petId: string,
  name: string,
  levelDisplayNamesJson: string | null,
): Promise<void> {
  await prisma.$executeRaw(
    Prisma.sql`
      UPDATE "Pet"
      SET "name" = ${name}, "levelDisplayNames" = ${levelDisplayNamesJson}
      WHERE "id" = ${petId}
    `,
  );
}
