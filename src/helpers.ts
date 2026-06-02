/**
 * Calcula el color de texto legible sobre un color de fondo dado.
 * Usa luminancia perceptual (Rec. 601).
 */
export function readableOn(hex: string): string {
  const c = (hex || "#0072FF").replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? "#0B1220" : "#FFFFFF";
}

/** Iniciales del bot (máx 2 letras, mayúsculas). */
export function initials(name: string): string {
  const parts = (name || "Geek Agent").trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]).join("").toUpperCase().slice(0, 2) || "GA";
}

/** HH:MM con offset opcional en minutos hacia atrás. */
export function fmtTime(offsetMin = 0): string {
  const d = new Date(Date.now() - offsetMin * 60000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Mezcla un objeto target con keys de un objeto source, mutando target. */
export function merge<T extends object>(target: T, source: Partial<T>): T {
  for (const k in source) {
    const v = source[k];
    if (v !== undefined) (target as any)[k] = v;
  }
  return target;
}

/** Crea un elemento con estilos inline + atributos. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  opts: {
    style?: Partial<CSSStyleDeclaration> & Record<string, string | number | undefined>;
    attrs?: Record<string, string>;
    text?: string;
    html?: string;
    className?: string;
    children?: (HTMLElement | SVGElement | null)[];
  } = {}
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (opts.className) e.className = opts.className;
  if (opts.style) {
    for (const k in opts.style) {
      const v = opts.style[k];
      if (v !== undefined && v !== null) (e.style as any)[k] = String(v);
    }
  }
  if (opts.attrs) {
    for (const k in opts.attrs) e.setAttribute(k, opts.attrs[k]);
  }
  if (opts.text !== undefined) e.textContent = opts.text;
  if (opts.html !== undefined) e.innerHTML = opts.html;
  if (opts.children) {
    for (const c of opts.children) if (c) e.appendChild(c);
  }
  return e;
}
