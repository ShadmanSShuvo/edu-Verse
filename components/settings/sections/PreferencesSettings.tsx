"use client";

import { useEffect, useState } from "react";
import { Settings, MoonStar, Sun, Monitor, Bell } from "lucide-react";
import { useTheme } from "../../theme-provider";
import { cn } from "@/lib/utils";
import { updatePreferencesAction } from "@/app/(main)/settings/actions";
import { useActionState, useRef } from "react";
import { stopProgress } from "@/components/top-loader";

interface PreferencesSettingsProps {
  settings: {
    theme: string;
    notifications_enabled: boolean;
    language: string;
  };
}

interface ActionState {
  error?: string;
  success?: string;
}

const themeOptions = [
  { value: "light", label: "Light", icon: Sun, description: "Classic bright appearance" },
  { value: "dark", label: "Dark", icon: MoonStar, description: "Easier on eyes in low light" },
  { value: "system", label: "System", icon: Monitor, description: "Matches system preferences" }
];

export default function PreferencesSettings({ settings }: PreferencesSettingsProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(updatePreferencesAction, null);
  const wasPending = useRef(false);

  // Sync back to nex-theme but prioritize existing theme state.
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (wasPending.current && !isPending) {
      stopProgress();
    }
    wasPending.current = isPending;
  }, [isPending]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-2">
        <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">App Preferences</h2>
      </div>

      <div className="space-y-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900 shadow-xl overflow-hidden">
        <form action={formAction} className="space-y-8">
          <input type="hidden" name="theme" value={theme || "system"} />
          <input type="hidden" name="language" value={settings.language || "en"} />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Appearance</h3>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-3">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isActive = mounted && theme === option.value;
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value as any)}
                    className={cn(
                      "group flex flex-col items-start gap-4 rounded-xl border p-4 text-left transition-all relative overflow-hidden",
                      isActive 
                        ? "border-violet-600 bg-violet-50/50 shadow-md ring-1 ring-violet-500 dark:bg-violet-900/10" 
                        : "border-gray-100 bg-gray-50/50 hover:bg-gray-100/50 dark:border-white/5 dark:bg-white/5"
                    )}
                  >
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                      isActive ? "bg-violet-600 text-white" : "bg-white text-gray-400 dark:bg-slate-800"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="relative">
                      <span className={cn(
                         "block font-bold",
                         isActive ? "text-violet-900 dark:text-violet-400" : "text-gray-900 dark:text-white"
                      )}>{option.label}</span>
                      <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">{option.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 dark:border-white/5">
            <div className="flex items-center gap-2 pb-4">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Notifications</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-white/5 dark:bg-white/5 transition hover:bg-gray-100/50 dark:hover:bg-white/10">
                 <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">Email Notifications</p>
                      <p className="text-xs text-gray-500">Receive alerts about your course activity via email.</p>
                    </div>
                 </div>
                 <div className="relative">
                    <input 
                      type="checkbox" 
                      name="notifications_enabled" 
                      defaultChecked={settings.notifications_enabled}
                      className="peer h-6 w-11 cursor-pointer appearance-none rounded-full bg-gray-200 transition-colors checked:bg-emerald-500"
                    />
                    <div className="pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5 shadow-sm" />
                 </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
            {state?.error && <p className="text-sm font-medium text-red-500 mt-2">{state.error}</p>}
            {state?.success && <p className="text-sm font-medium text-emerald-500 mt-2">{state.success}</p>}
            <button
               type="submit"
               disabled={isPending}
               className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-violet-700 disabled:opacity-50 transition-all hover:-translate-y-0.5"
            >
               {isPending ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
