import { Navbar } from "@/components/navbar";

// Main app group layout — renders the Navbar once for every route in (main)
// Sign-in / sign-up live in the (auth) group and never see this layout.
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
