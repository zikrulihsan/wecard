export const OAUTH_REDIRECT_KEY = "flipcard:oauth-redirect";

/**
 * Tujuan setelah konfirmasi email pendaftaran. Disimpan di localStorage (bukan
 * sessionStorage seperti OAuth) karena tautan konfirmasi biasanya terbuka di
 * tab baru. Tidak dimasukkan ke `emailRedirectTo` supaya URL-nya tetap persis
 * `/callback` yang terdaftar di Redirect URLs Supabase.
 */
export const SIGNUP_REDIRECT_KEY = "flipcard:signup-redirect";
