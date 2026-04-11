import { fetchRulesData } from "@/app/actions/rules-actions";
import { RulesClient } from "@/components/rules/RulesClient";

export const dynamic = "force-dynamic";

export default async function RulesPage() {
  const data = await fetchRulesData();
  return <RulesClient rules={data.rules} />;
}
