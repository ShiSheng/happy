import { fetchPetParadiseData } from "@/app/actions/pet-actions";
import { PetParadiseClient } from "@/components/pet/PetParadiseClient";

export const dynamic = "force-dynamic";

export default async function PetParadisePage() {
  const data = await fetchPetParadiseData();
  return (
    <PetParadiseClient
      pet={data.pet}
      rules={data.rules}
      history={data.history}
    />
  );
}
