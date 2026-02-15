"use client";

import { SiteConfig } from "@/types";
import { SearchModal } from "./SearchModal";

interface HeroProps {
  config: SiteConfig;
}

export function Hero({ config }: HeroProps) {
  const hero = config.hero || {
    title: "Como podemos ajudar?",
    subtitle: "",
    background: "color" as const,
    backgroundColor: "#4F46E5",
    backgroundImage: "",
    textColor: "#FFFFFF",
  };

  const bgStyle: React.CSSProperties =
    hero.background === "image" && hero.backgroundImage
      ? {
          backgroundImage: `url(${hero.backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {
          backgroundColor: hero.backgroundColor,
        };

  return (
    <section className="relative" style={bgStyle}>
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-16 md:py-24 text-center">
        <h1
          className="text-3xl md:text-5xl font-bold mb-3"
          style={{ color: hero.textColor }}
        >
          {hero.title}
        </h1>
        {hero.subtitle && (
          <p
            className="text-lg md:text-xl mb-8 opacity-80"
            style={{ color: hero.textColor }}
          >
            {hero.subtitle}
          </p>
        )}
        <div className="max-w-xl mx-auto">
          <SearchModal variant="hero" />
        </div>
      </div>
    </section>
  );
}
