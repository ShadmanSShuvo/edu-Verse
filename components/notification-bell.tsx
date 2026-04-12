"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";

type Notification = {
    notification_id: number;
    message: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
};

export function NotificationBell({ initial }: { initial: Notification[] }) {
    const [notifications, setNotifications] = useState<Notification[]>(initial);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const unread = notifications.filter((n) => !n.is_read).length;

    // Close on outside click
    useEffect(() => {
        function handle(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, []);

    async function markAll() {
        await fetch("/api/notifications/mark-read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ all: true }),
        });
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }

    async function markOne(id: number) {
        await fetch("/api/notifications/mark-read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        setNotifications((prev) =>
            prev.map((n) => (n.notification_id === id ? { ...n, is_read: true } : n))
        );
    }

    return (
        <div ref={ref} className="relative">
            <button
                id="notification-bell-btn"
                aria-label="Notifications"
                onClick={() => setOpen((o) => !o)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
                <Bell className="h-[18px] w-[18px]" />
                {unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white">
                        {unread > 9 ? "9+" : unread}
                    </span>
                )}
            </button>

            {open && (
                <div
                    className="absolute -right-12 sm:right-0 top-11 z-[200] w-[280px] sm:w-80 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 dark:border-white/10 dark:bg-slate-900"
                    role="menu"
                    aria-label="Notifications panel"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-white/10">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Notifications</p>
                        {unread > 0 && (
                            <button
                                onClick={markAll}
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-10 text-center">
                                <Bell className="h-8 w-8 text-gray-200 dark:text-gray-600" />
                                <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
                                    No notifications yet
                                </p>
                            </div>
                        ) : (
                            notifications.map((n) => {
                                const content = (
                                    <div
                                        className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition hover:bg-gray-50 ${!n.is_read ? "bg-indigo-50/50" : ""
                                            }`}
                                        onClick={() => {
                                            if (!n.is_read) markOne(n.notification_id);
                                        }}
                                    >
                                        {/* Dot */}
                                        <span
                                            className={`mt-1.5 flex h-2 w-2 flex-shrink-0 rounded-full ${!n.is_read ? "bg-indigo-500" : "bg-transparent"
                                                }`}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs leading-snug text-gray-800 dark:text-gray-200">
                                                {n.message}
                                            </p>
                                            <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">
                                                {new Date(n.created_at).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "numeric",
                                                    minute: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                );

                                return n.link ? (
                                    <Link
                                        key={n.notification_id}
                                        href={n.link}
                                        onClick={() => {
                                            if (!n.is_read) markOne(n.notification_id);
                                            setOpen(false);
                                        }}
                                        className="block"
                                    >
                                        {content}
                                    </Link>
                                ) : (
                                    <div key={n.notification_id}>{content}</div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
