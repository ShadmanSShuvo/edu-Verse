"use client";

import { useActionState, useEffect, useRef } from "react";
import { stopProgress } from "@/components/top-loader";
import { Lock, Shield, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSecurityAction } from "@/app/(main)/settings/actions";

interface ActionState {
  error?: string;
  success?: string;
}

export default function SecuritySettings() {
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(updateSecurityAction, null);
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
        <Shield className="h-5 w-5 text-emerald-600" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security & Password</h2>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900 shadow-lg">
        <form action={formAction} className="space-y-6 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="current_password">Current Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="current_password"
                name="current_password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="new_password"
                name="new_password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                required
                minLength={8}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                required
                minLength={8}
              />
            </div>
          </div>

          {state?.error && (
            <p className="text-sm font-medium text-red-500">{state.error}</p>
          )}
          {state?.success && (
            <p className="text-sm font-medium text-emerald-500">{state.success}</p>
          )}

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending} className="bg-emerald-600 font-bold transition-all hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-white">
              {isPending ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>

        <div className="mt-10 border-t border-gray-100 pt-8 dark:border-white/5">
          <div className="flex items-start gap-4 rounded-xl bg-amber-50 p-4 dark:bg-amber-900/10">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-500">Two-Factor Authentication (2FA)</h3>
              <p className="mt-1 text-xs text-amber-800 dark:text-amber-400/80 leading-relaxed">
                Add an extra layer of security to your account. This feature is currently being developed and will be available soon.
              </p>
              <Button disabled variant="outline" size="sm" className="mt-3 border-amber-200 bg-white/50 text-amber-700 hover:bg-amber-100 disabled:opacity-50">
                Coming Soon
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
