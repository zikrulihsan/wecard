"use client";

import { useEffect, useRef, useState } from "react";
import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { DeckCard } from "./deck-card";

type HoveredCard = "left" | "center" | "right" | null;

/**
 * Preview kartu di hero memakai dua bahasa gerak yang berbeda:
 * - mobile: parallax mengikuti scroll; tap pertama membuka susunan kartu dan
 *   tap kedua menuju simulasi;
 * - desktop: hover membuka kartu yang dipilih, sedangkan klik langsung menuju
 *   simulasi.
 *
 * Visual yang bergerak berada di dalam tombol dengan hit-area tetap. Karena
 * itu hover kartu tengah tidak putus saat visualnya terangkat dari pointer.
 */
export function HeroCardStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<HoveredCard>(null);
  const [activeCard, setActiveCard] = useState<HoveredCard>(null);
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
      setHoveredCard(null);
      setActiveCard(null);
    };

    updateViewport();
    media.addEventListener("change", updateViewport);
    return () => media.removeEventListener("change", updateViewport);
  }, []);

  const mobileMotion = isMobile && !reduceMotion;
  const desktopMotion = !isMobile && !reduceMotion;
  const interactionCard = reduceMotion
    ? null
    : isMobile
      ? activeCard
      : hoveredCard;
  const sideTransition = { type: "spring" as const, stiffness: 280, damping: 22 };

  function openSimulation() {
    setActiveCard(null);
    setHoveredCard(null);
    document.getElementById("coba-kartu")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
    });
  }

  function activateCard(card: Exclude<HoveredCard, null>) {
    if (!isMobile || reduceMotion || activeCard !== null) {
      openSimulation();
      return;
    }

    setActiveCard(card);
  }

  function cardLabel(name: string) {
    if (isMobile && !reduceMotion && activeCard === null) {
      return `Animasikan kartu ${name}; ketuk lagi untuk membuka simulasi`;
    }

    return `Buka simulasi dari kartu ${name}`;
  }

  return (
    <div
      ref={containerRef}
      className="relative mx-auto flex h-72 w-full max-w-sm items-center justify-center sm:h-96"
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <m.div
          className={`relative ${
            interactionCard === "left" ? "z-20" : "z-0"
          }`}
          style={mobileMotion ? { x: leftX, y: leftY } : undefined}
        >
          <button
            type="button"
            className="pointer-events-auto block h-56 w-44 cursor-pointer text-left sm:h-64 sm:w-52"
            onMouseEnter={() => desktopMotion && setHoveredCard("left")}
            onMouseLeave={() => desktopMotion && setHoveredCard(null)}
            onClick={() => activateCard("left")}
            aria-label={cardLabel("Talk Anak dan Orang Tua")}
            aria-pressed={isMobile ? activeCard === "left" : undefined}
          >
            <m.div
              className="h-full will-change-transform"
              animate={{
                x: interactionCard === "center" ? -38 : 0,
                y:
                  interactionCard === "left"
                    ? -14
                    : interactionCard
                      ? 4
                      : 0,
                scale:
                  interactionCard === "left"
                    ? 1.04
                    : interactionCard
                      ? 0.98
                      : 1,
              }}
              transition={sideTransition}
            >
              <DeckCard
                theme="sky"
                kind="Talk"
                deck="Anak & Orang Tua"
                className="h-full w-full -translate-x-[4.5rem] -rotate-12 text-base sm:-translate-x-24"
              >
                Kapan terakhir kali kamu merasa bangga sama aku?
              </DeckCard>
            </m.div>
          </button>
        </m.div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <m.div
          className="relative"
          style={mobileMotion ? { y: centerY } : undefined}
        >
          <button
            type="button"
            className="pointer-events-auto block h-56 w-44 cursor-pointer text-left sm:h-64 sm:w-52"
            onMouseEnter={() => desktopMotion && setHoveredCard("center")}
            onMouseLeave={() => desktopMotion && setHoveredCard(null)}
            onClick={() => activateCard("center")}
            aria-label={cardLabel("Talk Pasangan")}
            aria-pressed={isMobile ? activeCard === "center" : undefined}
          >
            <m.div
              className="h-full will-change-transform"
              animate={{
                x:
                  interactionCard === "left"
                    ? 38
                    : interactionCard === "right"
                      ? -38
                      : 0,
                y:
                  interactionCard === "center"
                    ? -16
                    : interactionCard
                      ? -24
                      : 0,
                rotate:
                  interactionCard === "left"
                    ? 4
                    : interactionCard === "right"
                      ? -4
                      : 0,
                scale:
                  interactionCard === "center"
                    ? 1.04
                    : interactionCard
                      ? 1.02
                      : 1,
              }}
              transition={sideTransition}
            >
              <DeckCard
                theme="pink"
                kind="Talk"
                deck="Pasangan"
                className="h-full w-full rotate-2"
              >
                Apa kebiasaan kecil aku yang kamu suka?
              </DeckCard>
            </m.div>
          </button>
        </m.div>
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <m.div
          className={`relative ${
            interactionCard === "right" ? "z-20" : "z-0"
          }`}
          style={mobileMotion ? { x: rightX, y: rightY } : undefined}
        >
          <button
            type="button"
            className="pointer-events-auto block h-56 w-44 cursor-pointer text-left sm:h-64 sm:w-52"
            onMouseEnter={() => desktopMotion && setHoveredCard("right")}
            onMouseLeave={() => desktopMotion && setHoveredCard(null)}
            onClick={() => activateCard("right")}
            aria-label={cardLabel("Action Bikinan AI")}
            aria-pressed={isMobile ? activeCard === "right" : undefined}
          >
            <m.div
              className="h-full will-change-transform"
              animate={{
                x: interactionCard === "center" ? 38 : 0,
                y:
                  interactionCard === "right"
                    ? -14
                    : interactionCard
                      ? 4
                      : 0,
                scale:
                  interactionCard === "right"
                    ? 1.04
                    : interactionCard
                      ? 0.98
                      : 1,
              }}
              transition={sideTransition}
            >
              <DeckCard
                theme="amber"
                kind="Action"
                deck="Bikinan AI"
                className="h-full w-full translate-x-[4.5rem] rotate-12 sm:translate-x-24"
              >
                Tunjukkan foto terakhir di galerimu, ceritakan kejadiannya.
              </DeckCard>
            </m.div>
          </button>
        </m.div>
      </div>
    </div>
  );
}
