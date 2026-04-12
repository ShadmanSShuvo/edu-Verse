"use server";

import { redirect } from "next/navigation";
import { createUser, getUserByEmail } from "@/db/users";
import { createStudent } from "@/db/student";
import { createInstructor } from "@/db/instructor";
import { getRoleByName, assignRoleToUser } from "@/db/roles";
import { hashPassword, generateSalt } from "@/lib/password";
import { createUserSession, deleteSession } from "@/lib/session";

export async function signUp(prevState: any, formData: FormData) {
  // Clear any existing session first
  await deleteSession();
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const secretKey = formData.get("secretKey") as string;

  const existing = await getUserByEmail(email);
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  // Security measure: Protect against unauthorized role injection
  if (role !== "student" && role !== "instructor") {
    return { error: "Invalid role for registration." };
  }

  // Enforce secret key for instructors
  if (role === "instructor") {
    const instructorSecret = process.env.INSTRUCTOR_SIGNUP_SECRET;
    if (!instructorSecret || secretKey !== instructorSecret) {
      return { error: "Invalid Instructor Secret Key. Contact admin for the key." };
    }
  }

  try {
    const salt = generateSalt();
    const hashedPassword = await hashPassword(password, salt);

    const user = await createUser(name, email, hashedPassword, salt);
    if (!user) return { error: "Unable to create account." };

    const roleRecord = await getRoleByName(role);
    if (!roleRecord) return { error: "Invalid role selected." };

    await assignRoleToUser(user.user_id, roleRecord.role_id);

    if (role === "student") {
      await createStudent(user.user_id);
    } else if (role === "instructor") {
      await createInstructor(user.user_id);
    }

    await createUserSession(user.user_id);
  } catch (err) {
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') throw err;
    return { error: "Unable to create account." };
  }

  const next = formData.get("next") as string;
  if (next && next.startsWith("/")) {
    redirect(next);
  }

  redirect("/");
}

