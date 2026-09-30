import type { Config } from "@netlify/functions";
import { authenticatedClient } from "../auth";
import { getAiAccess } from "../../src/lib/ai/access";

export const config: Config = { path: "/api/ai-access" };

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return Response.json({ error: "Metode tidak diizinkan" }, { status: 405 });
  }
  try {
    const auth = await authenticatedClient(request);
    if (!auth) return Response.json({ error: "Belum login" }, { status: 401 });
    const { canGenerate, enabled, used, limit, remaining, unlimited } =
      await getAiAccess(auth.supabase, auth.user.id);
    return Response.json(
      { canUseAi: canGenerate, enabled, used, limit, remaining, unlimited },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[ai-access] gagal", error);
    return Response.json({ error: "Gagal membaca jatah" }, { status: 500 });
  }
}
