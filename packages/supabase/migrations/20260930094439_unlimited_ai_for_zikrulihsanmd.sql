-- Beri pengecualian kuota kepada akun yang sudah ada dengan email ini.
-- Kolom tetap milik server; pengguna hanya boleh mengubah kolom profil
-- biasa yang diberikan di migration 00003.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ai_unlimited BOOLEAN NOT NULL DEFAULT false;

REVOKE UPDATE (ai_unlimited) ON public.profiles FROM authenticated, anon;

INSERT INTO public.profiles (id, ai_unlimited)
SELECT id, true
FROM auth.users
WHERE lower(email) = 'zikrulihsanmd@gmail.com'
ON CONFLICT (id) DO UPDATE SET ai_unlimited = true;

-- Gerbang RLS kategori AI memakai penanda yang sama dengan API.
-- ai_enabled tetap dapat mematikan akses, termasuk untuk akun tanpa kuota.
CREATE OR REPLACE FUNCTION public.has_ai_access()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT auth.uid() IS NOT NULL
    AND COALESCE(p.ai_enabled, true)
    AND (
      COALESCE(p.ai_unlimited, false)
      OR public.ai_generations_used() < public.ai_generation_limit()
    )
  FROM (SELECT auth.uid() AS user_id) AS caller
  LEFT JOIN public.profiles AS p ON p.id = caller.user_id;
$$;

REVOKE ALL ON FUNCTION public.has_ai_access() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_ai_access() TO authenticated;
