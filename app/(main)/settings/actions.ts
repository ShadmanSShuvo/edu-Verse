"use server";

import { revalidatePath } from "next/cache";
import { getSession, deleteSession } from "@/lib/session";
import { updateUserProfile, updateUserPassword, getUserByEmail } from "@/db/users";
import { updateUserSettings } from "@/db/user_settings";
import { updateInstructorBio } from "@/db/instructor";
import { hashPassword, comparePasswords, generateSalt } from "@/lib/password";
import { ProfileUpdateSchema, SecurityUpdateSchema, PreferencesUpdateSchema } from "@/lib/validators/settings";
import { deleteSessionsByUserId } from "@/db/sessions";

export async function updateProfileAction(state: any, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const name = formData.get("name");
  const phone = formData.get("phone");
  const bio = formData.get("bio");
  const avatarFile = formData.get("avatar_file") as File | null;
  let newAvatarUrl: string | undefined = undefined;

  if (avatarFile && avatarFile.size > 0) {
    try {
      const { uploadAvatar } = await import("@/lib/storage");
      newAvatarUrl = await uploadAvatar(avatarFile, session.user_id);
    } catch (e: any) {
      return { error: e.message };
    }
  }

  const data: any = {
    name: name === null ? undefined : (name as string),
    phone: phone === null ? undefined : (phone as string),
    bio: bio === null ? undefined : (bio as string),
  };

  if (newAvatarUrl !== undefined) {
    data.avatar_url = newAvatarUrl;
  }

  const validated = ProfileUpdateSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const instructorId = formData.get("instructor_id") ? Number(formData.get("instructor_id")) : null;

  try {
    await updateUserProfile(session.user_id, {
      name: validated.data.name,
      phone_no: validated.data.phone,
      bio: validated.data.bio,
      avatar_url: validated.data.avatar_url
    });

    if (validated.data.bio !== undefined && instructorId) {
      await updateInstructorBio(instructorId, validated.data.bio.trim());
    }
    
    revalidatePath("/settings");
    revalidatePath("/profile");
    return { success: "Profile updated successfully" };
  } catch (error) {
    return { error: "Failed to update profile" };
  }
}

export async function updateSecurityAction(state: any, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const rawData = Object.fromEntries(formData.entries());
  const validated = SecurityUpdateSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  try {
    const user = await getUserByEmail(session.email);
    if (!user) return { error: "User not found" };

    const isCorrect = await comparePasswords({
      password: validated.data.current_password,
      salt: user.salt,
      hashedPassword: user.password
    });

    if (!isCorrect) {
      return { error: "Current password is incorrect" };
    }

    const newSalt = generateSalt();
    const newHashedPassword = await hashPassword(validated.data.new_password, newSalt);

    await updateUserPassword(session.user_id, newHashedPassword, newSalt);

    return { success: "Password updated successfully" };
  } catch (error) {
    return { error: "Failed to update password" };
  }
}

export async function updatePreferencesAction(state: any, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const data = {
    theme: formData.get("theme") as string,
    notifications_enabled: formData.get("notifications_enabled") === "on",
    language: formData.get("language") as string
  };

  const validated = PreferencesUpdateSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  try {
    await updateUserSettings(session.user_id, validated.data);
    revalidatePath("/settings");
    return { success: "Preferences updated" };
  } catch (error) {
    return { error: "Failed to update preferences" };
  }
}

export async function logoutAllDevicesAction() {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  try {
    await deleteSessionsByUserId(session.user_id);
    await deleteSession();
    return { success: "Logged out from all devices" };
  } catch (error) {
    return { error: "Failed to logout devices" };
  }
}
