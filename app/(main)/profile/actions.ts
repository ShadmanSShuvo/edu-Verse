"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteSession, getSession } from "@/lib/session";
import { updateInstructorBio } from "@/db/instructor";
import { updateUserPhone, updateUserName } from "@/db/users";

export async function signOut() {
  await deleteSession();
  redirect("/");
}

export async function updateBioAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/signin");

  const bio = formData.get("bio") as string;
  const instructorId = Number(formData.get("instructor_id"));

  if (!bio || !instructorId) return;

  await updateInstructorBio(instructorId, bio.trim());
  revalidatePath("/profile");
}

export async function updateProfileAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/signin");

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;

  if (name?.trim()) {
    await updateUserName(session.user_id, name.trim());
  }
  if (phone !== undefined) {
    await updateUserPhone(session.user_id, phone.trim());
  }
  revalidatePath("/profile");
}
