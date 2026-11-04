"use client";

import Image from "next/image";
import { useState } from "react";

type GalleryImage = { id: number; url: string; alt: string; caption: string };

export function ProductGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) return null;

  return (
    <div>
      <div className="group relative">
        <div className="zoom-frame relative aspect-[4/5] w-full">
          {images.map((image, index) => (
            <Image
              key={image.id}
              src={image.url}
              alt={image.alt || title}
              fill
              sizes="(min-width: 1024px) 52vw, 92vw"
              priority={index === 0}
              className={`object-cover transition-opacity duration-700 ${
                index === active ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => setActive((index) => (index - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-bone/85 px-3 py-2 text-sm text-ink-2 opacity-0 backdrop-blur-sm transition-all duration-300 hover:text-ochre group-hover:opacity-100"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => setActive((index) => (index + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-bone/85 px-3 py-2 text-sm text-ink-2 opacity-0 backdrop-blur-sm transition-all duration-300 hover:text-ochre group-hover:opacity-100"
            >
              →
            </button>
            <span className="absolute bottom-3 right-3 bg-ink/70 px-2.5 py-1 text-[10px] tracking-[0.18em] text-bone tabular-nums">
              {active + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-3">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1}: ${image.caption}`}
              className={`relative h-20 w-16 overflow-hidden border transition-all duration-300 ${
                index === active
                  ? "border-ochre opacity-100"
                  : "border-transparent opacity-55 hover:opacity-100"
              }`}
            >
              <Image src={image.url} alt={image.alt} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-ash">{current.caption}</p>
    </div>
  );
}
