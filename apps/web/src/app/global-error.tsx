"use client";

import { useEffect } from "react";

/**
 * Lapis terakhir: dipakai hanya kalau root layout sendiri yang gagal, dan
 * `app/error.tsx` tidak sempat ter-render.
 *
 * Karena ia menggantikan seluruh dokumen, berkas ini wajib menulis `<html>`
 * dan `<body>` sendiri — dan tidak boleh bergantung pada apa pun yang
 * mungkin ikut rusak. Karena itu gayanya inline, tanpa satu pun komponen
 * atau kelas Tailwind: kalau CSS-nya yang gagal dimuat, halaman ini tetap
 * terbaca.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] error di root layout", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          background: "#fff",
          color: "#171717",
        }}
      >
        <div style={{ maxWidth: "24rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem" }}>🃏</div>
          <h1 style={{ fontSize: "1.35rem", margin: "12px 0 8px" }}>
            Aplikasinya gagal dimuat
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              lineHeight: 1.6,
              color: "#525252",
              margin: "0 0 20px",
            }}
          >
            Ada yang error di sisi kami. Coba muat ulang halaman ini.
          </p>
          <button
            onClick={reset}
            style={{
              border: 0,
              borderRadius: "999px",
              padding: "10px 24px",
              fontSize: "0.9rem",
              fontWeight: 500,
              color: "#fff",
              background: "linear-gradient(90deg, #ec4899, #f43f5e)",
              cursor: "pointer",
            }}
          >
            Coba lagi
          </button>
          {error.digest && (
            <p
              style={{
                fontSize: "0.75rem",
                color: "#a3a3a3",
                marginTop: "16px",
              }}
            >
              Kode kejadian: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
