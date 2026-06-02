# Geek Agent Widget

Widget de chat embebible para sitios de terceros. Bundle UMD único, sin dependencias en runtime, sin CSS externo. Se sirve desde `https://widget.geekagent.io/widget.umd.js` y se monta con un snippet de 3 líneas.

## Instalación en un sitio

```html
<script src="https://widget.geekagent.io/widget.umd.js"></script>
<script>
  GeekAgentWidget.init({
    apiBase: "https://app.geekagent.io",
    botId: "<tu-bot-id>",
    apiKey: "<tu-api-key>"
  });
</script>
```

### Opciones (`InitOptions`)

| Opción | Default | Descripción |
|---|---|---|
| `apiBase` | `https://app.geekagent.io` | Base URL del API |
| `botId` | **requerido** | UUID del bot |
| `apiKey` | **requerido** | `ga_…` API key activa del bot |
| `title` | nombre del bot (theme) | Override del nombre que muestra el header |
| `welcome` | welcome_message del bot | Override del mensaje inicial |
| `theme` | `"light"` | `"light"` o `"dark"` |
| `lang` | `"es"` | `"es"` o `"en"` (copy del chrome) |
| `position` | `"right"` | `"right"` o `"left"` |
| `appearance` | del bot | Override visual (primaryColor, logoUrl, etc.) |

El widget hace `GET /widget/theme` con la API key al montarse y resuelve el color, logo, fuente, tamaño, nombre y welcome message del bot. Los overrides de `init()` ganan sobre el theme remoto.

## Desarrollo local

```bash
npm install
npm run dev   # demo en http://localhost:5173 (apunta a localhost:4000)
npm run build # genera dist/widget.umd.js
```

Edita `index.html` para apuntar a tu API/botId/apiKey de desarrollo.

## Diseño

Implementación pixel-perfect del bundle de diseño en `/design_widget` (handoff de Claude Design). Estados:

1. **Launcher** — squircle 60×60, logo o iniciales del bot, badge de unread
2. **Panel** — header con avatar + status, lista de mensajes, composer con input + send, "powered by"
3. **Minimizado** — colapsa al launcher (mantiene la conversación)

Cumple las restricciones:
- Vanilla TS, sin frameworks
- CSS inline + `<style>` con animaciones scoped a `.ga-*`
- Single bundle UMD (`widget.umd.js`)
- `< 50 KB` gzipped: **~8 KB** actualmente
- `z-index: 99999`
- A11y: `aria-label`, `aria-expanded`, `role="dialog"`, navegable por teclado
- Mobile: pantalla completa en `< 768px`
- `prefers-reduced-motion` respetado
- LocalStorage para persistencia de conversación

## Deploy a `widget.geekagent.io`

El bundle `dist/widget.umd.js` se sirve estáticamente. Cualquier servicio (Coolify static, S3+CloudFront, Bunny, Vercel) funciona.

Si reemplazas el widget actual, no rompe nada — la API pública del init es la misma.

## Endpoints que consume

| Endpoint | Para qué |
|---|---|
| `GET /widget/theme` | Color, logo, fuente, nombre, welcome_message |
| `POST /widget/chat` | Mensaje del usuario → respuesta del bot |

Ambos validan la `x-api-key` y el `Origin` permitido del bot.

## Estructura

```
src/
├── widget.ts      # entry point (init), orquesta state + render
├── launcher.ts    # botón flotante (estado cerrado/abierto)
├── panel.ts       # chat completo (header, mensajes, composer)
├── api.ts         # fetch /widget/theme y /widget/chat
├── theme.ts       # tokens de superficie (light/dark)
├── strings.ts     # i18n es/en
├── isotipo.ts     # SVG inline del logo Geek Agent
├── styles.ts      # CSS inyectado (animaciones)
└── helpers.ts     # readableOn, initials, fmtTime, el()
```
