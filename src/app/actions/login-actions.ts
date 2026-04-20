"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export type LoginState = { ok: false; error: string } | undefined;

export async function loginUser(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (process.env.AUTH_ENABLED !== "true") {
    return { ok: false, error: "当前未开启登录（AUTH_ENABLED）。" };
  }

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) {
    return { ok: false, error: "请输入账号与密码。" };
  }

  try {
    await signIn("credentials", {
      username,
      password,
      redirectTo: "/pet-paradise",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return { ok: false, error: "账号或密码错误，或登录未启用。" };
    }
    throw e;
  }
}
