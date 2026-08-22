"use client";

import { useEffect, useRef, useState } from "react";
import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { DeckCard } from "./deck-card";

type HoveredCard = "left" | "center" | "right" | null;

/**
 * Preview kartu di hero memakai dua bahasa gerak yang berbeda:
 * - layar sentuh: parallax mengikuti arah scroll dan membuka kipas kartu;
 * - desktop: kartu tengah menyingkir ke arah berlawanan saat kartu samping
 *   di-hover, sehingga isi kartu yang dipilih tidak tertutup.
 */
export function HeroCardStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<HoveredCard>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const leftX = useTransform(scrollYProgress, [0, 0.5, 1], [42, 0, -28]);
  const leftY = useTransform(scrollYProgress, [0, 0.5, 1], [72, 0, -72]);
  const centerY = useTransform(scrollYProgress, [0, 0.5, 1], [48, -10, -92]);
  const rightX = useTransform(scrollYProgress, [0, 0.5, 1], [-42, 0, 28]);
  const rightY = useTransform(scrollYProgress, [0, 0.5, 1], [84, 8, -60]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => {
      setIsMobile(media.matches);
      if (media.matches) setHoveredCard(null);
    };

    updateViewport();
    media.addEventListener("change", updateViewport);
    return () => media.removeEventListener("change", updateViewport);
  }, []);

  const mobileMotion = isMobile && !reduceMotion;
  const desktopMotion = !isMobile && !reduceMotion;
  const sideTransition = { type: "spring" as const, stiffness: 280, damping: 22 };

  return (
    <div
      ref={containerRef}
      className="relative mx-auto flex h-72 w-full max-w-sm items-center justify-center sm:h-96"
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <m.div
          className={`pointer-events-auto relative will-change-transform ${
            hoveredCard === "left" ? "z-20" : "z-0"
          }`}
          style={mobileMotion ? { x: leftX, y: leftY } : undefined}
          animate={
            desktopMotion
              ? {
                  y:
                    hoveredCard === "left"
                      ? -14
                      : hoveredCard === "right" || hoveredCard === "center"
                        ? 4
                        : 0,
                  scale:
                    hoveredCard === "left"
                      ? 1.04
                      : hoveredCard === "right" || hoveredCard === "center"
                        ? 0.98
                        : 1,
                }
              : undefined
          }
          transition={sideTransition}
          onHoverStart={() => desktopMotion && setHoveredCard("left")}
          onHoverEnd={() => desktopMotion && setHoveredCard(null)}
        >
          <DeckCard
            theme="sky"
            kind="Talk"
            deck="Anak & Orang Tua"
            className="h-56 w-44 -translate-x-[4.5rem] -rotate-12 text-base sm:h-64 sm:w-52 sm:-translate-x-24"
          >
            Kapan terakhir kali kamu merasa bangga sama aku?
          </DeckCard>
        </m.div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <m.div
          className="pointer-events-auto will-change-transform"
          style={mobileMotion ? { y: centerY } : undefined}
          animate={
            desktopMotion
              ? {
                  x:
                    hoveredCard === "left"
                      ? 38
                      : hoveredCard === "right"
                        ? -38
                        : 0,
                  y: hoveredCard === "center" ? -16 : hoveredCard ? -24 : 0,
                  rotate:
                    hoveredCard === "left"
                      ? 4
                      : hoveredCard === "right"
                        ? -4
                        : 0,
                  scale: hoveredCard === "center" ? 1.04 : hoveredCard ? 1.02 : 1,
                }
              : undefined
          }
          transition={sideTransition}
          onHoverStart={() => desktopMotion && setHoveredCard("center")}
          onHoverEnd={() => desktopMotion && setHoveredCard(null)}
        >
          <DeckCard
            theme="pink"
            kind="Talk"
            deck="Pasangan"
            className="h-56 w-44 rotate-2 sm:h-64 sm:w-52"
          >
            Apa kebiasaan kecil aku yang kamu suka?
          </DeckCard>
        </m.div>
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <m.div
          className={`pointer-events-auto relative will-change-transform ${
            hoveredCard === "right" ? "z-20" : "z-0"
          }`}
          style={mobileMotion ? { x: rightX, y: rightY } : undefined}
          animate={
            desktopMotion
              ? {
                  y:
                    hoveredCard === "right"
                      ? -14
                      : hoveredCard === "left" || hoveredCard === "center"
                        ? 4
                        : 0,
                  scale:
                    hoveredCard === "right"
                      ? 1.04
                      : hoveredCard === "left" || hoveredCard === "center"
                        ? 0.98
                        : 1,
                }
              : undefined
          }
          transition={sideTransition}
          onHoverStart={() => desktopMotion && setHoveredCard("right")}
          onHoverEnd={() => desktopMotion && setHoveredCard(null)}
        >
          <DeckCard
            theme="amber"
            kind="Action"
            deck="Bikinan AI"
            className="h-56 w-44 translate-x-[4.5rem] rotate-12 sm:h-64 sm:w-52 sm:translate-x-24"
          >
            Tunjukkan foto terakhir di galerimu, ceritakan kejadiannya.
          </DeckCard>
        </m.div>
      </div>
    </div>
  );
}
