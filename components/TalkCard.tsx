import Link from "next/link";
import SpeakerAvatar from "./SpeakerAvatar";

interface TalkCardProps {
  slug: string;
  speaker: string;
  title: string;
  tagline: string;
  insightCount: number;
}

export default function TalkCard({ slug, speaker, title, tagline, insightCount }: TalkCardProps) {
  return (
    <Link href={`/talks/${slug}`} className="group block">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-md hover:border-brand-200 transition-all duration-200 h-full flex flex-col">
        <div className="flex items-start gap-4 mb-4">
          <SpeakerAvatar slug={slug} speaker={speaker} size="sm" />
          <div>
            <p className="font-semibold text-stone-800 leading-tight">{speaker}</p>
            <p className="text-sm text-stone-400 mt-0.5">{insightCount} Erkenntnisse</p>
          </div>
        </div>
        <h3 className="font-semibold text-stone-700 text-base mb-2 group-hover:text-stone-900 transition-colors">
          {title}
        </h3>
        <p className="text-stone-500 text-sm leading-relaxed flex-1">{tagline}</p>
        <div className="mt-4 flex items-center text-stone-600 text-sm font-medium">
          Erkenntnisse lesen
          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
