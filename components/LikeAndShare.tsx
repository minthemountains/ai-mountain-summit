"use client";

import { useState, useEffect } from "react";

const SHARE_URL = "https://mountainsummit.ai";
const SHARE_TEXT =
  "Just explored the AI Mountain Summit 2026 keynote insights — summaries, key takeaways, and an AI you can query about every talk. Really well done! 🏔️";

export default function LikeAndShare() {
  const [count, setCount] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Check if already liked in this session
    if (typeof window !== "undefined") {
      setLiked(localStorage.getItem("ams_liked") === "1");
    }
    // Fetch current count
    fetch("/api/likes")
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => setCount(null));
  }, []);

  async function handleLike() {
    if (liked) return;
    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);

    try {
      const res = await fetch("/api/likes", { method: "POST" });
      const data = await res.json();
      setCount(data.count);
      setLiked(true);
      localStorage.setItem("ams_liked", "1");
    } catch {
      // optimistic update anyway
      setCount((c) => (c ?? 0) + 1);
      setLiked(true);
      localStorage.setItem("ams_liked", "1");
    }
  }

  function handleLinkedIn() {
    const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(SHARE_URL)}&title=${encodeURIComponent("AI Mountain Summit 2026 — Key Insights")}&summary=${encodeURIComponent(SHARE_TEXT)}&source=mountainsummit.ai`;
    window.open(url, "_blank", "width=600,height=600");
  }

  return (
    <div className="bg-white border border-stone-100 rounded-2xl shadow-sm px-5 py-4 mb-10 flex flex-col sm:flex-row sm:items-center gap-4">
      {/* CTA text */}
      <p className="text-stone-600 text-sm leading-relaxed flex-1">
        <span className="font-semibold text-stone-800">Gefällt dir das Tool?</span>{" "}
        Drück den Like-Button und teile es gerne mit deiner Community.
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Like button */}
        <button
          onClick={handleLike}
          disabled={liked}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
            liked
              ? "bg-red-50 border-red-200 text-red-500 cursor-default"
              : "bg-white border-stone-200 text-stone-600 hover:bg-red-50 hover:border-red-200 hover:text-red-500 active:scale-95"
          }`}
          title={liked ? "Bereits geliked" : "Liken"}
        >
          <span
            className={`text-base transition-transform ${animating ? "scale-150" : "scale-100"}`}
            style={{ display: "inline-block" }}
          >
            {liked ? "❤️" : "🤍"}
          </span>
          <span>
            {count === null ? "…" : count.toLocaleString("de-CH")}
          </span>
        </button>

        {/* LinkedIn share */}
        <button
          onClick={handleLinkedIn}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-[#0A66C2] hover:bg-[#004182] text-white transition-colors"
          title="Auf LinkedIn teilen"
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          <span className="hidden sm:inline">Teilen</span>
        </button>
      </div>
    </div>
  );
}
