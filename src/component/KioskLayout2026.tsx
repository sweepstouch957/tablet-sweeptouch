"use client";

// Kiosco 2026 — piloto. Réplica del diseño entregado (Interfaz de kiosco), en
// sus dos orientaciones.
//
// CÓMO SE MANTIENE IDÉNTICO Y RESPONSIVE A LA VEZ
// El diseño viene con medidas absolutas: 1280×768 apaisado y 768×1280 vertical.
// En lugar de volver a derivar cada número a %, vw o breakpoints — que es donde
// un "casi igual" se cuela — se dibuja al tamaño nativo y se escala entero con
// un `transform: scale()`. La proporción queda exacta en cualquier tablet, y
// cambiar el diseño después es cambiar los mismos números que trae el archivo.
//
// La orientación se elige por la relación de aspecto real de la ventana, no por
// un breakpoint de ancho: una tablet de 800px de ancho puede estar en horizontal
// o en vertical y el layout tiene que seguirla.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Store } from "@/services/store.service";
import { useActiveSweepstake } from "@/hooks/useActiveSwepake";
import { usePromos } from "@/hooks/usePromos";
import { createSweepstake } from "@/services/sweepstake.service";
import { ThankYouModal } from "./success-dialog";
import PrivacyDialog from "./pannel";
import LoginDialogCashiers from "./login-dialog-cashiers";
import CashierDrawer from "./cahierDrawer";
import ScanListDialog from "./ScanListDialog";
import { useAuth } from "@/context/auth-context";

/* ── Medidas nativas del diseño ─────────────────────────────────────────── */
const LAND = { w: 1280, h: 768 };
const PORT = { w: 768, h: 1280 };

/* ── Arte de demo ────────────────────────────────────────────────────────────
   Sale del propio archivo de diseño (sus huecos venían con las imágenes
   embebidas). Es el respaldo mientras la tienda no tenga promos cargadas: sin
   esto el kiosco del piloto se ve con recuadros punteados en sala.

   El logo de la tienda tiene dos versiones porque el hueco no tiene la misma
   forma en cada diseño: apaisado es 104×62 y vertical 104×52. Un solo archivo
   largo se achica de más en uno de los dos. */
const DEMO = {
  logoH: "/kiosk2026/logo-horizontal.webp",
  logoV: "/kiosk2026/logo-vertical.webp",
  dealsArt: "/kiosk2026/deals-art.webp",
  bottomV: "/kiosk2026/bottom-promo-v.webp",
} as const;

/* ── Arte del opt-in (WIN A FREE TV) ─────────────────────────────────────────
   Vienen las dos orientaciones porque los huecos son opuestos: en apaisado el
   panel es alto y angosto (343×500) y en vertical el hero es una franja ancha
   (768×232). Estirar una sola version en el otro hueco recorta el titular o el
   "1 LUCKY WINNER", que es justo lo que la pieza tiene que comunicar. */
const OPTIN_V = "/optin-vertical.png";
const OPTIN_H = "/optin-horizontal.png";

/* ── Colores del diseño ─────────────────────────────────────────────────── */
const PINK = "#E6007E";
const PINK_DK = "#c40068";
const INK = "#16182f";
const FONT = "var(--font-archivo), Archivo, 'Segoe UI', sans-serif";

const LEGAL =
  "By checking this box, you agree to receive recurring promotional text messages from Sweepstouch, including sales, coupons, and promotional offers. Message frequency varies. Message and data rates may apply. Reply STOP to opt out and HELP for help. View our Terms and Conditions and Privacy Policy.";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Formato del diseño: (555) 555-5555, construido a medida que se teclea. */
function formatDigits(d: string) {
  if (!d.length) return "";
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/**
 * Escala el lienzo nativo para que entre completo en la ventana.
 *
 * `Math.min` de las dos razones: nunca recorta ni deforma, sólo deja franjas
 * negras si la tablet no comparte la proporción del diseño — que es lo correcto
 * cuando el pedido es "idéntico".
 */
function useFitScale(base: { w: number; h: number }) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () =>
      setScale(Math.min(window.innerWidth / base.w, window.innerHeight / base.h));
    fit();
    window.addEventListener("resize", fit);
    window.addEventListener("orientationchange", fit);
    return () => {
      window.removeEventListener("resize", fit);
      window.removeEventListener("orientationchange", fit);
    };
  }, [base.w, base.h]);
  return scale;
}

/**
 * Qué diseño se muestra.
 *
 * Manda `?orientation=` cuando viene en la URL: la tablet queda clavada en el
 * diseño que el local necesita y no depende de girarla ni de que el navegador
 * reporte bien la pantalla — en un kiosco montado en pared eso no se puede
 * andar probando. Sin el parametro cae al automatico por relacion de aspecto.
 *
 * Acepta vertical|v|portrait y horizontal|h|landscape.
 */
function useIsPortrait(forced?: string | null) {
  const [autoPortrait, setAutoPortrait] = useState(false);
  useEffect(() => {
    const read = () => setAutoPortrait(window.innerHeight > window.innerWidth);
    read();
    window.addEventListener("resize", read);
    window.addEventListener("orientationchange", read);
    return () => {
      window.removeEventListener("resize", read);
      window.removeEventListener("orientationchange", read);
    };
  }, []);

  const f = (forced || "").trim().toLowerCase();
  if (f === "vertical" || f === "v" || f === "portrait") return true;
  if (f === "horizontal" || f === "h" || f === "landscape") return false;
  return autoPortrait;
}

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  // null hasta el primer efecto: el server no puede renderizar una hora.
  if (!now) return { dateShort: "", timeShort: "" };
  let h = now.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    dateShort: `${MONTHS[now.getMonth()].slice(0, 3)} ${now.getDate()}, ${now.getFullYear()}`,
    timeShort: `${h}:${pad(now.getMinutes())} ${ampm}`,
  };
}

/* ── Piezas compartidas entre las dos orientaciones ─────────────────────── */

const IconGift = ({ size = 38 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={PINK} strokeWidth="1.8">
    <rect x="3" y="9" width="18" height="12" rx="1" />
    <path d="M3 9 h18 M12 9 v12 M12 9 c-4 0 -6 -2 -5 -4 c1 -2 4 -1 5 4 c1 -5 4 -6 5 -4 c1 2 -1 4 -5 4" />
  </svg>
);

const IconPhone = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
    <path d="M6.6 10.8a15.9 15.9 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.6 1 1 0 0 1-.25 1z" />
  </svg>
);

const IconScan = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#9a9a9a" strokeWidth="2">
    <path d="M4 8 V5 a1 1 0 0 1 1-1 h3 M16 4 h3 a1 1 0 0 1 1 1 v3 M20 16 v3 a1 1 0 0 1-1 1 h-3 M8 20 H5 a1 1 0 0 1-1-1 v-3 M4 12 h16" />
  </svg>
);

const IconBackspace = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={PINK}>
    <path d="M8.4 5 h12 a1.6 1.6 0 0 1 1.6 1.6 v10.8 a1.6 1.6 0 0 1-1.6 1.6 h-12 L2 12z" />
    <path d="M11.5 9.5 l5 5 M16.5 9.5 l-5 5" stroke="#fff" strokeWidth="1.8" />
  </svg>
);

const IconSend = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
    <path d="M2 21 L23 12 L2 3 L2 10 L17 12 L2 14 Z" />
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="3.4">
    <path d="M4 13 l5 5 L20 6" />
  </svg>
);

/** Relleno de un hueco de imagen: la foto real si existe, si no el placeholder. */
function Slot({
  src,
  label,
  fit = "cover",
  radius = 0,
  bg,
}: {
  src?: string;
  label: string;
  fit?: "cover" | "contain";
  radius?: number;
  /** Relleno detrás de un `contain`, para que las bandas no canten. */
  bg?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={label}
        style={{
          width: "100%",
          height: "100%",
          objectFit: fit,
          display: "block",
          borderRadius: radius,
          background: bg,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: radius,
        background: "#211018",
        border: "1px dashed rgba(255,255,255,.28)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,.55)",
        fontSize: 13,
        textAlign: "center",
        padding: 12,
        boxSizing: "border-box",
      }}
    >
      {label}
    </div>
  );
}

interface KeypadProps {
  onDigit: (n: string) => void;
  onBackspace: () => void;
  onSend: () => void;
  /** Alto de cada tecla; es lo único que cambia entre orientaciones. */
  keyH: number;
  gap: number;
  /** El apaisado apila icono y palabra en DELETE/SEND; el vertical los alinea. */
  stacked: boolean;
  sending: boolean;
}

function Keypad({ onDigit, onBackspace, onSend, keyH, gap, stacked, sending }: KeypadProps) {
  const key: React.CSSProperties = {
    height: keyH,
    background: "#fff",
    border: "1px solid #d9d9d9",
    borderRadius: 10,
    fontSize: 32,
    fontWeight: stacked ? 400 : 700,
    fontFamily: FONT,
    color: INK,
    cursor: "pointer",
    padding: 0,
  };
  const action: React.CSSProperties = {
    ...key,
    display: "flex",
    flexDirection: stacked ? "column" : "row",
    alignItems: "center",
    justifyContent: "center",
    gap: stacked ? 2 : 8,
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap, width: "100%" }}>
      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
        <button key={n} type="button" style={key} onClick={() => onDigit(n)}>
          {n}
        </button>
      ))}
      <button type="button" style={action} onClick={onBackspace} aria-label="Borrar">
        <IconBackspace size={stacked ? 26 : 30} />
        {stacked && (
          <span style={{ color: PINK, fontSize: 14, fontWeight: 800, letterSpacing: 1, fontFamily: FONT }}>
            DELETE
          </span>
        )}
      </button>
      <button type="button" style={key} onClick={() => onDigit("0")}>
        0
      </button>
      <button
        type="button"
        onClick={onSend}
        disabled={sending}
        style={{
          ...action,
          background: sending ? PINK_DK : PINK,
          border: "none",
          cursor: sending ? "default" : "pointer",
        }}
      >
        <IconSend size={stacked ? 26 : 24} />
        <span style={{ color: "#fff", fontSize: stacked ? 16 : 20, fontWeight: 800, letterSpacing: 1, fontFamily: FONT }}>
          SEND
        </span>
      </button>
    </div>
  );
}

function Display({ digits, height }: { digits: string; height: number }) {
  return (
    <div
      style={{
        width: "100%",
        height,
        minHeight: height,
        background: "#efefef",
        border: "1px solid #d9d9d9",
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        fontSize: 24,
        letterSpacing: 1,
        overflow: "hidden",
        whiteSpace: "nowrap",
        boxSizing: "border-box",
      }}
    >
      <span style={{ color: digits ? INK : "#b0b3b8" }}>
        {digits ? formatDigits(digits) : "(555) 5555-5555"}
      </span>
    </div>
  );
}

function Consent({
  checked,
  onToggle,
  align,
  width,
  onLegal,
}: {
  checked: boolean;
  onToggle: () => void;
  align: "right" | "center";
  width?: number;
  onLegal: () => void;
}) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <div
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onToggle();
        }}
        style={{
          width: 20,
          height: 20,
          border: "1.5px solid #9aa0a6",
          borderRadius: 4,
          background: "#fff",
          flex: "0 0 auto",
          marginTop: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        {checked && <IconCheck />}
      </div>
      <div
        onClick={onLegal}
        style={{
          fontSize: align === "right" ? 12.5 : 12,
          color: "#8a8f98",
          lineHeight: align === "right" ? 1.45 : 1.4,
          textAlign: align,
          width,
          cursor: "pointer",
        }}
      >
        {LEGAL}
      </div>
    </div>
  );
}

function LegalLinks({ centered, onOpen }: { centered: boolean; onOpen: () => void }) {
  const a: React.CSSProperties = centered
    ? { color: INK, fontWeight: 700, textDecoration: "none", cursor: "pointer" }
    : { color: "#6b7280", textDecoration: "underline", cursor: "pointer" };
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        alignItems: "center",
        justifyContent: centered ? "center" : "flex-start",
        marginTop: centered ? 6 : 4,
        fontSize: 13,
      }}
    >
      <span style={a} onClick={onOpen}>
        Terms and Conditions
      </span>
      <span style={{ color: "#9aa0a6" }}>|</span>
      <span style={a} onClick={onOpen}>
        Privacy Policy
      </span>
    </div>
  );
}

function BottomIcons({
  height,
  iconH,
  onCashier,
  onSupport,
  rounded,
}: {
  height: number;
  /** 26px en apaisado, 28px en vertical: los diseños no coinciden. */
  iconH: number;
  onCashier: () => void;
  onSupport: () => void;
  rounded: boolean;
}) {
  const half: React.CSSProperties = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#000",
    border: "none",
    cursor: "pointer",
    padding: 0,
  };
  return (
    <div style={{ height, flex: "0 0 auto", background: "#000", display: "flex" }}>
      <button
        type="button"
        onClick={onCashier}
        aria-label="Cajero"
        style={{ ...half, borderRadius: rounded ? "0 14px 0 0" : 0 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kiosk2026/cashier-icon.svg" alt="Cajero" style={{ height: iconH, width: "auto", display: "block" }} />
      </button>
      <div style={{ width: 2, background: "#fff", margin: rounded ? 0 : "8px 0" }} />
      <button
        type="button"
        onClick={onSupport}
        aria-label="Soporte técnico"
        style={{ ...half, borderRadius: rounded ? "14px 0 0 0" : 0 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kiosk2026/tec-support-icon.svg" alt="Soporte técnico" style={{ height: iconH, width: "auto", display: "block" }} />
      </button>
    </div>
  );
}

/* ── Componente ─────────────────────────────────────────────────────────── */

interface Props {
  store?: Store;
}

export default function KioskLayout2026({ store }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const portrait = useIsPortrait(searchParams.get("orientation"));
  const base = portrait ? PORT : LAND;
  const scale = useFitScale(base);
  const { dateShort, timeShort } = useClock();

  const { data: sweepstake } = useActiveSweepstake(store?._id);
  const { data: promos } = usePromos("tablet", store?._id);

  const [digits, setDigits] = useState("");
  const [consent, setConsent] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [thanksOpen, setThanksOpen] = useState(false);
  const [error, setError] = useState("");

  const art = useMemo(() => (promos || []).map((p) => p.imageMobile).filter(Boolean), [promos]);

  const addDigit = useCallback((n: string) => {
    setError("");
    setDigits((d) => (d.length >= 10 ? d : d + n));
  }, []);

  const { mutate: register, isPending } = useMutation({
    mutationFn: () =>
      createSweepstake({
        sweepstakeId: sweepstake?._id || "",
        storeId: store?._id || "",
        customerPhone: digits,
        customerName: "",
        method: "tablet",
        createdBy: user?._id || "",
      }),
    onSuccess: () => {
      setThanksOpen(true);
      setDigits("");
      setConsent(false);
    },
    onError: (e: unknown) => setError(typeof e === "string" ? e : "No se pudo registrar. Intenta de nuevo."),
  });

  const send = useCallback(() => {
    // El consentimiento se pide ANTES de mandar, no después: sin marca expresa
    // no hay opt-in valido bajo TCPA, y el registro no debe salir.
    if (digits.length !== 10) {
      setError("Ingresa los 10 dígitos de tu número.");
      return;
    }
    if (!consent) {
      setError("Marca la casilla para aceptar recibir mensajes.");
      return;
    }
    register();
  }, [digits, consent, register]);

  const openCashier = () => (user ? setDrawerOpen(true) : setLoginOpen(true));
  const openSupport = () => router.push("/control-soporte");

  /* ── Marco: centra y escala el lienzo nativo ─────────────────────────── */
  const Frame = ({ children }: { children: React.ReactNode }) => (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: base.w,
          height: base.h,
          flex: "0 0 auto",
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          background: "#000",
          position: "relative",
          overflow: "hidden",
          fontFamily: FONT,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );

  const dialogs = (
    <>
      <ScanListDialog open={scanOpen} onClose={() => setScanOpen(false)} />
      <PrivacyDialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <ThankYouModal open={thanksOpen} onClose={() => setThanksOpen(false)} isGeneric />
      <LoginDialogCashiers open={loginOpen} onClose={() => setLoginOpen(false)} storeId={store?._id} />
      <CashierDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} storeId={store?._id} />
    </>
  );

  const errorLine = error ? (
    <div style={{ color: PINK, fontSize: 13, fontWeight: 700, marginTop: 6 }}>{error}</div>
  ) : null;

  /* ══ VERTICAL ══════════════════════════════════════════════════════════ */
  if (portrait) {
    return (
      <>
        <Frame>
          {/* TOP BAR */}
          <div
            style={{
              height: 64,
              flex: "0 0 auto",
              background: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 24px",
            }}
          >
            <div style={{ width: 170, height: 54 }}>
              <Slot src={store?.image || DEMO.logoV} label={store?.name || "LOGO TIENDA"} fit="contain" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/kiosk2026/sweepstouch-logo.png"
                alt="sweepsTOUCH"
                style={{ width: 112, height: "auto", display: "block", flex: "0 0 auto" }}
              />
              <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.35)" }} />
              <div style={{ color: "#fff", fontSize: 17, lineHeight: 1.3, whiteSpace: "nowrap" }}>
                {dateShort}
                <br />
                {timeShort}
              </div>
            </div>
          </div>

          {/* HERO */}
          <div style={{ height: 232, flex: "0 0 auto", position: "relative" }}>
            {/* `contain` sobre negro: el arte es 2.36:1 y la franja 3.31:1, así que
                `cover` se comía casi un tercio del alto — con el "1 LUCKY WINNER"
                adentro. El fondo del arte ya es negro, así que no se nota borde. */}
            <Slot src={OPTIN_H} label="Gana una TV gratis" fit="contain" bg="#000" />
          </div>

          {/* BANNER QR */}
          <div
            style={{
              flex: "0 0 auto",
              margin: "14px 20px 0",
              background: PINK,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "13px 24px",
            }}
          >
            <div
              style={{
                width: 78,
                height: 56,
                borderRadius: 12,
                background: "rgba(255,255,255,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "0 0 auto",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/kiosk2026/list-icon.png" alt="Lista de compras" style={{ width: 54, height: "auto", display: "block" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#fff", fontSize: 23, fontWeight: 900, fontStyle: "italic", lineHeight: 1, textShadow: "0 1px 2px rgba(0,0,0,0.15)" }}>
                ¿YA TIENES TU LISTA?
              </div>
              <div style={{ color: "#f2f2f2", fontSize: 14.5, lineHeight: 1.15, marginTop: 2 }}>
                Escanea tu QR y recibe tu descuento
              </div>
            </div>
            <button
              type="button"
              onClick={() => setScanOpen(true)}
              style={{
                flex: "0 0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                background: "#f1f1f1",
                border: "1px solid #dcdcdc",
                borderRadius: 14,
                height: 56,
                padding: "0 22px",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
              }}
            >
              <IconScan size={22} />
              <span style={{ color: PINK, fontSize: 20, fontWeight: 900, fontStyle: "italic", letterSpacing: 1 }}>
                ESCANEAR
              </span>
            </button>
          </div>

          {/* TARJETA DE REGISTRO */}
          <div
            style={{
              flex: "0 0 auto",
              margin: "16px 20px 0",
              background: "#fff",
              borderRadius: "18px 18px 0 0",
              borderTop: `6px solid ${PINK}`,
              position: "relative",
              padding: "18px 30px 14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: "2px solid #f7b8d9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "0 0 auto",
                }}
              >
                <IconGift size={24} />
              </div>
              <div style={{ fontSize: 34, fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
                <span style={{ color: INK }}>REGISTER </span>
                <span style={{ color: PINK }}>AND WIN!</span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "22px solid transparent",
                  borderRight: "22px solid transparent",
                  borderTop: `16px solid ${PINK}`,
                  marginTop: 10,
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: PINK,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "0 0 auto",
                }}
              >
                <IconPhone size={20} />
              </div>
              <span style={{ fontSize: 23, color: INK }}>Enter your phone number.</span>
            </div>

            <div style={{ marginTop: 12 }}>
              <Display digits={digits} height={56} />
            </div>
            <div style={{ marginTop: 14 }}>
              <Keypad
                onDigit={addDigit}
                onBackspace={() => setDigits((d) => d.slice(0, -1))}
                onSend={send}
                keyH={62}
                gap={12}
                stacked={false}
                sending={isPending}
              />
            </div>
            {errorLine}

            <div style={{ marginTop: 12 }}>
              <Consent checked={consent} onToggle={() => setConsent((c) => !c)} align="center" onLegal={() => setPrivacyOpen(true)} />
            </div>
            <LegalLinks centered onOpen={() => setPrivacyOpen(true)} />
          </div>

          {/* PROMO INFERIOR */}
          <div style={{ flex: 1, minHeight: 0, margin: "0 20px", position: "relative", overflow: "hidden", background: "#fff" }}>
            <Slot src={art[0] || DEMO.bottomV} label="Descuentos exclusivos" fit="contain" />
          </div>

          <div style={{ marginTop: 12 }}>
            <BottomIcons height={52} iconH={28} onCashier={openCashier} onSupport={openSupport} rounded={false} />
          </div>
        </Frame>
        {dialogs}
      </>
    );
  }

  /* ══ APAISADO ══════════════════════════════════════════════════════════ */
  return (
    <>
      <Frame>
        {/* TOP BAR */}
        <div style={{ height: 88, background: "#000", display: "flex", alignItems: "stretch", position: "relative", flex: "0 0 auto" }}>
          <div
            style={{
              width: 280,
              flex: "0 0 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              paddingLeft: 30,
            }}
          >
            {/* La tienda va primero: es la marca que el cliente reconoce al
                entrar, y Sweepstouch queda como el "powered by" del otro extremo. */}
            <div style={{ width: 210, height: 66 }}>
              <Slot src={store?.image || DEMO.logoH} label={store?.name || "LOGO TIENDA"} fit="contain" />
            </div>
          </div>

          {/* panel blanco inclinado */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "0 52px 0 34px",
              clipPath: "polygon(38px 0, 100% 0, calc(100% - 38px) 100%, 0 100%)",
              marginRight: 12,
              position: "relative",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                border: "2px solid #f7b8d9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "0 0 auto",
              }}
            >
              <IconGift size={38} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.5px", lineHeight: 1.1, whiteSpace: "nowrap" }}>
                <span style={{ color: INK }}>GET DEALS </span>
                <span style={{ color: PINK }}>ON YOUR PHONE</span>
              </div>
              <div style={{ fontSize: 18, color: INK, marginTop: 4 }}>
                Enter your phone number to join for free.
              </div>
            </div>
          </div>

          {/* logo tienda + fecha */}
          <div style={{ width: 270, flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, paddingRight: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/kiosk2026/sweepstouch-logo.png"
              alt="sweepsTOUCH"
              style={{ width: 132, height: "auto", display: "block", flex: "0 0 auto" }}
            />
            <div style={{ width: 1, height: 48, background: "rgba(255,255,255,0.35)" }} />
            <div style={{ color: "#fff", fontSize: 17, lineHeight: 1.3, whiteSpace: "nowrap" }}>
              {dateShort}
              <br />
              {timeShort}
            </div>
          </div>
        </div>

        {/* CUERPO */}
        <div style={{ flex: 1, display: "flex", minHeight: 0, background: "#000", padding: "10px 12px 12px", boxSizing: "border-box" }}>
          <div style={{ flex: 1, display: "flex", minHeight: 0, borderRadius: 18, overflow: "hidden" }}>
            {/* IZQUIERDA */}
            <div style={{ width: 343, flex: "0 0 auto", position: "relative", background: "#1a0a12", display: "flex", flexDirection: "column" }}>
              <div style={{ position: "absolute", inset: 0 }}>
                {/* Siempre el arte del opt-in, nunca una promo de la tienda: este panel
                    es la pieza que invita a registrarse, y es la que está pegada al
                    teclado. Antes tomaba `art[0]` y si la tienda tenía una promo
                    cargada, entraba ahí recortada y desplazaba al opt-in. */}
                <Slot src={OPTIN_V} label="Gana una TV gratis" />
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
                <BottomIcons height={42} iconH={26} onCashier={openCashier} onSupport={openSupport} rounded />
              </div>
            </div>

            {/* CENTRO: teclado */}
            <div style={{ flex: 1, background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", padding: "41px 34px 8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, alignSelf: "flex-start", marginLeft: 6 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: PINK,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "0 0 auto",
                  }}
                >
                  <IconPhone size={22} />
                </div>
                <span style={{ fontSize: 26, color: INK }}>Enter your phone number.</span>
              </div>

              <div style={{ width: "100%", maxWidth: 396, marginTop: 10 }}>
                <Display digits={digits} height={54} />
              </div>
              <div style={{ width: "100%", maxWidth: 396, marginTop: 10 }}>
                <Keypad
                  onDigit={addDigit}
                  onBackspace={() => setDigits((d) => d.slice(0, -1))}
                  onSend={send}
                  keyH={54}
                  gap={10}
                  stacked
                  sending={isPending}
                />
              </div>
              {errorLine}

              <div style={{ marginTop: 6, maxWidth: 420 }}>
                <Consent checked={consent} onToggle={() => setConsent((c) => !c)} align="right" width={352} onLegal={() => setPrivacyOpen(true)} />
              </div>
              <div style={{ alignSelf: "flex-start" }}>
                <LegalLinks centered={false} onOpen={() => setPrivacyOpen(true)} />
              </div>
            </div>

            {/* DERECHA */}
            <div style={{ width: 512, flex: "0 0 auto", position: "relative", background: "#f4f2f3", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0 }}>
                {/* `contain` sobre el gris del panel: acá entran promos de la
                    tienda con proporciones cualquiera, y `cover` les cortaba el
                    titular por los lados. */}
                <Slot src={art[0] || DEMO.dealsArt} label="Descuentos exclusivos" fit="contain" bg="#f4f2f3" />
              </div>
            </div>
          </div>
        </div>

        {/* La franja va al PIE, no debajo de la barra superior como venia en
            el archivo: arriba partia en dos la lectura del kiosco — logo,
            franja, y recien el teclado. Abajo cierra la pantalla y queda a la
            altura de la mano, que es donde el cliente busca el boton. */}
        {/* BANNER QR */}
        <div
          style={{
            // Compactada: 111px eran demasiado aire arriba y abajo para dos
            // renglones de texto. 84 deja la franja como un cintillo y le
            // devuelve alto al cuerpo, que es donde está el teclado.
            height: 84,
            flex: "0 0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 26,
            padding: "0 40px",
            background: PINK,
          }}
        >
          <div
            style={{
              width: 74,
              height: 48,
              borderRadius: 12,
              background: "rgba(255,255,255,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "0 0 auto",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/kiosk2026/list-icon.png" alt="Lista de compras" style={{ width: 60, height: "auto", display: "block" }} />
          </div>
          <div style={{ flex: "0 1 auto", minWidth: 0 }}>
            <div
              style={{
                color: "#fff",
                fontSize: 29,
                fontWeight: 900,
                fontStyle: "italic",
                letterSpacing: "0.3px",
                lineHeight: 1,
                textShadow: "0 1px 2px rgba(0,0,0,0.15)",
                whiteSpace: "nowrap",
              }}
            >
              ¿YA TIENES TU LISTA DE COMPRAS?
            </div>
            <div style={{ color: "#f2f2f2", fontSize: 16, lineHeight: 1.15, marginTop: 2, whiteSpace: "nowrap" }}>
              Escanea tu código QR y recibe tu descuento · Scan your list to get your discount
            </div>
          </div>
          <button
            type="button"
            onClick={() => setScanOpen(true)}
            style={{
              flex: "0 0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              background: "#f1f1f1",
              border: "1px solid #dcdcdc",
              borderRadius: 16,
              padding: "0 30px",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
              height: 58,
              width: 240,
            }}
          >
            <IconScan size={28} />
            <span style={{ color: PINK, fontSize: 26, fontWeight: 900, fontStyle: "italic", letterSpacing: 1 }}>
              ESCANEAR
            </span>
          </button>
        </div>

      </Frame>
      {dialogs}
    </>
  );
}
