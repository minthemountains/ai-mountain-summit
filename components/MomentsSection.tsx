"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

const MomentsUploadModal = dynamic(() => import("./MomentsUploadModal"), { ssr: false });

interface Moment {
  id: string;
  photoUrl: string;
  name: string;
  caption: string;
  approved: boolean;
  uploadedAt: string;
}

export default function MomentsSection() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/moments")
      .then((r) => r.json())
      .then((data) => {
        setMoments(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  function handleSuccess() {
    setShowModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  }

  return (
    <section className="mt-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-semibold text-stone-700">Summit Moments</h2>
          <p className="text-stone-400 text-sm mt-0.5">Eure Erinnerungen vom AI Mountain Summit 2026</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-brand-400 hover:bg-brand-700 text-stone-900 font-semibold text-sm px-4 py-2.5 rounded-full transition-colors flex-shrink-0"
          style={{ minHeight: "44px" }}
        >
          <span>📸</span>
          <span className="hidden sm:inline">Moment teilen</span>
          <span className="sm:hidden">Teilen</span>
        </button>
      </div>

      {/* Success banner */}
      {showSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl px-4 py-3 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Danke! Dein Foto erscheint nach kurzer Prüfung in der Galerie.</span>
        </div>
      )}

      {/* Gallery */}
      {!loaded ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square bg-stone-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : moments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm py-12 px-6 text-center">
          <div className="text-5xl mb-3">🏔️</div>
          <p className="font-semibold text-stone-700 mb-1">Sei der Erste!</p>
          <p className="text-stone-400 text-sm max-w-xs mx-auto">
            Teile deinen Summit-Moment und starte die Galerie.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 inline-flex items-center gap-2 bg-brand-400 hover:bg-brand-700 text-stone-900 font-semibold text-sm px-5 py-2.5 rounded-full transition-colors"
          >
            <span>📸</span>
            Jetzt teilen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {moments.map((m) => (
            <MomentCard key={m.id} moment={m} />
          ))}
        </div>
      )}

      {/* Upload modal */}
      {showModal && (
        <MomentsUploadModal
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </section>
  );
}

function MomentCard({ moment }: { moment: Moment }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group relative bg-stone-100 rounded-2xl overflow-hidden aspect-square">
      {imgError ? (
        <div className="w-full h-full flex items-center justify-center text-3xl">🏔️</div>
      ) : (
        <Image
          src={moment.photoUrl}
          alt={moment.caption || "Summit Moment"}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImgError(true)}
          unoptimized
        />
      )}

      {/* Hover overlay with name + caption */}
      {(moment.name || moment.caption) && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
          {moment.name && (
            <p className="text-white font-semibold text-sm leading-tight">{moment.name}</p>
          )}
          {moment.caption && (
            <p className="text-white/80 text-xs mt-0.5 line-clamp-2">{moment.caption}</p>
          )}
        </div>
      )}
    </div>
  );
}
