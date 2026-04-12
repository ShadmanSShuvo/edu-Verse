import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getInstructorByUserId } from "@/db/instructor";
import { getUserById } from "@/db/users";
import { getUserSettings } from "@/db/user_settings";
import SettingsLayout from "@/components/settings/SettingsLayout";

import { Footer } from "@/components/footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/signin");
    return null;
  }

  // Fetch full details
  const [user, instructor, settings] = await Promise.all([
    getUserById(session.user_id),
    getInstructorByUserId(session.user_id),
    getUserSettings(session.user_id)
  ]);

  if (!user) {
    redirect("/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">

      <div className="mx-auto max-w-7xl">
        <SettingsLayout user={user} instructor={instructor} settings={settings} />
      </div>

      <ScrollReveal delay={0.1}>
        <Footer />
      </ScrollReveal>
    </div>
  );
}
