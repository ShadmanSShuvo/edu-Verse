"use client";

import { useState } from "react";
import { User, ShieldCheck, Settings as SettingsIcon, Mail, GraduationCap, ChevronRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ProfileSettings from "./sections/ProfileSettings";
import AccountSettings from "./sections/AccountSettings";
import SecuritySettings from "./sections/SecuritySettings";
import PreferencesSettings from "./sections/PreferencesSettings";
import InstructorSettings from "./sections/InstructorSettings";
import { motion, AnimatePresence } from "framer-motion";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account", icon: Mail },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "preferences", label: "Preferences", icon: SettingsIcon },
];

interface SettingsLayoutProps {
  user: any;
  instructor: any;
  settings: any;
}

export default function SettingsLayout({ user, instructor, settings }: SettingsLayoutProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const displayTabs = instructor 
    ? [...tabs, { id: "instructor", label: "Teaching Settings", icon: GraduationCap }]
    : tabs;

  const ActiveComponent = () => {
    switch (activeTab) {
      case "profile": return <ProfileSettings user={user} instructor={instructor} />;
      case "account": return <AccountSettings user={user} />;
      case "security": return <SecuritySettings />;
      case "preferences": return <PreferencesSettings settings={settings} />;
      case "instructor": return <InstructorSettings instructor={instructor} />;
      default: return <ProfileSettings user={user} instructor={instructor} />;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col lg:flex-row">
      {/* Mobile Header Toggle */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-white p-4 dark:border-white/5 dark:bg-slate-950 lg:hidden">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h1>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out dark:bg-slate-950 dark:border-white/5 lg:relative lg:translate-x-0 lg:z-0 lg:flex-shrink-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          <div className="mb-10 hidden lg:block">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your account and app preferences</p>
          </div>

          <nav className="space-y-1">
            {displayTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-violet-600 text-white shadow-xl shadow-violet-200 dark:shadow-none" 
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn(
                      "h-5 w-5 transition-transform group-hover:scale-110",
                      isActive ? "text-white" : "text-gray-400 dark:text-gray-500"
                    )} />
                    {tab.label}
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 text-white/50" />}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-100 dark:border-white/5">
             <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Need help?</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                  Have questions about your settings or security?
                </p>
                <button className="text-xs font-bold text-violet-600 hover:text-violet-700">Contact Support →</button>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6 dark:bg-black/20 lg:p-10">
        <div className="mx-auto max-w-4xl">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 15 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -15 }}
               transition={{ duration: 0.25, ease: "easeInOut" }}
             >
                <ActiveComponent />
             </motion.div>
           </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
