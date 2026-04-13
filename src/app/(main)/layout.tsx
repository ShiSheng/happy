import { MainShell } from "@/components/layout/MainShell";
import { getDefaultUserId, getDefaultPetIdForUser } from "@/lib/auth-context";
import { prisma } from "@/lib/db";

/** 避免 build 阶段预渲染本段时查库（Vercel 上 migrate 后若未 seed，空库会导致 getDefaultUserId 抛错） */
export const dynamic = "force-dynamic";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getDefaultUserId();
  const [pets, currentPetId] = await Promise.all([
    prisma.pet.findMany({
      where: { userId },
      orderBy: { id: "asc" },
      select: { id: true, name: true },
    }),
    getDefaultPetIdForUser(userId),
  ]);

  return (
    <MainShell
      pets={pets}
      currentPetId={currentPetId}
      showLoginLink={process.env.AUTH_ENABLED === "true"}
    >
      {children}
    </MainShell>
  );
}
