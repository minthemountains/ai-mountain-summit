"use client";

import { useState } from "react";
import ChatInterface from "./ChatInterface";

export default function ChatDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-brand-400 hover:bg-brand-700 text-stone-900 rounded-full shadow-lg w-14 h-14 flex items-center justify-center transition-all z-40 group"
        aria-label="KI befragen"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:w-[420px] h-[70vh] sm:h-[560px] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
              <div>
                <p className="font-semibold text-stone-800">Vorträge befragen</p>
                <p className="text-xs text-stone-400">KI-gestützt · Alle Keynotes</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-stone-400 hover:text-stone-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <ChatInterface />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
