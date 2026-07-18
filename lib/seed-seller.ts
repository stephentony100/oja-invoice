import { prisma } from "@/lib/prisma";

// Phase 2 has no login/auth UI — every invoice created in the app belongs
// to this single hardcoded seller.
const SEED_SELLER = {
  name: "Mama Nkechi Stores",
  phone: "+2348031234567",
};

export async function getSeedSellerId(): Promise<string> {
  const seller = await prisma.seller.upsert({
    where: { phone: SEED_SELLER.phone },
    update: {},
    create: SEED_SELLER,
  });
  return seller.id;
}
