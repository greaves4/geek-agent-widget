import { el, readableOn, initials } from "./helpers";
import { iconClose, iconMinimize, iconSend, isotipoSvg } from "./isotipo";
import { surface, type SurfaceTheme } from "./theme";
import { t, type Lang } from "./strings";
import { renderMarkdown } from "./markdown";

export interface Message {
  id: string | number;
  from: "bot" | "user";
  text: string;
  time: string;
  error?: boolean;
}

export interface PanelOpts {
  primary: string;
  botName: string;
  logo?: string;
  theme: SurfaceTheme;
  lang: Lang;
  fontFamily: string;
  width: number;
  height: number;
  fontSize: number;
  fullscreen: boolean;
  onSend: (text: string) => void;
  onMinimize: () => void;
  onClose: () => void;
}

export interface PanelHandle {
  root: HTMLDivElement;
  setTyping(t: boolean): void;
  appendMessage(m: Message): void;
  setMessages(list: Message[]): void;
  pulseDot(): void;
  focusInput(): void;
  setHandoff(active: boolean): void;
}

export function createPanel(opts: PanelOpts): PanelHandle {
  const S = surface(opts.theme);
  const fg = readableOn(opts.primary);

  const root = el("div", {
    className: opts.fullscreen ? "ga-panel-fs" : "",
    attrs: { role: "dialog", "aria-label": opts.botName },
    style: opts.fullscreen ? {
      width: "100%",
      height: "100%",
      background: S.body,
      display: "flex",
      flexDirection: "column",
      borderRadius: "0",
      overflow: "hidden",
      border: "none",
      fontFamily: opts.fontFamily,
      fontSize: `${opts.fontSize}px`
    } : {
      width: `${opts.width}px`,
      height: `${opts.height}px`,
      background: S.body,
      display: "flex",
      flexDirection: "column",
      borderRadius: "16px",
      overflow: "hidden",
      border: `1px solid ${S.line}`,
      boxShadow: "0 16px 48px rgba(11,18,32,0.22), 0 4px 12px rgba(11,18,32,0.12), 0 0 0 1px rgba(11,18,32,0.04)",
      fontFamily: opts.fontFamily,
      fontSize: `${opts.fontSize}px`
    }
  });

  // ─── HEADER ────────────────────────────────────────────────
  const header = el("div", {
    style: {
      background: opts.primary,
      color: fg,
      padding: opts.fullscreen
        ? "calc(14px + env(safe-area-inset-top, 0px)) 12px 14px 16px"
        : "14px 12px 14px 16px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      flexShrink: "0"
    }
  });

  const avatar = el("div", {
    style: {
      width: "38px", height: "38px", borderRadius: "999px", flexShrink: "0",
      background: "#fff", display: "grid", placeItems: "center",
      boxShadow: `0 0 0 1px ${S.avatarRing}`,
      overflow: "hidden"
    }
  });
  if (opts.logo) {
    const img = document.createElement("img");
    img.src = opts.logo;
    img.alt = "";
    img.style.cssText = "width:100%;height:100%;object-fit:cover;";
    avatar.appendChild(img);
  } else {
    avatar.appendChild(el("span", {
      text: initials(opts.botName),
      style: {
        color: opts.primary, fontWeight: "700", fontSize: "15px",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }
    }));
  }

  const infoCol = el("div", { style: { flex: "1", minWidth: "0" } });

  const nameDot = el("span", {
    style: {
      width: "6px", height: "6px", borderRadius: "99px",
      background: "#4AF48F", flexShrink: "0", display: "inline-block"
    }
  });
  const nameRow = el("div", {
    style: {
      fontWeight: "650", fontSize: "15px", display: "flex",
      alignItems: "center", gap: "6px", lineHeight: "1.2",
      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
    },
    children: [
      el("span", { text: opts.botName }),
      nameDot
    ]
  });

  const statusDot = el("span", {
    className: "ga-status-dot",
    style: {
      width: "7px", height: "7px", borderRadius: "99px",
      background: "#4AF48F", position: "relative", display: "inline-block"
    }
  });
  const statusText = el("span", {
    text: t(opts.lang, "online"),
    style: { fontSize: "12px" }
  });
  const statusRow = el("div", {
    style: {
      display: "flex", alignItems: "center", gap: "6px",
      marginTop: "2px", opacity: "0.92"
    },
    children: [statusDot, statusText]
  });

  infoCol.appendChild(nameRow);
  infoCol.appendChild(statusRow);

  const hBtn = (label: string, icon: string, onClick: () => void) => {
    const b = el("button", {
      className: "ga-hbtn",
      html: icon,
      attrs: { type: "button", "aria-label": label },
      style: {
        width: "30px", height: "30px", borderRadius: "8px", border: "none",
        cursor: "pointer", background: "transparent", color: fg,
        display: "grid", placeItems: "center",
        transition: "background 150ms ease"
      }
    });
    b.addEventListener("click", onClick);
    return b;
  };

  header.appendChild(avatar);
  header.appendChild(infoCol);
  header.appendChild(hBtn(t(opts.lang, "minimize"), iconMinimize(fg), opts.onMinimize));
  header.appendChild(hBtn(t(opts.lang, "close"), iconClose(fg), opts.onClose));

  // ─── MESSAGES ─────────────────────────────────────────────
  const scroller = el("div", {
    style: {
      flex: "1", overflowY: "auto", padding: "18px 16px",
      display: "flex", flexDirection: "column", gap: "12px",
      background: S.body
    }
  });

  function renderMessage(m: Message, animate = true): HTMLElement {
    const isUser = m.from === "user";
    const userFg = readableOn(opts.primary);

    const wrap = el("div", {
      className: animate ? "ga-msg-in" : "",
      style: {
        display: "flex", flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        gap: "4px", maxWidth: "85%",
        alignSelf: isUser ? "flex-end" : "flex-start"
      }
    });

    const bubbleColor = m.error ? "#991B1B" : (isUser ? userFg : S.botText);
    // Para mensajes del usuario, color de link = userFg con opacidad ligera.
    // Para mensajes del bot (y errores), color de link = color primario del cliente.
    const linkColor = isUser ? userFg : opts.primary;

    const bubble = el("div", {
      style: {
        padding: "9px 13px", fontSize: "14.5px", lineHeight: "1.45",
        borderRadius: "16px",
        borderBottomRightRadius: isUser ? "5px" : "16px",
        borderBottomLeftRadius: isUser ? "16px" : "5px",
        background: m.error ? "#FEE2E2" : (isUser ? opts.primary : S.botBubble),
        color: bubbleColor,
        border: m.error ? "1px solid #FECACA" : (isUser ? "none" : `1px solid ${S.line}`),
        wordBreak: "break-word"
      }
    });

    if (isUser) {
      // Usuario: texto plano (sin parsear markdown, para evitar inyecciones inesperadas)
      bubble.textContent = m.text;
      bubble.style.whiteSpace = "pre-wrap";
    } else {
      // Bot: renderiza markdown. Si por alguna razón falla, fallback a texto plano.
      try {
        bubble.innerHTML = renderMarkdown(m.text, linkColor);
      } catch (e) {
        if (typeof console !== "undefined") console.warn("[GeekAgentWidget] message render failed, falling back to plain:", e);
        bubble.textContent = m.text;
        bubble.style.whiteSpace = "pre-wrap";
      }
    }

    const time = el("span", {
      text: m.time,
      style: {
        fontSize: "10.5px", color: S.metaText, padding: "0 4px"
      }
    });

    wrap.appendChild(bubble);
    wrap.appendChild(time);
    return wrap;
  }

  // Typing indicator
  let typingEl: HTMLElement | null = null;
  function showTyping(show: boolean) {
    if (show && !typingEl) {
      typingEl = el("div", {
        className: "ga-msg-in",
        style: { alignSelf: "flex-start" }
      });
      const inner = el("div", {
        style: {
          display: "inline-flex", gap: "4px", alignItems: "center",
          padding: "12px 14px", background: S.botBubble,
          border: `1px solid ${S.line}`, borderRadius: "16px",
          borderBottomLeftRadius: "5px"
        }
      });
      for (let i = 0; i < 3; i++) {
        inner.appendChild(el("span", {
          className: "ga-dot",
          style: {
            width: "7px", height: "7px", borderRadius: "99px",
            background: S.muted, display: "inline-block",
            animationDelay: `${i * 0.16}s`
          }
        }));
      }
      typingEl.appendChild(inner);
      scroller.appendChild(typingEl);
      statusText.textContent = t(opts.lang, "typing");
      scrollBottom();
    } else if (!show && typingEl) {
      typingEl.remove();
      typingEl = null;
      statusText.textContent = t(opts.lang, "online");
    }
  }

  function scrollBottom() {
    setTimeout(() => { scroller.scrollTop = scroller.scrollHeight; }, 30);
  }

  // ─── COMPOSER ─────────────────────────────────────────────
  const composer = el("div", {
    style: {
      borderTop: `1px solid ${S.line}`,
      background: S.panel,
      padding: opts.fullscreen
        ? "12px 14px calc(12px + env(safe-area-inset-bottom))"
        : "12px 14px 10px",
      flexShrink: "0",
      width: "100%",
      maxWidth: "100%",
      overflow: "hidden"
    }
  });

  const form = el("form", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      width: "100%",
      maxWidth: "100%"
    }
  });

  const input = el("input", {
    className: "ga-input",
    attrs: {
      type: "text",
      placeholder: t(opts.lang, "placeholder"),
      "aria-label": t(opts.lang, "placeholder")
    },
    style: {
      flex: "1 1 auto",
      minWidth: "0", // permite shrink debajo del intrinsic size
      width: "100%",
      border: `1px solid ${S.line}`,
      background: S.inputBg,
      color: S.inputText, // ← fix: NUNCA blanco
      borderRadius: "999px",
      padding: "11px 16px",
      fontSize: "16px", // ≥16px en mobile evita el zoom automático de iOS al hacer focus
      outline: "none",
      fontFamily: opts.fontFamily,
      transition: "border-color 150ms ease, box-shadow 150ms ease"
    }
  }) as HTMLInputElement;
  input.style.setProperty("--ga-accent", opts.primary);

  const sendBtn = el("button", {
    className: "ga-send",
    html: iconSend(fg),
    attrs: {
      type: "submit",
      "aria-label": t(opts.lang, "send"),
      disabled: "true"
    },
    style: {
      width: "42px",
      minWidth: "42px",
      height: "42px",
      flexShrink: "0",
      flexGrow: "0",
      borderRadius: "999px",
      border: "none",
      background: opts.primary,
      color: fg,
      cursor: "default",
      display: "grid",
      placeItems: "center",
      opacity: "0.45",
      padding: "0",
      transition: "opacity 150ms ease, transform 150ms ease"
    }
  }) as HTMLButtonElement;

  function refreshSendBtnState() {
    const has = input.value.trim().length > 0;
    sendBtn.disabled = !has;
    sendBtn.style.opacity = has ? "1" : "0.45";
    sendBtn.style.cursor = has ? "pointer" : "default";
  }
  input.addEventListener("input", refreshSendBtnState);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const txt = input.value.trim();
    if (!txt) return;
    opts.onSend(txt);
    input.value = "";
    refreshSendBtnState();
  });

  form.appendChild(input);
  form.appendChild(sendBtn);

  // Powered by
  const powered = el("a", {
    className: "ga-powered",
    attrs: { href: "https://geekagent.io", target: "_blank", rel: "noopener" },
    style: {
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: "5px", marginTop: "8px", textDecoration: "none",
      userSelect: "none", whiteSpace: "nowrap"
    }
  });
  powered.appendChild(el("span", {
    text: t(opts.lang, "poweredBy"),
    style: {
      fontFamily: "ui-monospace, 'JetBrains Mono', monospace",
      fontSize: "9px", letterSpacing: "0.04em",
      textTransform: "uppercase", color: S.metaText, whiteSpace: "nowrap"
    }
  }));
  const isoWrap = el("span", {
    className: "ga-iso-wrap",
    html: isotipoSvg(13)
  });
  powered.appendChild(isoWrap);
  powered.appendChild(el("span", {
    text: "Geek Agent",
    style: {
      fontFamily: "ui-monospace, 'JetBrains Mono', monospace",
      fontSize: "9.5px", letterSpacing: "0.04em",
      color: S.muted, fontWeight: "500", whiteSpace: "nowrap"
    }
  }));

  composer.appendChild(form);
  composer.appendChild(powered);

  // Banner de handoff — oculto por default
  const handoffBanner = el("div", {
    style: {
      display: "none",
      padding: "8px 14px",
      background: "#FEF3C7",
      borderTop: `1px solid ${S.line}`,
      color: "#92400E",
      fontSize: "12.5px",
      lineHeight: "1.4",
      textAlign: "center"
    }
  });
  handoffBanner.innerHTML = `<strong>🙋 Un asesor te está atendiendo</strong><br>Tu mensaje irá directo al equipo.`;

  root.appendChild(header);
  root.appendChild(scroller);
  root.appendChild(handoffBanner);
  root.appendChild(composer);

  return {
    root,
    setTyping(b) { showTyping(b); },
    appendMessage(m) {
      scroller.appendChild(renderMessage(m, true));
      scrollBottom();
    },
    setMessages(list) {
      scroller.innerHTML = "";
      for (const m of list) scroller.appendChild(renderMessage(m, false));
      scrollBottom();
    },
    setHandoff(active: boolean) {
      handoffBanner.style.display = active ? "block" : "none";
      // Quita typing (no aplica en handoff)
      if (active) showTyping(false);
      // Cambia el placeholder del input
      input.placeholder = active
        ? (opts.lang === "en" ? "Message the agent…" : "Escribe al asesor…")
        : t(opts.lang, "placeholder");
      // Cambia el texto de status del header
      statusText.textContent = active
        ? (opts.lang === "en" ? "Agent is helping you" : "Asesor atendiéndote")
        : t(opts.lang, "online");
    },
    pulseDot() {
      nameDot.className = "";
      // force reflow para reiniciar la animación
      void (nameDot as HTMLElement).offsetWidth;
      nameDot.className = "ga-dot-wink";
    },
    focusInput() { input.focus(); }
  };
}
