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

    // [text](url) — formato Markdown estándar. Va antes del autolink para no doblar.
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_m, text: string, url: string) =>
      `<a href="${safeUrl(url)}" target="_blank" rel="noopener" style="color:${linkColor};text-decoration:underline;">${text}</a>`
    );

    // Fallback: [https://...] (URL sola entre corchetes, sin paréntesis) —
    // algunos LLMs lo emiten así. Lo convertimos en link clickeable con
    // la URL como texto descriptivo.
    s = s.replace(/\[(https?:\/\/[^\s\]]+)\]/g, (_m, url: string) =>
      `<a href="${safeUrl(url)}" target="_blank" rel="noopener" style="color:${linkColor};text-decoration:underline;">${url}</a>`
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

    // Pseudo-listas estilo "[1] item / [2] item / [3] item" — algunos LLMs
    // las emiten como citas académicas. Las convertimos en lista numerada
    // ANTES de procesar las listas standard, para que se vean bien.
    s = s.replace(/((?:^|\n)\[\d+\]\s+[^\n]+(?:\n\[\d+\]\s+[^\n]+)+)/g, (block: string) => {
      const items = block
        .split(/\n/)
        .filter((l) => /^\[\d+\]\s+/.test(l.trim()))
        .map((l) => `<li>${l.replace(/^\[\d+\]\s+/, "")}</li>`)
        .join("");
      return `\n<ol style="margin:6px 0 6px 4px;padding-left:22px;display:flex;flex-direction:column;gap:8px;list-style:decimal outside;">${items}</ol>\n`;
    });

    // Pseudo-headers estilo "[Título]: descripción" o "[Título] descripción"
    // (sin paréntesis, no es un link de Markdown). Lo convertimos a
    // "<strong>Título</strong>: descripción" / "<strong>Título</strong> descripción".
    // Regex: corchetes en inicio de línea, contenido sin corchetes y sin URLs,
    // seguido OPCIONALMENTE de ":" y luego espacio + texto.
    s = s.replace(
      /(^|\n)\[([^\]\n]+?)\](:?)\s+([^\n]+)/g,
      (_m, pre: string, label: string, colon: string, rest: string) => {
        // Si el "label" parece ser un link de Markdown malformado (empieza con http), no toques.
        if (/^https?:/i.test(label.trim())) return _m;
        return `${pre}<strong>${label}</strong>${colon} ${rest}`;
      }
    );

    // Listas numeradas estándar Markdown: "1. item / 2. item / 3. item"
    s = s.replace(/((?:^|\n)\d+\.\s+[^\n]+(?:\n\d+\.\s+[^\n]+)+)/g, (block: string) => {
      const items = block
        .split(/\n/)
        .filter((l) => /^\d+\.\s+/.test(l.trim()))
        .map((l) => `<li>${l.replace(/^\d+\.\s+/, "")}</li>`)
        .join("");
      return `\n<ol style="margin:6px 0 6px 4px;padding-left:22px;display:flex;flex-direction:column;gap:6px;list-style:decimal outside;">${items}</ol>\n`;
    });

    // Listas con viñetas: agrupa líneas que empiezan con "- ", "* " o "• " en <ul>
    s = s.replace(/((?:^|\n)(?:[-*•])\s+.+(?:\n(?:[-*•])\s+.+)*)/g, (block: string) => {
      const items = block
        .split(/\n/)
        .filter((l) => /^[-*•]\s+/.test(l.trim()))
        .map((l) => `<li>${l.replace(/^[-*•]\s+/, "")}</li>`)
        .join("");
      return `\n<ul style="margin:6px 0 6px 4px;padding-left:18px;display:flex;flex-direction:column;gap:6px;list-style:disc outside;">${items}</ul>\n`;
    });

    // Saltos de línea (solo fuera de listas, marcamos con placeholder antes/después)
    s = s.replace(/\n/g, "<br>");
    // Limpia <br> que quedaron justo antes/después de <ul> y <ol>
    s = s
      .replace(/<br>\s*<ul/g, "<ul").replace(/<\/ul>\s*<br>/g, "</ul>")
      .replace(/<br>\s*<ol/g, "<ol").replace(/<\/ol>\s*<br>/g, "</ol>");

    return s;
  } catch (e) {
    // Si algo en la regex tira (poco probable pero defensivo),
    // devolvemos el texto original escapado para que al menos se vea.
    if (typeof console !== "undefined") console.warn("[GeekAgentWidget] markdown render failed:", e);
    return escapeHtml(input).replace(/\n/g, "<br>");
  }
}
