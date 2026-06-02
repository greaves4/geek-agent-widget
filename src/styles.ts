/**
 * CSS inyectado en el <head> del host site.
 * Solo selectores scoped a .ga-* para no contaminar el sitio.
 * Animaciones y pseudo-states (que no se pueden hacer inline).
 *
 * NOTE: usamos !important en posicionamiento porque algunos hosts (Lenis,
 * Framer Motion, Tailwind reset) aplican transforms o resets en <body> /
 * <html> que rompen position: fixed normal.
 */
export const CSS = `
@keyframes ga-launcher-in { from { opacity:0; transform: translateY(16px) } to { opacity:1; transform:none } }
@keyframes ga-panel-in { from { opacity:0; transform: scale(.92) } to { opacity:1; transform: scale(1) } }
@keyframes ga-msg-in { from { opacity:0; transform: translateY(12px) } to { opacity:1; transform:none } }
@keyframes ga-bounce { 0%,80%,100%{transform:translateY(0);opacity:.55} 40%{transform:translateY(-4px);opacity:1} }
@keyframes ga-halo { 0%{box-shadow:0 0 0 0 rgba(74,244,143,.55)} 70%{box-shadow:0 0 0 7px rgba(74,244,143,0)} 100%{box-shadow:0 0 0 0 rgba(74,244,143,0)} }
@keyframes ga-wink { 0%,100%{transform:scale(1);box-shadow:none} 50%{transform:scale(1.5);box-shadow:0 0 8px rgba(74,244,143,.65)} }

.ga-mount {
  position: fixed !important;
  right: 24px !important;
  bottom: calc(24px + env(safe-area-inset-bottom, 0px)) !important;
  z-index: 2147483647 !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-end !important;
  gap: 14px !important;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  isolation: isolate;
  pointer-events: none;
}
.ga-mount > * { pointer-events: auto; }
.ga-mount.ga-left { right: auto !important; left: 24px !important; align-items: flex-start !important; }

.ga-launcher { animation: ga-launcher-in 600ms cubic-bezier(.22,1,.36,1) both; animation-delay: .15s; }
.ga-panel-wrap { animation: ga-panel-in 260ms cubic-bezier(.22,1,.36,1) both; transform-origin: bottom right; }
.ga-left .ga-panel-wrap { transform-origin: bottom left; }
.ga-msg-in { animation: ga-msg-in 350ms ease-out both; }
.ga-dot { animation: ga-bounce 1.2s ease-in-out infinite both; }
.ga-status-dot { animation: ga-halo 1.6s ease-out infinite; }
.ga-dot-wink { animation: ga-wink 1s ease-in-out 1; }

.ga-hbtn:hover { background: rgba(255,255,255,.18) !important; }
.ga-send:not(:disabled):hover { transform: scale(1.06); }
.ga-send:not(:disabled):active { transform: scale(.94); }
.ga-input:focus { border-color: var(--ga-accent, #0072FF) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ga-accent, #0072FF) 18%, transparent) !important; }
.ga-chip:hover { border-color: var(--ga-accent, #0072FF) !important; color: var(--ga-accent, #0072FF) !important; }
.ga-powered:hover .ga-iso-wrap { transform: translateX(2px) scale(1.12); filter: drop-shadow(0 0 4px rgba(74,244,143,.7)); }
.ga-iso-wrap { transition: transform 200ms ease, filter 200ms ease; display:inline-block; }

@media (prefers-reduced-motion: reduce) {
  .ga-launcher, .ga-panel-wrap, .ga-msg-in, .ga-dot, .ga-status-dot, .ga-dot-wink { animation: none !important; }
}

/* MOBILE: panel en fullscreen, launcher con offset menor */
@media (max-width: 767px) {
  .ga-mount {
    right: 16px !important;
    bottom: calc(16px + env(safe-area-inset-bottom, 0px)) !important;
  }
  .ga-mount.ga-left { left: 16px !important; }

  /* El launcher se queda chico para no tapar contenido */
  .ga-launcher {
    width: 56px !important;
    height: 56px !important;
  }

  /* Panel en pantalla completa */
  .ga-panel-fs {
    position: fixed !important;
    top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
    width: 100vw !important;
    width: 100dvw !important;
    height: 100vh !important;
    height: 100dvh !important;
    border-radius: 0 !important;
    border: none !important;
    max-width: none !important;
    max-height: none !important;
  }
  /* Cuando el panel está abierto, ocultamos el launcher para que no se monte encima */
  .ga-has-panel .ga-launcher { display: none !important; }
}
`;

let injected = false;
export function ensureStyles() {
  if (injected || typeof document === "undefined") return;
  const s = document.createElement("style");
  s.id = "ga-widget-styles";
  s.textContent = CSS;
  document.head.appendChild(s);
  injected = true;
}
