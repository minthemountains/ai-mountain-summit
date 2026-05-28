interface InsightCardProps {
  insight: string;
  speaker: string;
  talkSlug: string;
}

export default function InsightCard({ insight, speaker }: InsightCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-100 flex gap-4">
      <div className="w-1.5 rounded-full bg-amber-400 flex-shrink-0" />
      <div>
        <p className="text-stone-700 leading-relaxed">{insight}</p>
        <p className="text-stone-400 text-sm mt-2">— {speaker}</p>
      </div>
    </div>
  );
}
