interface QuoteBlockProps {
  quote: string;
  speaker: string;
}

export default function QuoteBlock({ quote, speaker }: QuoteBlockProps) {
  return (
    <figure className="relative pl-6 border-l-4 border-brand-400 my-6">
      <blockquote className="text-stone-600 text-lg italic leading-relaxed">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-2 text-stone-400 text-sm">— {speaker}</figcaption>
    </figure>
  );
}
