/** SVG inline del isotipo Geek Agent (g>). */
export function isotipoSvg(size = 13, fill = "#4AF48F", glyph = "#080815"): string {
  return `<svg width="${size}" height="${size}" viewBox="224.5 165 50 50" aria-hidden="true" style="display:block">
    <path d="M269.5,165L229.5,165C226.739,165 224.5,167.239 224.5,170L224.5,210C224.5,212.761 226.739,215 229.5,215L269.5,215C272.262,215 274.5,212.761 274.5,210L274.5,170C274.5,167.239 272.262,165 269.5,165Z" fill="${fill}"/>
    <path d="M253.45,196.545C253.45,202.73 249.677,205 245.597,205C242.76,205 240.273,203.512 239.34,202.65C239.038,202.387 238.958,201.947 239.145,201.592L239.922,200.457C240.195,200.027 240.66,200.028 241.087,200.42C242.06,201.243 243.617,202.337 245.597,202.337C248.435,202.337 250.613,200.773 250.613,196.545L250.613,196.605L253.45,194.672L253.45,196.545ZM245.392,174.997C247.332,175.005 249.217,175.65 250.757,176.837L251.03,176.017C251.225,175.667 251.418,175.392 251.885,175.392L252.427,175.392C252.9,175.407 253.288,175.777 253.323,176.252L253.323,190.453L250.485,192.297C249.03,193.335 247.293,193.895 245.51,193.903C240.573,193.903 236.998,189.595 236.998,184.43C236.998,179.265 240.495,174.998 245.392,174.997ZM257.917,179.06C258.032,179.047 258.146,179.078 258.241,179.14L266.71,184.823C266.87,184.928 266.975,185.101 266.998,185.29L266.998,185.427C266.988,185.62 266.89,185.795 266.735,185.908L258.53,191.832C258.31,191.995 258.003,191.947 257.84,191.725C257.773,191.633 257.738,191.518 257.746,191.403L257.712,189.932C257.708,189.735 257.811,189.55 257.978,189.453L263.292,185.432L257.797,181.575C257.618,181.477 257.505,181.287 257.51,181.08L257.478,179.605C257.451,179.333 257.648,179.088 257.917,179.06ZM245.708,177.66C242.13,177.66 239.916,180.87 239.916,184.392C239.916,188.307 242.48,191.243 245.9,191.243C248.383,191.243 250.44,189.761 250.448,189.755L250.45,189.752L250.45,179.85C250.432,179.829 248.609,177.66 245.708,177.66Z" fill="${glyph}"/>
  </svg>`;
}

/** Chevron down (para el toggle del launcher cuando está abierto). */
export function chevronDownSvg(color: string, size = 22): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 9l6 6 6-6" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

/** Icono minimizar (línea horizontal). */
export function iconMinimize(color: string, size = 18): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`;
}

/** Icono cerrar (X). */
export function iconClose(color: string, size = 18): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`;
}

/** Icono enviar (flecha derecha). */
export function iconSend(color: string, size = 18): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true" style="margin-left:1px">
    <path d="M4 12h14M12 5l7 7-7 7" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}
