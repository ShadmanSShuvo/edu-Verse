"use client";

import { useActionState, useEffect, useRef } from "react";
import { stopProgress } from "@/components/top-loader";
import { GraduationCap, BookOpen, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateProfileAction } from "@/app/(main)/settings/actions";

interface InstructorSettingsProps {
  instructor: {
    instructor_id: number;
    bio: string | null;
  };
}

interface ActionState {
  error?: string;
  success?: string;
}

export default function InstructorSettings({ instructor }: InstructorSettingsProps) {
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(updateProfileAction, null);
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
        <GraduationCap className="h-5 w-5 text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Teaching Profile</h2>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
             <Label htmlFor="bio">Professional Bio</Label>
             <p className="text-xs text-gray-500 mb-2">This bio will be displayed to students on your public instructor profile.</p>
             <input type="hidden" name="instructor_id" value={instructor.instructor_id} />
             <textarea
                id="bio"
                name="bio"
                rows={6}
                defaultValue={instructor.bio ?? ""}
                placeholder="Share your expertise, background, and teaching philosophy..."
                className="flex w-full rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:focus:border-indigo-400 dark:focus:bg-slate-950"
             />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
             <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-white/5 dark:bg-white/5">
                <div className="flex items-center gap-3">
                   <BookOpen className="h-4 w-4 text-gray-400" />
                   <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Courses</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Managed in Creator Studio</p>
             </div>
             
             <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-white/5 dark:bg-white/5">
                <div className="flex items-center gap-3">
                   <Users className="h-4 w-4 text-gray-400" />
                   <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Students</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Live Data from Dashboard</p>
             </div>
          </div>

          {state?.error && (
            <p className="text-sm font-medium text-red-500">{state.error}</p>
          )}
          {state?.success && (
            <p className="text-sm font-medium text-emerald-500">{state.success}</p>
          )}

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending} className="bg-indigo-600 font-bold hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all text-white">
              {isPending ? "Updating Bio..." : "Update Teaching Profile"}
            </Button>
          </div>
        </form>

        <div className="mt-10 border-t border-gray-100 pt-8 dark:border-white/5">
           <div className="flex items-center justify-between">
              <div>
                 <h3 className="text-sm font-bold text-gray-900 dark:text-white">Instructor Payouts</h3>
                 <p className="text-xs text-gray-500">Configure your banking details for receiving course revenue.</p>
              </div>
              <Button variant="outline" size="sm" disabled className="text-xs">Setup Payouts</Button>
           </div>
        </div>
      </div>
    </div>
  );
}
