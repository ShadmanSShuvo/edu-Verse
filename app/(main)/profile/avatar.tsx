"use client";

import React from "react";

export function Avatar({
  name,
  avatarUrl,
  size = "lg",
}: {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "lg";
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const dim = size === "lg" ? "h-20 w-20 text-2xl" : "h-10 w-10 text-sm";
  return (
    <div
      className={`${dim} relative flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-blue-600 font-bold text-white shadow-lg`}
    >
      {/* Initials fallback placed behind the image */}
      <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {initials}
      </span>
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt={name}
          className="relative z-10 h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = "0"; // Hide broken image to reveal initials
          }}
        />
      )}
    </div>
  );
}
