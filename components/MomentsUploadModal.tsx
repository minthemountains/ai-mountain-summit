"use client";

import { useState, useRef, useCallback } from "react";
import { upload } from "@vercel/blob/client";

interface MomentsUploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

// Compress & resize client-side for faster upload (not for size limits — direct upload has none).
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1920;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height / width) * MAX); width = MAX; }
        else { width = Math.round((width / height) * MAX); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => resolve(blob ?? file),
        "image/jpeg",
        0.82
      );
    };
    img.onerror = () => resolve(file); // fallback: send original
    img.src = url;
  });
}

export default function MomentsUploadModal({ onClose, onSuccess }: MomentsUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Nur Bilddateien erlaubt");
      return;
    }
    setError("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFileChange(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileChange(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      // Step 1: compress
      setProgress(15);
      setProgressLabel("Wird komprimiert…");
      const compressed = await compressImage(file);

      // Step 2: direct upload to Vercel Blob (no serverless body limit)
      setProgress(35);
      setProgressLabel("Wird hochgeladen…");

      await upload(`moments/photos/${Date.now()}.jpg`, compressed, {
        access: "public",
        handleUploadUrl: "/api/moments/upload",
        clientPayload: JSON.stringify({ name: name.trim(), caption: caption.trim() }),
        onUploadProgress: ({ percentage }) => {
          setProgress(35 + Math.round(percentage * 0.6)); // 35→95
        },
      });

      setProgress(100);
      setProgressLabel("Fertig!");
      setTimeout(() => onSuccess(), 400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload fehlgeschlagen");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Bottom sheet on mobile, centered dialog on desktop */}
      <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4">
        <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl max-h-[92dvh] overflow-y-auto">
          {/* Handle bar (mobile) */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-stone-200" />
          </div>

          <div className="px-6 pb-8 pt-4 sm:pt-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-stone-800">Deinen Moment teilen</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors text-stone-500"
                aria-label="Schliessen"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* File picker */}
              {!preview ? (
                <div
                  className="border-2 border-dashed border-stone-200 rounded-2xl p-6 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-stone-600 font-medium text-sm">Foto auswählen</p>
                  <p className="text-stone-400 text-xs mt-1">JPEG, PNG, WebP</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleInputChange}
                  />
                </div>
              ) : (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Preview" className="w-full aspect-square object-cover rounded-2xl" />
                  <button
                    type="button"
                    onClick={() => { setFile(null); setPreview(null); }}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Dein Name <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="z.B. Michael aus Zürich"
                  maxLength={80}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                  style={{ minHeight: "44px" }}
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Caption <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Was war dein Highlight?"
                  maxLength={200}
                  rows={2}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none"
                  style={{ minHeight: "44px" }}
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{error}</p>
              )}

              {/* Progress */}
              {uploading && (
                <div className="space-y-1.5">
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-400 rounded-full transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-stone-400 text-center">{progressLabel}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!file || uploading}
                className="w-full bg-brand-400 hover:bg-brand-700 disabled:opacity-40 text-stone-900 font-semibold rounded-xl py-3.5 transition-colors flex items-center justify-center gap-2 text-sm"
                style={{ minHeight: "48px" }}
              >
                {uploading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Einen Moment…
                  </>
                ) : (
                  <><span>📸</span> Foto teilen</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
