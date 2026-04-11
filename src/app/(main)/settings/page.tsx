import { fetchSettingsData } from "@/app/actions/settings-actions";
import { SettingsClient } from "@/components/settings/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const data = await fetchSettingsData();
  return (
    <SettingsClient
      email={data.email}
      pets={data.pets}
      currentPetId={data.currentPetId}
    />
  );
}
