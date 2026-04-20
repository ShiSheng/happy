"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import {
  isValidPassword,
  isValidUsername,
  normalizeUsername,
} from "@/lib/username";
import { defaultNewPetName } from "@/lib/constants/petLevelPresentation";

export type RegisterState = { ok: false; error: string } | undefined;

export async function registerUser(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  if (process.env.AUTH_ENABLED !== "true") {
    return { ok: false, error: "当前未开启注册（AUTH_ENABLED）。" };
  }

  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!isValidUsername(username)) {
    return {
      ok: false,
      error: "账号为 2～20 位小写字母、数字或下划线。",
    };
  }
  if (!isValidPassword(password)) {
    return { ok: false, error: "密码长度为 6～72 位。" };
  }
  if (password !== confirm) {
    return { ok: false, error: "两次输入的密码不一致。" };
  }

  const existing = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (existing) {
    return { ok: false, error: "该账号已被注册。" };
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        username,
        passwordHash,
      },
    });
    await tx.pet.create({
      data: {
        userId: user.id,
        name: defaultNewPetName(),
        xp: 0,
        coins: 0,
      },
    });
  });

  redirect("/login?registered=1");
}
