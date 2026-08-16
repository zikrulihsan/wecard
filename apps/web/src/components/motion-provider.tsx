"use client";

import { LazyMotion } from "framer-motion";

// domMax dimuat async supaya kode animasi/gesture framer-motion keluar dari
// bundle awal; komponen `m` tetap render markup pertamanya tanpa menunggu.
const loadFeatures = () => import("framer-motion").then((mod) => mod.domMax);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
