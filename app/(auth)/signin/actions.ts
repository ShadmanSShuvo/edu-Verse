"use server";

import { redirect } from "next/navigation";
import { getUserByEmail } from "@/db/users";
import { comparePasswords } from "@/lib/password";
import { createUserSession, deleteSession } from "@/lib/session";

export async function signIn(prevState: any, formData: FormData) {
  // Clear any existing session first
  await deleteSession();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await getUserByEmail(email);
  if (!user) {
    return { error: "Invalid email or password." };
  }

  const valid = await comparePasswords({
    password,
    salt: user.salt,
    hashedPassword: user.password,
  });

  if (!valid) {
    return { error: "Invalid email or password." };
  }

  await createUserSession(user.user_id);

  const next = formData.get("next") as string;
  if (next && next.startsWith("/")) {
    redirect(next);
  }

  redirect("/");
}

