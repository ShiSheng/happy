import { MainShell } from "@/components/layout/MainShell";
import { getDefaultUserId, getDefaultPetIdForUser } from "@/lib/auth-context";
import { prisma } from "@/lib/db";

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
