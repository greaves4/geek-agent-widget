import { t, type Lang } from "./strings";

export interface ThemeResponse {
  title: string;
  welcomeMessage?: string;
  appearance: {
    primaryColor: string;
    fontFamily: string;
    logoUrl: string;
    width: { value: number; unit: string };
    height: { value: number; unit: string };
    fontSize: { value: number; unit: string };
  };
}

export async function fetchTheme(apiBase: string, apiKey: string): Promise<ThemeResponse | null> {
  try {
    const r = await fetch(`${apiBase}/widget/theme`, {
      headers: { "x-api-key": apiKey }
    });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

export interface ChatRequest {
  message: string;
  conversationId: string | null;
}

export interface ChatResponse {
  answer?: string;
  conversation_id?: string;
  handoff?: boolean;
}

export async function sendChat(
  apiBase: string,
  apiKey: string,
  req: ChatRequest,
  lang: Lang
): Promise<{ ok: true; data: ChatResponse } | { ok: false; error: string }> {
  try {
    const r = await fetch(`${apiBase}/widget/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      },
      body: JSON.stringify({ message: req.message, conversationId: req.conversationId })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const detail = String((data && data.error) || "").trim();
      if (detail && /[áéíóúñ¿¡]/i.test(detail)) return { ok: false, error: detail };
      if (r.status === 401) return { ok: false, error: t(lang, "errKey") };
      if (r.status === 403) return { ok: false, error: t(lang, "errOrigin") };
      if (r.status === 429) return { ok: false, error: t(lang, "errRate") };
      if (r.status === 409) return { ok: false, error: t(lang, "errHandoff") };
      return { ok: false, error: detail || `HTTP ${r.status}` };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, error: t(lang, "errGeneric") };
  }
}
