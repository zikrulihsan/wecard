/**
 * Cache data halaman untuk pola stale-while-revalidate: tampilkan isi
 * terakhir yang diketahui seketika, lalu segarkan di belakang layar.
 *
 * Isinya milik akun yang sedang masuk, jadi `clearCaches()` wajib dipanggil
 * saat keluar. `persist` menyimpan juga di localStorage supaya buka ulang
 * aplikasi tidak mulai dari layar memuat; tanpa itu, cache hanya bertahan
 * selama tab terbuka.
 */
const PREFIX = "flipcard:cache:";
const memory = new Map<string, unknown>();

export function readCache<T>(key: string): T | undefined {
  if (memory.has(key)) return memory.get(key) as T;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return undefined;
    const value = JSON.parse(raw) as T;
    memory.set(key, value);
    return value;
  } catch {
    return undefined;
  }
}

export function writeCache<T>(key: string, value: T, { persist = false } = {}) {
  memory.set(key, value);
  if (!persist) return;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Penyimpanan penuh atau diblokir (mode privat) — cache memang opsional.
  }
}

export function removeCache(key: string) {
  memory.delete(key);
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // Diblokir — tidak ada yang perlu dihapus.
  }
}

/** Hapus semua cache, mis. saat keluar akun. */
export function clearCaches() {
  memory.clear();
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(PREFIX)) localStorage.removeItem(key);
    }
  } catch {
    // Diblokir — tidak ada yang tersimpan.
  }
}
