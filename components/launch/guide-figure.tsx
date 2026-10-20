import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface GuideFigureProps {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  /** Tall screenshots sit in a keyboard-scrollable frame instead of stretching the page. */
  scrollable?: boolean;
  className?: string;
}

export function GuideFigure({ src, width, height, alt, caption, scrollable = false, className }: GuideFigureProps) {
  const image = (
    <Image
      src={src}
      width={width}
      height={height}
      alt={alt}
      sizes="(min-width: 1280px) 640px, (min-width: 768px) 50vw, 100vw"
      className="h-auto w-full"
    />
  );

  return (
    <figure className={cn("flex flex-col gap-2", className)}>
      <div className="overflow-hidden rounded-lg border bg-card shadow-xs">
        {scrollable ? (
          <div
            role="region"
            tabIndex={0}
            aria-label={`${caption}. Scroll to see the whole page.`}
            className="max-h-[28rem] overflow-y-auto focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {image}
          </div>
        ) : (
          image
        )}
      </div>
      <figcaption className="text-sm text-muted-foreground">
        {caption}
        {scrollable ? " Scroll inside the frame to see the full page." : null}
      </figcaption>
    </figure>
  );
}

/** A numbered, top-to-bottom description of what appears on a screen, for readers who cannot see it. */
export function SeenFromTop({ title = "What you see, from top to bottom", items }: { title?: string; items: ReactNode[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-semibold">{title}</h4>
      <ol className="m-0 flex list-none flex-col gap-2 p-0 text-sm leading-relaxed">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <span aria-hidden className="w-5 shrink-0 font-semibold text-primary tabular-nums">
              {index + 1}
            </span>
            <span className="text-pretty">{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
