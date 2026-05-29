"use client";

import { useState } from "react";

interface SpeakerAvatarProps {
  slug: string;
  speaker: string;
  size?: "sm" | "lg";
}

export default function SpeakerAvatar({ slug, speaker, size = "sm" }: SpeakerAvatarProps) {
  const [error, setError] = useState(false);

  const initials = speaker
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const dim = size === "lg" ? "w-16 h-16 text-lg font-bold" : "w-12 h-12 text-sm font-semibold";

  if (error) {
    return (
      <div className={`${dim} rounded-full bg-brand-100 flex items-center justify-center text-stone-700 flex-shrink-0`}>
        {initials}
      </div>
    );
  }

  return (
    <div className={`${dim} rounded-full bg-brand-100 flex-shrink-0 overflow-hidden`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/speakers/${slug}.jpg`}
        alt={speaker}
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}
