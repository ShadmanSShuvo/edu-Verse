import { z } from "zod";

export const ProfileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  phone: z.string().max(20).optional(),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url("Invalid avatar URL").optional().or(z.literal(""))
});

export const SecurityUpdateSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string().min(8, "New password must be at least 8 characters").max(100),
  confirm_password: z.string()
}).refine(data => data.new_password === data.confirm_password, {
  message: "Passwords mismatch",
  path: ["confirm_password"]
});

export const PreferencesUpdateSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  notifications_enabled: z.boolean().optional(),
  language: z.string().max(10).optional()
});
