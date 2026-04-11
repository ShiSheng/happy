import { fetchShopData } from "@/app/actions/shop-actions";
import { ShopClient } from "@/components/shop/ShopClient";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const data = await fetchShopData();
  return (
    <ShopClient
      coins={data.coins}
      gifts={data.gifts}
      exchangeHistory={data.exchangeHistory}
    />
  );
}
