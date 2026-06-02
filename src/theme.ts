export type SurfaceTheme = "light" | "dark";

export interface Surface {
  panel: string;
  headerText: string;
  botBubble: string;
  botText: string;
  body: string;
  line: string;
  inputBg: string;
  inputText: string;
  placeholder: string;
  muted: string;
  avatarRing: string;
  metaText: string;
  chipBorder: string;
  chipText: string;
}

export function surface(theme: SurfaceTheme): Surface {
  if (theme === "dark") {
    return {
      panel: "#111A2E", headerText: "#F8FAFC", botBubble: "#1A2540",
      botText: "#F8FAFC", body: "#0E1626", line: "rgba(255,255,255,0.09)",
      inputBg: "#1A2540", inputText: "#F8FAFC", placeholder: "#64748B",
      muted: "#94A3B8", avatarRing: "rgba(255,255,255,0.14)", metaText: "#64748B",
      chipBorder: "rgba(255,255,255,0.14)", chipText: "#CBD5E1",
    };
  }
  return {
    panel: "#FFFFFF", headerText: "#FFFFFF", botBubble: "#F4F4F2",
    botText: "#0B1220", body: "#FBFBFA", line: "rgba(11,18,32,0.08)",
    inputBg: "#F4F4F2", inputText: "#0B1220", placeholder: "#94A3B8",
    muted: "#64748B", avatarRing: "rgba(255,255,255,0.55)", metaText: "#94A3B8",
    chipBorder: "rgba(11,18,32,0.12)", chipText: "#334155",
  };
}
