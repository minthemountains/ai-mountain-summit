interface InsightCardProps {
  insight: string;
  speaker: string;
  role?: string;
  talkSlug: string;
}

export default function InsightCard({ insight, speaker, role }: InsightCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-100 flex gap-4">
      <div className="w-1.5 rounded-full bg-brand-400 flex-shrink-0" />
      <div>
        <p className="text-stone-700 leading-relaxed">{insight}</p>
        <p className="text-stone-400 text-sm mt-2">
          — {speaker}
          {role && <span className="text-stone-300"> · {role}</span>}
        </p>
      </div>
    </div>
  );
}
