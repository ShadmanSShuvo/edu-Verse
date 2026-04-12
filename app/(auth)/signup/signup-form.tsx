"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { stopProgress } from "@/components/top-loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams } from "next/navigation";
import { signUp } from "./actions";
import { Loader2 } from "lucide-react";

export function SignUpForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [state, formAction, isPending] = useActionState(signUp, null);
  const [role, setRole] = useState<string>("student");
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !isPending) {
      stopProgress();
    }
    wasPending.current = isPending;
  }, [isPending]);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          {next && <input type="hidden" name="next" value={next} />}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" type="text" required disabled={isPending} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="role">Role</Label>
            <Select 
              name="role" 
              defaultValue="student"
              onValueChange={(value) => setRole(value)}
              disabled={isPending}
              required
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {role === "instructor" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="secretKey">Instructor Secret Key</Label>
              <Input id="secretKey" name="secretKey" type="password" placeholder="Enter key to register as instructor" required disabled={isPending} />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required disabled={isPending} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required disabled={isPending} />
          </div>
          {state?.error && (
            <p className="text-sm text-red-500 font-medium">{state.error}</p>
          )}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
