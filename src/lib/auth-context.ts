import { prisma } from "@/lib/db";
import { fetchUserCurrentPetId } from "@/lib/db/userCurrentPetRaw";
import { getSessionUserId } from "@/lib/auth/session";

/** 演示用户或 AUTH_ENABLED 时的会话用户 */
export async function getDefaultUserId(): Promise<string> {
  const sessionUid = await getSessionUserId();
  if (process.env.AUTH_ENABLED === "true") {
    if (!sessionUid) {
      throw new Error("UNAUTHORIZED");
    }
    const u = await prisma.user.findUnique({ where: { id: sessionUid } });
    if (!u) throw new Error("UNAUTHORIZED");
    return u.id;
  }
  if (sessionUid) {
    const u = await prisma.user.findUnique({ where: { id: sessionUid } });
    if (u) return u.id;
  }
  const fromEnv = process.env.DEFAULT_USER_ID;
  if (fromEnv) return fromEnv;
  const u = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!u) throw new Error("No user in database; run prisma db seed");
  return u.id;
}

/** 优先 User.currentPetId（库内），无效则回退到 id 升序第一只 */
export async function getDefaultPetIdForUser(userId: string): Promise<string> {
  const stored = await fetchUserCurrentPetId(userId);
  if (stored) {
    const ok = await prisma.pet.findFirst({
      where: { id: stored, userId },
      select: { id: true },
    });
    if (ok) return ok.id;
  }
  const pet = await prisma.pet.findFirst({
    where: { userId },
    orderBy: { id: "asc" },
  });
  if (!pet) throw new Error("No pet for user; run prisma db seed");
  return pet.id;
}
