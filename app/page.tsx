import TalkCard from "@/components/TalkCard";
import InsightCard from "@/components/InsightCard";
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

export default function Home() {
  const talks = talksData as Talk[];

  const featuredInsights: Array<{ insight: string; speaker: string; talkSlug: string }> = [];
  for (const talk of talks) {
    const picked = talk.insights.slice(0, 1);
    for (const insight of picked) {
      featuredInsights.push({ insight, speaker: talk.speaker, talkSlug: talk.slug });
    }
    if (featuredInsights.length >= 6) break;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 pb-24">
      {/* Header */}
      <header className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-amber-200">
          <span>🏔️</span>
          <span>Laax, Schweiz · 2026</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-stone-800 leading-tight mb-4">
          AI Mountain Summit
        </h1>
        <p className="text-stone-500 text-lg max-w-lg mx-auto leading-relaxed">
          Die wichtigsten Erkenntnisse jeder Keynote – durchsuchbar, lesbar und mit KI erkundbar.
        </p>
      </header>

      {talks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-stone-100 shadow-sm">
          <div className="text-5xl mb-4">📄</div>
          <h2 className="text-xl font-semibold text-stone-700 mb-2">Noch keine Vorträge verarbeitet</h2>
          <p className="text-stone-400 text-sm max-w-sm mx-auto">
            Transkript-Dateien <code className="bg-stone-100 px-1 rounded">.txt</code> in{" "}
            <code className="bg-stone-100 px-1 rounded">transcripts/</code> ablegen und{" "}
            <code className="bg-stone-100 px-1 rounded">npm run process</code> ausführen
          </p>
        </div>
      ) : (
        <>
          {/* Featured Insights */}
          {featuredInsights.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-stone-700 mb-4">
                Top-Erkenntnisse
              </h2>
              <div className="space-y-3">
                {featuredInsights.map((item, i) => (
                  <InsightCard
                    key={i}
                    insight={item.insight}
                    speaker={item.speaker}
                    talkSlug={item.talkSlug}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Talks Grid */}
          <section>
            <h2 className="text-xl font-semibold text-stone-700 mb-4">
              Alle Keynotes
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {talks.map((talk) => (
                <TalkCard
                  key={talk.slug}
                  slug={talk.slug}
                  speaker={talk.speaker}
                  title={talk.title}
                  tagline={talk.tagline}
                  insightCount={talk.insights.length}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="mt-16 text-center text-stone-400 text-xs">
        <p>AI Mountain Summit 2026 · Laax, Schweiz · Powered by Claude</p>
      </footer>
    </main>
  );
}
