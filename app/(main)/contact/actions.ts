"use server";

import { createContactMessage } from "@/db/contact";
import { revalidatePath } from "next/cache";

export async function submitContactForm(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  if (!name || !email || !message) {
    return { error: "All fields are required." };
  }

  try {
    await createContactMessage(name, email, message);
    revalidatePath("/contact");
    return { success: true };
  } catch (err) {
    console.error("Contact Form Error:", err);
    return { error: "Failed to send message. Please try again." };
  }
}
