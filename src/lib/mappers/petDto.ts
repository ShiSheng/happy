import type { Pet } from "@prisma/client";
import type { PetDTO } from "@/types/domain";

function parseLevelDisplayNamesJson(raw: unknown): Partial<Record<number, string>> {
  let obj: unknown = raw;
  if (raw == null) return {};
  if (typeof raw === "string") {
    if (raw.trim() === "") return {};
    try {
      obj = JSON.parse(raw) as unknown;
    } catch {
      return {};
    }
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return {};
  const out: Partial<Record<number, string>> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const n = Number.parseInt(k, 10);
    if (n < 1 || n > 6 || typeof v !== "string") continue;
    const t = v.trim();
    if (t) out[n] = t;
  }
  return out;
}

export function toPetDTO(
  pet: Pet,
  portraitRows?: { level: number; imagePath: string }[],
  /** 由 $queryRaw 读取；不传则解析为空（旧 Client 无此列时） */
  levelDisplayNamesRaw?: string | null,
): PetDTO {
  const levelPortraits: Record<number, string> = {};
  for (const row of portraitRows ?? []) {
    levelPortraits[row.level] = row.imagePath;
  }
  return {
    id: pet.id,
    name: pet.name,
    xp: pet.xp,
    coins: pet.coins,
    graduatedAt: pet.graduatedAt?.toISOString() ?? null,
    levelPortraits,
    levelDisplayNames: parseLevelDisplayNamesJson(levelDisplayNamesRaw),
  };
}

/** 将查询到的多宠形象行按 petId 分组 */
export function groupPortraitRowsByPetId(
  rows: { petId: string; level: number; imagePath: string }[],
): Map<string, { level: number; imagePath: string }[]> {
  const m = new Map<string, { level: number; imagePath: string }[]>();
  for (const r of rows) {
    const list = m.get(r.petId) ?? [];
    list.push({ level: r.level, imagePath: r.imagePath });
    m.set(r.petId, list);
  }
  return m;
}
