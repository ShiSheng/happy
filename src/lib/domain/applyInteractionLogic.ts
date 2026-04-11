import type { InteractionRuleDTO } from "@/types/domain";

export type ApplyInteractionInput = {
  rules: InteractionRuleDTO[];
  selectedRuleIds: string[];
};

export type ApplyInteractionResult =
  | {
      ok: true;
      totalXp: number;
      totalCoins: number;
      appliedRules: InteractionRuleDTO[];
    }
  | { ok: false; error: string };

export function applyInteractionLogic(
  input: ApplyInteractionInput,
): ApplyInteractionResult {
  if (input.selectedRuleIds.length === 0) {
    return { ok: false, error: "请至少选择一项行为" };
  }
  const byId = new Map(input.rules.map((r) => [r.id, r]));
  const applied: InteractionRuleDTO[] = [];
  for (const id of input.selectedRuleIds) {
    const r = byId.get(id);
    if (!r || !r.active) {
      return { ok: false, error: "存在无效或未启用的规则" };
    }
    applied.push(r);
  }
  const totalXp = applied.reduce((s, r) => s + r.xpDelta, 0);
  const totalCoins = applied.reduce((s, r) => s + r.coinDelta, 0);
  return { ok: true, totalXp, totalCoins, appliedRules: applied };
}
