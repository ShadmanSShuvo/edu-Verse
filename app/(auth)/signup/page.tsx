import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { SignUpForm } from "./signup-form";

export default async function SignUpPage() {
  const session = await getSession();
  if (session) redirect("/profile"); // Guard: Redirect already logged-in users

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUpForm />
    </div>
  );
}
