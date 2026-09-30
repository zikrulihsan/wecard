/**
 * Jatah generate deck AI bawaan per akun — sekali seumur akun, bukan per jam.
 *
 * Ditaruh di berkas sendiri agar halaman statis tidak menarik kode akses
 * database yang hanya dijalankan oleh Netlify Functions.
 *
 * Kembarannya di sisi database ada di fungsi `public.ai_generation_limit()`
 * (migration 00005); kalau angkanya diubah, ubah keduanya.
 */
export const AI_GENERATION_LIMIT = 2;
