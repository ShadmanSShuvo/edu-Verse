import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { SignInForm } from "./signin-form";

export default async function SignInPage() {
  const session = await getSession();
  if (session) redirect("/profile"); // Guard: Redirect already logged-in users

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignInForm />
    </div>
  );
}
