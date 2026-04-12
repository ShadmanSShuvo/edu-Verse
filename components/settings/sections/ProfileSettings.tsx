"use client";

import { useState } from "react";
import { User, Phone, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction } from "@/app/(main)/settings/actions";
import { useActionState, useEffect, useRef } from "react";
import { stopProgress } from "@/components/top-loader";

interface ActionState {
  error?: string;
  success?: string;
}

interface ProfileSettingsProps {
  user: {
    name: string;
    email: string;
    user_id: number;
    phone_no?: string;
    avatar_url?: string;
    bio?: string;
  };
  instructor?: {
    instructor_id: number;
    bio: string | null;
  } | null;
}

export default function ProfileSettings({ user, instructor }: ProfileSettingsProps) {
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(updateProfileAction, null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar_url ?? "");
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !isPending) {
      stopProgress();
    }
    wasPending.current = isPending;
  }, [isPending]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-2">
        <User className="h-5 w-5 text-violet-600" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
      </div>

      <form action={formAction} className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="name"
                name="name"
                defaultValue={user.name}
                placeholder="Ex. Shadman Shuvo"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="phone"
                name="phone"
                defaultValue={user.phone_no ?? ""}
                placeholder="+880 1712-345678"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="avatar_url">Profile Picture</Label>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-white/5 border-2 border-gray-100 dark:border-white/10">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt={user.name} 
                    className="h-full w-full object-cover"
                    onError={() => {
                      setAvatarPreview("");
                    }}
                  />
                ) : (
                  <User className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <Input 
                   type="file" 
                   name="avatar_file" 
                   id="avatar_file" 
                   accept="image/*"
                   onChange={(e) => {
                     const file = e.target.files?.[0];
                     if (file) {
                       setAvatarPreview(URL.createObjectURL(file));
                     }
                   }}
                   className="cursor-pointer file:text-violet-600 file:font-semibold file:bg-violet-50 file:border-0 file:-ml-2 file:mr-4 file:py-1 file:px-3 file:rounded-md hover:file:bg-violet-100"
                />
                <p className="mt-2 text-xs text-gray-500">Upload a profile picture (max 5MB, JPG/PNG).</p>
              </div>
            </div>
          </div>
        </div>

        {instructor && (
          <div className="space-y-2">
            <Label htmlFor="bio">Instructor Bio</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input type="hidden" name="instructor_id" value={instructor.instructor_id} />
              <textarea
                id="bio"
                name="bio"
                rows={4}
                defaultValue={instructor.bio ?? ""}
                placeholder="Tell your students about yourself..."
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-10"
              />
            </div>
            <p className="text-xs text-gray-500">Your bio will be displayed to students on your profile and courses.</p>
          </div>
        )}

        {state?.error && (
            <p className="text-sm font-medium text-red-500">{state.error}</p>
        )}
        {state?.success && (
            <p className="text-sm font-medium text-emerald-500">{state.success}</p>
        )}

        <div className="flex justify-end border-t border-gray-100 pt-6 dark:border-white/5">
          <Button type="submit" disabled={isPending} className="bg-gradient-to-r from-violet-600 to-blue-600 font-bold transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0">
            {isPending ? "Updating..." : "Save Profile Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
