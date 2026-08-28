// Tokens del Manual de Marca Sweepstouch — Identidad de Marca 2026.
//
// Fuente única de estos valores: si un color o un tamaño no está acá, no está en
// el manual. Antes cada pantalla los repetía a ojo y por eso convivían tres
// rosas distintos en la misma tablet.

/* ── 4.1 Colores de la marca ──────────────────────────────────────────────── */
export const BRAND = {
  /** El color mandatario. Se reserva para acción: botones, precios, CTAs. */
  magenta: "#FC0680",
  carbon: "#3F3F3F",
  black: "#000000",
  grayLight: "#E6E7E8",
  white: "#FFFFFF",
} as const;

/* ── 4.2 Tintas y variaciones ─────────────────────────────────────────────── */
/** Escala del magenta. Para estados de interfaz (hover, disabled) y fondos suaves. */
export const MAGENTA = {
  100: "#FC0680",
  75: "#FD44A0",
  50: "#FE82C0",
  25: "#FEC1DF",
  10: "#FFE6F2",
} as const;

/** Escala de neutros, del carbón al blanco. */
export const NEUTRAL = {
  100: "#1A1A1A",
  75: "#3F3F3F",
  50: "#7A7A7A",
  25: "#E6E7E8",
  10: "#F7F7F7",
} as const;

/* ── 4.4 Contraste y accesibilidad ────────────────────────────────────────────
   Magenta sobre blanco da 3.83:1 — por debajo del mínimo AA (4.5:1) para texto de
   cuerpo. Sólo titulares grandes, botones e iconografía. Nunca párrafos ni legal.
   Carbón sobre blanco: 10.53:1. Negro suave: 15.72:1 en ambos sentidos.        */

/* ── 4.3 Proporción de uso ────────────────────────────────────────────────────
   60% blanco / gris claro · 25% carbón · 15% magenta. Las superficies son la
   base clara: "el blanco y el gris claro dan aire y legibilidad".            */
export const SURFACE = {
  /** Fondo de pantalla. */
  page: "#FFFFFF",
  /** Tarjetas y paneles sobre el fondo. */
  raised: "#F7F7F7",
  /** Zonas hundidas o seleccionadas. */
  sunken: "#E6E7E8",
  /** Hairlines: el gris claro de la paleta, no un gris inventado. */
  line: "#E6E7E8",
  /** Titulares. Negro suave: 15.72:1 sobre blanco. */
  text: "#1A1A1A",
  /** Texto de cuerpo. Carbón: 10.53:1 sobre blanco (4.4). */
  textBody: "#3F3F3F",
  /** Secundario y etiquetas. */
  textMuted: "#7A7A7A",
  /** Único negro que queda: el interior del visor, donde va el video. */
  viewfinder: "#000000",
  onDarkFaint: "rgba(255,255,255,0.62)",
} as const;

/** Semánticos. No son colores de marca: sólo estado (validado, error, alerta). */
export const STATE = {
  ok: "#1E9E63",
  okSoft: "rgba(30,158,99,0.14)",
  warn: "#B76E00",
  warnSoft: "rgba(183,110,0,0.14)",
  error: "#D32F2F",
  errorSoft: "rgba(211,47,47,0.12)",
} as const;

/* ── 5.6 Escala tipográfica ───────────────────────────────────────────────────
   Gotham es la familia oficial (5.5). Es comercial (Hoefler&Co) y no está en el
   proyecto, así que `--font-brand` resuelve hoy a Montserrat — geométrica, misma
   construcción de círculo y cuadrado que describe 5.1. Al comprar la licencia,
   se cambia sólo la fuente en layout.tsx y todo lo de abajo la hereda.        */
export const FONT = "var(--font-brand), Montserrat, system-ui, sans-serif";

/** Pesos del manual (5.4): Black 900, Bold 700, Medium 500, Book 400, Light 300. */
export const W = {
  black: 900,
  bold: 700,
  /** Botones y CTA. */
  medium: 500,
  /** Cuerpo de interfaz. */
  book: 400,
  light: 300,
} as const;

/** Jerarquía 5.6. `size` en px, `ls` = letter-spacing, `lh` = line-height. */
export const TYPE = {
  h1: { fontSize: 48, fontWeight: W.black, letterSpacing: "-1px", lineHeight: 1.1 },
  h2: { fontSize: 36, fontWeight: W.black, letterSpacing: "-0.5px", lineHeight: 1.15 },
  h3: { fontSize: 28, fontWeight: W.bold, letterSpacing: 0, lineHeight: 1.2 },
  h4: { fontSize: 20, fontWeight: W.medium, letterSpacing: 0, lineHeight: 1.3 },
  body: { fontSize: 16, fontWeight: W.book, letterSpacing: 0, lineHeight: 1.5 },
  small: { fontSize: 13, fontWeight: W.light, letterSpacing: 0, lineHeight: 1.4 },
  caption: {
    fontSize: 11,
    fontWeight: W.medium,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    lineHeight: 1.3,
  },
} as const;

/* ── 6.3 Lenguaje de iconos ───────────────────────────────────────────────────
   "Relleno sólido, sin contornos finos. Un solo color por ícono. Nunca degrada-
   dos." En MUI eso son las variantes Rounded/Filled, no las Outlined.         */

/** Radio de esquina: la geometría redondeada del isotipo, aplicada a la UI. */
export const RADIUS = { sm: 8, md: 12, lg: 16, pill: 999 } as const;
