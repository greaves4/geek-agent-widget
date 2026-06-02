/**
 * Mini markdown renderer (~300 bytes) — solo lo que necesita el bot:
 * - [text](url) → <a target="_blank" rel="noopener">
 * - URLs sueltas (http/https) → autolink
 * - **bold** → <strong>
 * - *italic* / _italic_ → <em>
 * - `code` → <code>
 * - Saltos de línea → <br>
 *
 * Escapa todo HTML del input antes de aplicar reglas. Seguro contra XSS.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeUrl(u: string): string {
  const trimmed = u.trim();
  // Solo http, https, mailto, tel. Bloqueamos javascript:, data:, etc.
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  if (/^[a-z0-9.\-]+\.[a-z]{2,}/i.test(trimmed)) return "https://" + trimmed;
  return "#";
}

export function renderMarkdown(input: string, linkColor: string): string {
  if (!input) return "";

  try {
    let s = escapeHtml(input);

    // [text](url) — antes que autolink para no doblar
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_m, text: string, url: string) =>
      `<a href="${safeUrl(url)}" target="_blank" rel="noopener" style="color:${linkColor};text-decoration:underline;">${text}</a>`
    );

    // Autolink URLs sueltas (que no estén ya dentro de un href)
    s = s.replace(/(^|[\s(])(https?:\/\/[^\s<)]+[^\s.,;:!?<)])/g, (_m, pre: string, url: string) =>
      `${pre}<a href="${safeUrl(url)}" target="_blank" rel="noopener" style="color:${linkColor};text-decoration:underline;">${url}</a>`
    );

    // **bold**
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

    // *italic* simple — sin lookbehind (compat universal)
    s = s.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");

    // `code`
    s = s.replace(/`([^`\n]+)`/g, "<code style=\"background:rgba(0,0,0,.08);padding:1px 5px;border-radius:3px;font-size:.92em;font-family:ui-monospace,monospace;\">$1</code>");

    // Listas simples: "- " al inicio de línea
    s = s.replace(/(^|\n)([-*])\s+(.+)/g, (_m, pre: string, _b: string, item: string) => `${pre}• ${item}`);

    // Saltos de línea
    s = s.replace(/\n/g, "<br>");

    return s;
  } catch (e) {
    // Si algo en la regex tira (poco probable pero defensivo),
    // devolvemos el texto original escapado para que al menos se vea.
    if (typeof console !== "undefined") console.warn("[GeekAgentWidget] markdown render failed:", e);
    return escapeHtml(input).replace(/\n/g, "<br>");
  }
}
