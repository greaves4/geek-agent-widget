/**
 * Geek Agent — Embeddable chat widget
 * Usage:
 *   <script src="https://widget.geekagent.io/widget.umd.js"></script>
 *   <script>
 *     GeekAgentWidget.init({
 *       apiBase: "https://app.geekagent.io",
 *       botId: "...",
 *       apiKey: "ga_..."
 *     });
 *   </script>
 */

import { ensureStyles } from "./styles";
import { fetchTheme, sendChat } from "./api";
import { createLauncher } from "./launcher";
import { createPanel, type Message } from "./panel";
import { fmtTime } from "./helpers";
import { t, type Lang } from "./strings";
import type { SurfaceTheme } from "./theme";

export interface InitOptions {
  apiBase?: string;
  botId: string;
  apiKey: string;
  /** Override: title del header. Si no viene, usa el del bot. */
  title?: string;
  /** Override: welcome message. Si no viene, usa el del bot o un default. */
  welcome?: string;
  theme?: SurfaceTheme;
  lang?: Lang;
  position?: "right" | "left";
  /** Override: appearance (color, logo, fuente, tamaño). Si no viene, usa la del bot. */
  appearance?: Partial<{
    primaryColor: string;
    fontFamily: string;
    logoUrl: string;
    width: { value: number; unit: string };
    height: { value: number; unit: string };
    fontSize: { value: number; unit: string };
  }>;
}

function px(v: { value: number; unit: string } | undefined, fallback: number): number {
  if (!v) return fallback;
  // El widget responsive funciona mejor en px puros. Si el cliente eligió rem o %, lo convertimos.
  if (v.unit === "px") return Number(v.value) || fallback;
  if (v.unit === "rem") return Math.round(Number(v.value) * 16) || fallback;
  return fallback;
}

interface State {
  open: boolean;
  messages: Message[];
  badge: number;
  conversationId: string | null;
}

function storageKey(botId: string, apiKey: string): string {
  return `geekagent:${botId}:${apiKey.slice(0, 16)}`;
}

function loadState(key: string): Partial<State> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const d = JSON.parse(raw);
    return {
      messages: Array.isArray(d.messages) ? d.messages : undefined,
      open: typeof d.open === "boolean" ? d.open : undefined,
      badge: typeof d.badge === "number" ? d.badge : undefined,
      conversationId: typeof d.conversationId === "string" ? d.conversationId : null
    };
  } catch {
    return {};
  }
}

function saveState(key: string, s: State) {
  try {
    localStorage.setItem(key, JSON.stringify({
      messages: s.messages.slice(-50), // máx 50 mensajes persistidos
      open: s.open,
      badge: s.badge,
      conversationId: s.conversationId
    }));
  } catch { /* quota / privacy mode */ }
}

let mounted = false;

export async function init(opts: InitOptions) {
  if (mounted) return;
  if (!opts.apiKey) { console.error("[GeekAgentWidget] apiKey is required"); return; }
  if (!opts.botId)  { console.error("[GeekAgentWidget] botId is required"); return; }

  const apiBase = (opts.apiBase || "https://app.geekagent.io").replace(/\/$/, "");
  const lang: Lang = (opts.lang === "en" ? "en" : "es");
  const theme: SurfaceTheme = opts.theme === "dark" ? "dark" : "light";
  const position = opts.position === "left" ? "left" : "right";

  // Fetch theme del bot
  const theme$ = await fetchTheme(apiBase, opts.apiKey);
  if (!theme$) {
    // Sin theme no podemos confirmar key — mostramos el launcher en color genérico y mensaje de error al intentar abrir
    console.warn("[GeekAgentWidget] couldn't fetch /widget/theme — using fallback config");
  }

  const appearance = { ...(theme$?.appearance || {}), ...(opts.appearance || {}) };
  const primary  = (opts.appearance?.primaryColor || appearance.primaryColor || "#0072FF");
  const logoUrl  = (opts.appearance?.logoUrl || appearance.logoUrl || "") || undefined;
  const fontFamily = (opts.appearance?.fontFamily || appearance.fontFamily || "system-ui, -apple-system, sans-serif");
  const width  = px(appearance.width as any,  340);
  const height = px(appearance.height as any, 520);
  const fontSize = px(appearance.fontSize as any, 14);

  const botName = opts.title || theme$?.title || "Geek Agent";
  const welcomeText = (opts.welcome || theme$?.welcomeMessage || t(lang, "welcomeEs")).trim();

  ensureStyles();
  mounted = true;

  // Mount container
  const mount = document.createElement("div");
  mount.className = "ga-mount" + (position === "left" ? " ga-left" : "");
  document.body.appendChild(mount);

  // ─── State persistente ────────────────────────────────────
  const key = storageKey(opts.botId, opts.apiKey);
  const saved = loadState(key);
  const initialMessages: Message[] = (saved.messages && saved.messages.length)
    ? saved.messages
    : [{
        id: "welcome",
        from: "bot",
        text: welcomeText,
        time: fmtTime(2)
      }];

  const state: State = {
    open: !!saved.open,
    messages: initialMessages,
    badge: typeof saved.badge === "number" ? saved.badge : (initialMessages.length === 1 ? 1 : 0),
    conversationId: saved.conversationId || null
  };

  // ─── Build launcher (siempre visible) ─────────────────────
  const launcher = createLauncher({
    primary,
    botName,
    logo: logoUrl,
    lang,
    onClick: () => toggle()
  });
  launcher.setBadge(state.badge);

  // ─── Build panel (solo al abrir) ──────────────────────────
  let panelWrap: HTMLDivElement | null = null;
  let panelHandle: ReturnType<typeof createPanel> | null = null;
  let typingActive = false;
  let sending = false;

  function isMobile(): boolean {
    return window.matchMedia("(max-width: 767px)").matches;
  }

  function openPanel() {
    if (panelWrap) return;
    panelWrap = el("div", { className: "ga-panel-wrap" });

    const fullscreen = isMobile();
    panelHandle = createPanel({
      primary,
      botName,
      logo: logoUrl,
      theme,
      lang,
      fontFamily,
      width: fullscreen ? window.innerWidth : width,
      height: fullscreen ? window.innerHeight : height,
      fontSize,
      fullscreen,
      onSend: (txt) => handleSend(txt),
      onMinimize: () => closePanel(false),
      onClose: () => closePanel(true)
    });
    panelWrap.appendChild(panelHandle.root);

    if (fullscreen) {
      // En mobile, el panel va directo al body con position fixed.
      // El launcher se oculta vía CSS (.ga-has-panel).
      panelWrap.style.cssText =
        "position:fixed;top:0;left:0;right:0;bottom:0;" +
        "width:100vw;width:100dvw;height:100vh;height:100dvh;" +
        "z-index:2147483647;animation:ga-panel-in 260ms cubic-bezier(.22,1,.36,1) both;";
      document.body.appendChild(panelWrap);
      mount.classList.add("ga-has-panel");
      // Bloqueamos el scroll del body para que solo scroll dentro del panel
      document.body.style.setProperty("overflow", "hidden", "important");
    } else {
      mount.insertBefore(panelWrap, launcher.root);
    }

    panelHandle.setMessages(state.messages);
    setTimeout(() => panelHandle?.focusInput(), 100);
  }

  function closePanel(_reset: boolean) {
    if (panelWrap) {
      panelWrap.remove();
      panelWrap = null;
      panelHandle = null;
    }
    state.open = false;
    launcher.setOpen(false);
    mount.classList.remove("ga-has-panel");
    document.body.style.removeProperty("overflow");
    saveState(key, state);
  }

  function toggle() {
    if (state.open) {
      closePanel(false);
    } else {
      state.open = true;
      state.badge = 0;
      launcher.setOpen(true);
      launcher.setBadge(0);
      openPanel();
      saveState(key, state);
    }
  }

  // Si saved.open era true, abre al cargar
  if (state.open) {
    state.badge = 0;
    launcher.setOpen(true);
    openPanel();
  }

  // ─── Lógica de enviar ────────────────────────────────────
  async function handleSend(text: string) {
    if (sending || !panelHandle) return;
    sending = true;

    const userMsg: Message = {
      id: "u-" + Date.now(),
      from: "user",
      text,
      time: fmtTime(0)
    };
    state.messages.push(userMsg);
    panelHandle.appendMessage(userMsg);
    typingActive = true;
    panelHandle.setTyping(true);
    saveState(key, state);

    const res = await sendChat(apiBase, opts.apiKey, {
      message: text,
      conversationId: state.conversationId
    }, lang);

    typingActive = false;
    panelHandle?.setTyping(false);

    if (res.ok) {
      if (res.data.conversation_id) state.conversationId = res.data.conversation_id;
      const botMsg: Message = {
        id: "b-" + Date.now(),
        from: "bot",
        text: res.data.answer || "…",
        time: fmtTime(0)
      };
      state.messages.push(botMsg);
      panelHandle?.appendMessage(botMsg);
      panelHandle?.pulseDot();
      if (res.data.handoff) {
        // No persistimos la conversación adelante — un asesor humano sigue la conversación en el dashboard
      }
    } else {
      const errMsg: Message = {
        id: "e-" + Date.now(),
        from: "bot",
        text: res.error,
        time: fmtTime(0),
        error: true
      };
      state.messages.push(errMsg);
      panelHandle?.appendMessage(errMsg);
    }

    saveState(key, state);
    sending = false;
  }

  mount.appendChild(launcher.root);

  // Manejo de resize (mobile ↔ desktop)
  let lastFullscreen = isMobile();
  window.addEventListener("resize", () => {
    if (!state.open || !panelHandle) return;
    const nowFs = isMobile();
    if (nowFs !== lastFullscreen) {
      lastFullscreen = nowFs;
      // Re-render panel con nuevo modo
      closePanel(false);
      state.open = true;
      launcher.setOpen(true);
      openPanel();
    }
  });
}

// Pequeño helper para crear div con clase (evitar import circular con helpers)
function el<K extends keyof HTMLElementTagNameMap>(tag: K, opts: { className?: string } = {}): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (opts.className) e.className = opts.className;
  return e;
}

// El bundle UMD expone window.GeekAgentWidget con { init, ... }
