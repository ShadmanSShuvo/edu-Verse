"use client";

import { Mail, Clock, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface AccountSettingsProps {
  user: {
    email: string;
    created_at: string;
  };
}

export default function AccountSettings({ user }: AccountSettingsProps) {
  const joinedDate = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-2">
        <Mail className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Account Information</h2>
      </div>

      <div className="space-y-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="space-y-6 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="email">Primary Email Address</Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors" />
              <Input
                id="email"
                defaultValue={user.email}
                disabled
                className="pl-10 bg-gray-50/50 cursor-not-allowed border-gray-100 dark:border-white/10 dark:bg-white/5"
              />
            </div>
            <p className="text-xs text-gray-400 italic">Email cannot be changed directly. Contact support for assistance.</p>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/30 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Account Data Registration</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Successfully registered on <span className="font-semibold text-blue-600 dark:text-blue-400">{joinedDate}</span></p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 dark:border-white/5">
          <div className="rounded-xl border border-red-100 bg-red-50/30 p-6 dark:border-red-900/10 dark:bg-red-950/20">
             <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/50">
                   <ShieldAlert className="h-5 w-5" />
                </div>
                <div className="flex-1">
                   <h3 className="text-sm font-bold text-red-900 dark:text-red-400">Identity Protection</h3>
                   <p className="mt-1 text-sm text-red-800/80 dark:text-red-400/80 leading-relaxed">
                     Protecting your email helps prevent unauthorized access. Always use complex passwords and monitor for suspicious activities.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
