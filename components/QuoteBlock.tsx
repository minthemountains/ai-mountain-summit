"use client";

import { useState } from "react";

interface QuoteBlockProps {
  quote: string;
  speaker: string;
  talkSlug?: string;
}

export default function QuoteBlock({ quote, speaker, talkSlug }: QuoteBlockProps) {
  const [copied, setCopied] = useState(false);

  const talkUrl = talkSlug
    ? `https://mountainsummit.ai/talks/${talkSlug}`
    : "https://mountainsummit.ai";

  const shareText = `"${quote}"\n\n— ${speaker}\n\nAI Mountain Summit 2026, Laax`;

  function handleCopy() {
    navigator.clipboard.writeText(`${shareText}\n${talkUrl}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleLinkedIn() {
    const linkedInUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(talkUrl)}&title=${encodeURIComponent(`AI Mountain Summit – ${speaker}`)}&summary=${encodeURIComponent(shareText)}&source=mountainsummit.ai`;
    window.open(linkedInUrl, "_blank", "width=600,height=600");
  }

  return (
    <figure className="relative pl-6 border-l-4 border-brand-400 my-6 group">
      <blockquote className="text-stone-600 text-lg italic leading-relaxed">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-2 text-stone-400 text-sm">— {speaker}</figcaption>

      {/* Share actions — visible on hover or always on touch */}
      <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {/* Copy to clipboard */}
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-full transition-colors"
          title="Zitat kopieren"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-600">Kopiert!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Kopieren
            </>
          )}
        </button>

        {/* LinkedIn share */}
        <button
          onClick={handleLinkedIn}
          className="inline-flex items-center gap-1.5 text-xs text-white bg-[#0A66C2] hover:bg-[#004182] px-3 py-1.5 rounded-full transition-colors"
          title="Auf LinkedIn teilen"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          LinkedIn
        </button>
      </div>
    </figure>
  );
}
