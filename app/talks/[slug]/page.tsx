import { notFound } from "next/navigation";
import Link from "next/link";
import QuoteBlock from "@/components/QuoteBlock";
import ChatInterface from "@/components/ChatInterface";
import talksData from "@/data/talks.json";

interface Talk {
  slug: string;
  speaker: string;
  title: string;
  tagline: string;
  summary: string;
  insights: string[];
  quotes: string[];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const talks = talksData as Talk[];
  return talks.map((t) => ({ slug: t.slug }));
}

export default async function TalkPage({ params }: PageProps) {
  const { slug } = await params;
  const talks = talksData as Talk[];
  const talk = talks.find((t) => t.slug === slug);

  if (!talk) notFound();

  const initials = talk.speaker
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-stone-400 hover:text-stone-600 text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Alle Keynotes
        </Link>
        <a
          href="#chat"
          className="inline-flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-medium px-3 py-1.5 rounded-full border border-amber-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          KI befragen
        </a>
      </div>

      {/* Speaker header */}
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-lg flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-stone-500 text-sm">Speaker / Referent</p>
            <p className="font-semibold text-stone-800 text-lg">{talk.speaker}</p>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-800 leading-snug mb-3">
          {talk.title}
        </h1>
        <p className="text-amber-700 font-medium text-lg">{talk.tagline}</p>
      </header>

      {/* Summary */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-stone-700 mb-3">Zusammenfassung</h2>
        <p className="text-stone-600 leading-relaxed">{talk.summary}</p>
      </section>

      {/* Key Insights */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-stone-700 mb-4">Wichtigste Erkenntnisse</h2>
        <ul className="space-y-3">
          {talk.insights.map((insight, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-stone-700 leading-relaxed">{insight}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Quotes */}
      {talk.quotes.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-stone-700 mb-4">Bemerkenswerte Zitate</h2>
          {talk.quotes.map((quote, i) => (
            <QuoteBlock key={i} quote={quote} speaker={talk.speaker} />
          ))}
        </section>
      )}

      {/* Per-talk chat */}
      <section id="chat">
        <h2 className="text-lg font-semibold text-stone-700 mb-4">Zum Vortrag befragen</h2>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm h-[400px] flex flex-col">
          <ChatInterface talkSlug={slug} />
        </div>
      </section>
    </div>
  );
}
