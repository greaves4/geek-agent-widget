export type Lang = "es" | "en";

type S = { es: string; en: string };

export const STR = {
  online:      { es: "En línea", en: "Online" },
  placeholder: { es: "Escribe un mensaje…", en: "Type a message…" },
  poweredBy:   { es: "con tecnología de", en: "powered by" },
  send:        { es: "Enviar mensaje", en: "Send message" },
  minimize:    { es: "Minimizar", en: "Minimize" },
  close:       { es: "Cerrar chat", en: "Close chat" },
  open:        { es: "Abrir chat", en: "Open chat" },
  typing:      { es: "escribiendo…", en: "typing…" },
  welcomeEs:   { es: "¡Hola! Soy tu asistente. ¿En qué puedo ayudarte hoy?", en: "Hi there — I'm your assistant. How can I help today?" },
  errKey:      { es: "Clave API inválida. Revisa la instalación del widget.", en: "Invalid API key. Check the widget installation." },
  errOrigin:   { es: "El dominio de tu sitio no está permitido para este chat.", en: "Your site domain is not allowed for this chat." },
  errRate:     { es: "Demasiados mensajes en poco tiempo. Espera un minuto.", en: "Too many messages too quickly. Wait a minute." },
  errHandoff:  { es: "Esta conversación fue transferida a un asesor humano.", en: "This conversation was handed off to a human agent." },
  errGeneric:  { es: "No se pudo conectar con el servidor.", en: "Couldn't connect to the server." },
} as const satisfies Record<string, S>;

export function t(lang: Lang, key: keyof typeof STR): string {
  return STR[key][lang] || STR[key].es;
}
