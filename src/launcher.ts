import { el } from "./helpers";
import { readableOn, initials } from "./helpers";
import { chevronDownSvg } from "./isotipo";
import { t, type Lang } from "./strings";

export interface LauncherOpts {
  primary: string;
  botName: string;
  logo?: string;
  lang: Lang;
  size?: number;
  onClick: () => void;
}

export interface LauncherHandle {
  root: HTMLButtonElement;
  setOpen(open: boolean): void;
  setBadge(n: number): void;
}

export function createLauncher(opts: LauncherOpts): LauncherHandle {
  const size = opts.size ?? 60;
  const fg = readableOn(opts.primary);

  const btn = el("button", {
    className: "ga-launcher",
    attrs: {
      type: "button",
      "aria-label": t(opts.lang, "open"),
      "aria-expanded": "false"
    },
    style: {
      position: "relative",
      width: `${size}px`,
      height: `${size}px`,
      flexShrink: "0",
      borderRadius: "20px",
      border: "none",
      cursor: "pointer",
      padding: "0",
      background: opts.primary,
      color: fg,
      display: "grid",
      placeItems: "center",
      boxShadow: "0 8px 22px rgba(11,18,32,0.20), 0 1px 3px rgba(11,18,32,0.10)",
      transform: "scale(1)",
      transition: "transform 200ms cubic-bezier(.22,1,.36,1), box-shadow 200ms cubic-bezier(.22,1,.36,1)"
    }
  });

  btn.addEventListener("mouseenter", () => {
    btn.style.transform = "scale(1.05)";
    btn.style.boxShadow = "0 12px 30px rgba(11,18,32,0.28), 0 2px 6px rgba(11,18,32,0.12)";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "scale(1)";
    btn.style.boxShadow = "0 8px 22px rgba(11,18,32,0.20), 0 1px 3px rgba(11,18,32,0.10)";
  });
  btn.addEventListener("click", opts.onClick);

  // Capa contenido cerrado (logo/iniciales)
  const closedLayer = el("span", {
    style: {
      position: "absolute", display: "grid", placeItems: "center", inset: "0",
      opacity: "1",
      transition: "opacity 200ms ease, transform 250ms cubic-bezier(.22,1,.36,1)"
    }
  });
  if (opts.logo) {
    const img = document.createElement("img");
    img.src = opts.logo;
    img.alt = "";
    img.style.cssText = `width:${size * 0.5}px;height:${size * 0.5}px;object-fit:contain;border-radius:8px;`;
    img.onerror = () => { img.style.display = "none"; };
    closedLayer.appendChild(img);
  } else {
    const mono = el("span", {
      text: initials(opts.botName),
      style: {
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: "700",
        fontSize: `${size * 0.3}px`,
        letterSpacing: "-0.02em"
      }
    });
    closedLayer.appendChild(mono);
  }

  // Capa contenido abierto (chevron down)
  const openLayer = el("span", {
    html: chevronDownSvg(fg, 22),
    style: {
      position: "absolute", display: "grid", placeItems: "center", inset: "0",
      opacity: "0",
      transform: "rotate(90deg) scale(.6)",
      transition: "opacity 200ms ease, transform 250ms cubic-bezier(.22,1,.36,1)"
    }
  });

  // Badge
  const badge = el("span", {
    style: {
      position: "absolute", top: "-4px", right: "-4px",
      minWidth: "22px", height: "22px", padding: "0 6px",
      borderRadius: "999px", background: "#FF3B30", color: "#fff",
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontWeight: "700", fontSize: "12px",
      display: "none", placeItems: "center", boxSizing: "border-box",
      boxShadow: "0 0 0 2px rgba(255,255,255,0.9)"
    },
    text: "0"
  });

  btn.appendChild(closedLayer);
  btn.appendChild(openLayer);
  btn.appendChild(badge);

  return {
    root: btn,
    setOpen(open: boolean) {
      btn.setAttribute("aria-label", t(opts.lang, open ? "minimize" : "open"));
      btn.setAttribute("aria-expanded", String(open));
      closedLayer.style.opacity = open ? "0" : "1";
      closedLayer.style.transform = open ? "rotate(-90deg) scale(.6)" : "none";
      openLayer.style.opacity = open ? "1" : "0";
      openLayer.style.transform = open ? "none" : "rotate(90deg) scale(.6)";
      if (open) badge.style.display = "none";
    },
    setBadge(n: number) {
      if (n > 0) {
        badge.textContent = n > 99 ? "99+" : String(n);
        badge.style.display = "grid";
      } else {
        badge.style.display = "none";
      }
    }
  };
}
