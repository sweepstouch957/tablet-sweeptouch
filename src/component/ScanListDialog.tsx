"use client";

// Escaneo de listas Pre-RCS desde el kiosco, sin que la cajera se salga de la
// pantalla principal. Antes esto sólo vivía en la ruta /weekly-ad-scan, que deja
// la tablet fuera del flujo de opt-ins mientras tanto.
//
// Tres formas de entrar un código, las tres vivas a la vez:
//   1. Cámara — el cliente acerca su pantalla, es el camino normal.
//   2. Lector HID — si la tienda tiene pistola, escribe y manda Enter solo.
//   3. A mano — el plan B cuando el QR no lee o la pantalla del cliente está rota.
// La cámara usa html5-qrcode, que ya estaba en el proyecto (ver ScanModal).

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Stack,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import QrCodeScannerRoundedIcon from "@mui/icons-material/QrCodeScannerRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import KeyboardRoundedIcon from "@mui/icons-material/KeyboardRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import WeeklyAdResult from "./WeeklyAdResult";
import ShoppingListResult from "./ShoppingListResult";
import { useAuth } from "@/context/auth-context";
import {
  scanWeeklyAdBarcode,
  confirmPurchase,
  fetchShoppingList,
  validateShoppingList,
  type ScanResult,
  type ShoppingListResult as ShoppingListResultType,
} from "@/services/weeklyAdService";

import { BRAND, MAGENTA, SURFACE, STATE, TYPE, FONT, RADIUS } from "@/libs/brand";

// 4.1: el magenta es el color de accion. 75% es su hover segun la escala 4.2 —
// antes se usaba un #c30562 inventado que no esta en el manual.
const PINK = BRAND.magenta;
const PINK_HOVER = MAGENTA[75];
const INK = SURFACE.page;

type State = "waiting" | "loading" | "result" | "shopping-list" | "used" | "error";

/** Segundos de inactividad antes de cerrar solo. */
const IDLE_S = 60;

/** Los dos formatos que la caja sabe leer. */
function isValidCode(v: string) {
  return (v.startsWith("SL-") && v.length >= 5) || (v.startsWith("SUPER-") && v.length >= 10);
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ScanListDialog({ open, onClose }: Props) {
  const { user } = useAuth();
  const [state, setState] = useState<State>("waiting");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [shoppingList, setShoppingList] = useState<ShoppingListResultType | null>(null);
  const [manual, setManual] = useState("");
  const [error, setError] = useState("");
  const [usedInfo, setUsedInfo] = useState<{ at?: string; points?: number; expired?: boolean } | null>(null);
  const [camError, setCamError] = useState("");
  const [camReady, setCamReady] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scannerRef = useRef<any>(null);
  const busyRef = useRef(false);

  const reset = useCallback(() => {
    busyRef.current = false;
    setState("waiting");
    setScanResult(null);
    setShoppingList(null);
    setManual("");
    setError("");
    setUsedInfo(null);
  }, []);

  // Cada apertura arranca limpia: si la anterior quedó en el resultado de otro
  // cliente, la cajera veía sus productos al abrir para el siguiente.
  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const lookup = useCallback(async (code: string) => {
    const value = code.trim().toUpperCase();
    if (!value || busyRef.current) return;
    // La cámara dispara varias veces el mismo frame: sin este candado salen
    // tres peticiones por escaneo.
    busyRef.current = true;
    setState("loading");
    setError("");
    try {
      if (value.startsWith("SL-")) {
        const { shoppingList: list } = await fetchShoppingList(value);
        // Un QR es de un solo uso. Antes se abria igual la pantalla de validar y
        // el rechazo recién llegaba al tocar el botón — con el 409 escondido en
        // la consola, así que parecía que se podía cobrar dos veces.
        if (list.isValidated || list.status === "validated") {
          setUsedInfo({ at: list.validatedAt, points: list.pointsAwarded });
          setState("used");
          return;
        }
        if (list.isExpired) {
          setUsedInfo({ expired: true });
          setState("used");
          return;
        }
        setShoppingList(list);
        setState("shopping-list");
      } else {
        const { scan } = await scanWeeklyAdBarcode(value);
        setScanResult(scan);
        setState("result");
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setError(e.response?.data?.error || e.message || "Could not read the code");
      setState("error");
    } finally {
      busyRef.current = false;
    }
  }, []);

  // ── Cámara ────────────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    const s = scannerRef.current;
    scannerRef.current = null;
    setCamReady(false);
    if (s) {
      try {
        s.stop().then(() => s.clear?.()).catch(() => {});
      } catch {
        /* ya estaba parada */
      }
    }
  }, []);

  useEffect(() => {
    if (!open || state !== "waiting") {
      stopCamera();
      return;
    }
    let cancelled = false;

    (async () => {
      setCamError("");
      // El contenedor tiene que existir antes de arrancar la librería.
      await new Promise((r) => setTimeout(r, 250));
      if (cancelled || !document.getElementById("prercs-qr-reader")) return;
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const scanner = new Html5Qrcode("prercs-qr-reader");
        scannerRef.current = scanner;
        await scanner.start(
          // Frontal: la tablet está montada mirando al cliente, así que el QR
          // se acerca a esa cara. Con "environment" apuntaba a la pared.
          { facingMode: "user" },
          { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
          (decoded: string) => {
            if (!isValidCode(decoded.trim().toUpperCase())) return;
            stopCamera();
            lookup(decoded);
          },
          () => {} // cada frame sin QR entra acá; no es un error
        );
        if (!cancelled) setCamReady(true);
      } catch (err: unknown) {
        const e = err as { message?: string };
        if (!cancelled) setCamError(e?.message || "Could not open the camera");
      }
    })();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [open, state, lookup, stopCamera]);

  // ── Lector HID ────────────────────────────────────────────────────────────
  // Una pistola USB teclea el código y manda Enter. Se escucha en el documento
  // y NO en un input escondido: mantener un campo de texto enfocado hacía que la
  // tablet levantara el teclado en pantalla apenas se abría la cámara, tapando
  // el visor. Sin foco no hay teclado, y el lector se sigue leyendo igual.
  useEffect(() => {
    if (!open || state !== "waiting") return;

    let buffer = "";
    let last = 0;

    const onKey = (e: KeyboardEvent) => {
      // Si la cajera está escribiendo en el campo manual, ese input manda.
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;

      const now = Date.now();
      // Una pistola dispara las teclas de corrido. Una pausa larga significa que
      // lo anterior no era un escaneo, así que el buffer arranca de cero.
      if (now - last > 120) buffer = "";
      last = now;

      if (e.key === "Enter") {
        const v = buffer.trim().toUpperCase();
        buffer = "";
        if (isValidCode(v)) lookup(v);
        return;
      }
      // Sólo caracteres imprimibles: se ignoran Shift, Tab, flechas, etc.
      if (e.key.length === 1) buffer += e.key;
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, state, lookup]);

  // Cierra solo tras un minuto sin actividad. En un kiosco el cliente se va sin
  // cerrar nada, y el modal abierto tapa la pantalla de registro para el que
  // llega atrás. Cualquier toque o tecla dentro del modal reinicia la cuenta,
  // igual que un cambio de paso: leer un QR también es actividad.
  const [idle, setIdle] = useState(IDLE_S);
  useEffect(() => {
    if (!open) return;
    setIdle(IDLE_S);
    const id = setInterval(() => {
      setIdle((n) => {
        if (n <= 1) {
          onClose();
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [open, state, onClose]);

  const bumpIdle = useCallback(() => setIdle(IDLE_S), []);

  const handleValidate = useCallback(
    (qrCode: string, validatedItems: string[]) =>
      // La cajera logueada es la que cobra los puntos de la lista.
      validateShoppingList(qrCode, validatedItems, user?._id || "tablet-default"),
    [user?._id]
  );

  const manualOk = isValidCode(manual.trim().toUpperCase());

  return (
    // Modal centrado, no pantalla completa: en el kiosco el fondo tiene que
    // seguir siendo el kiosco. Un takeover completo hacia perder el contexto de
    // donde estaba parado el cliente, y en una tablet montada se leia como que
    // la app se habia cambiado sola.
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          bgcolor: INK,
          borderRadius: `${RADIUS.lg}px`,
          position: "relative", // ancla de la barra de tiempo
          m: 2,
          maxHeight: "92vh",
          overflow: "hidden",
        },
      }}
      slotProps={{ backdrop: { sx: { bgcolor: "rgba(26,26,26,.72)" } } }}
    >
      <style>{`
        @keyframes prercsLaser{0%{top:6%}50%{top:88%}100%{top:6%}}
        @keyframes prercsPulse{0%,100%{opacity:1}50%{opacity:.35}}
        #prercs-qr-reader video{width:100%!important;height:100%!important;object-fit:cover;display:block;}
        #prercs-qr-reader{width:100%;height:100%;}
        #prercs-qr-reader__dashboard{display:none!important;}
        #prercs-qr-reader__scan_region img{display:none!important;}
        @media (prefers-reduced-motion: reduce){
          #prercs-laser{animation:none!important;top:50%!important;}
        }
      `}</style>

      {/* Barra: sin título ni nombre de cajera. El titular de abajo ya dice
          qué hacer, y repetirlo arriba llenaba de texto un modal que se mira un
          segundo. Queda sólo lo accionable. */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        gap={1}
        sx={{ px: 1.5, pt: 1.5, pb: 0.5, flexShrink: 0 }}
      >
        {state !== "waiting" && (
          <Button onClick={reset} sx={{ ...TYPE.caption, fontFamily: FONT, color: SURFACE.textBody }}>
            Another code
          </Button>
        )}
        <IconButton onClick={onClose} sx={{ color: SURFACE.text }} aria-label="Close">
          <CloseRoundedIcon />
        </IconButton>
      </Stack>

      {/* Cuánto queda antes de cerrarse solo. Es una barra y no un número
          porque quien mira es la cajera de reojo: el largo se entiende sin
          leer. Los últimos 10s pasan a ámbar y ahí sí aparece la cuenta, que
          es cuando conviene avisar de verdad. */}
      <Box
        sx={{
          // Absoluta sobre el borde del modal: marca el tiempo sin robarle
          // alto al contenido. Como franja en el flujo empujaba todo hacia
          // abajo por 3px de información secundaria.
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: SURFACE.line,
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: `${(idle / IDLE_S) * 100}%`,
            bgcolor: idle <= 10 ? STATE.warn : PINK,
            transition: "width 1s linear, background-color .3s",
          }}
        />
        {idle <= 10 && (
          <Typography
            sx={{
              ...TYPE.caption,
              fontFamily: FONT,
              color: STATE.warn,
              position: "absolute",
              left: 16,
              top: 9,
            }}
          >
            Closing in {idle}s
          </Typography>
        )}
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {state === "waiting" && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2.5,
              px: 3,
              py: 3.5,
            }}
          >
            <Stack alignItems="center" gap={0.5}>
              <Stack direction="row" alignItems="center" gap={1.25}>
                <QrCodeScannerRoundedIcon sx={{ color: PINK, fontSize: 30 }} />
                <Typography sx={{ ...TYPE.h3, fontFamily: FONT, color: SURFACE.text }}>
                  Scan the QR here
                </Typography>
              </Stack>
            </Stack>

            {/* Visor */}
            <Box
              sx={{
                position: "relative",
                width: "min(88vw, 430px)",
                aspectRatio: "1",
                borderRadius: `${RADIUS.lg}px`,
                overflow: "hidden",
                bgcolor: SURFACE.viewfinder,
                boxShadow: `0 0 0 1px ${SURFACE.line}, 0 12px 32px -20px rgba(63,63,63,.55)`,
              }}
            >
              <Box id="prercs-qr-reader" />

              {/* Marco + láser, sólo cuando la cámara está viva */}
              {camReady && !camError && (
                <>
                  <Box
                    aria-hidden
                    sx={{
                      position: "absolute",
                      inset: 18,
                      borderRadius: `${RADIUS.md}px`,
                      border: `2px solid ${PINK}`,
                      pointerEvents: "none",
                    }}
                  />
                  <Box
                    id="prercs-laser"
                    aria-hidden
                    sx={{
                      position: "absolute",
                      left: 26,
                      right: 26,
                      height: 2,
                      borderRadius: 2,
                      background: `linear-gradient(90deg, transparent, ${PINK}, transparent)`,
                      animation: "prercsLaser 2.4s ease-in-out infinite",
                      pointerEvents: "none",
                    }}
                  />
                </>
              )}

              {/* Sin cámara: no se deja el cuadro negro sin explicación */}
              {(camError || !camReady) && (
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  gap={1.25}
                  sx={{ position: "absolute", inset: 0, px: 3, textAlign: "center" }}
                >
                  {camError ? (
                    <>
                      <PhotoCameraRoundedIcon sx={{ fontSize: 42, color: "rgba(255,255,255,.5)" }} />
                      <Typography sx={{ ...TYPE.h4, fontFamily: FONT, color: "#fff" }}>
                        Camera not available
                      </Typography>
                      <Typography sx={{ ...TYPE.small, fontFamily: FONT, color: "rgba(255,255,255,.65)" }}>
                        Use the scanner or type the code below.
                      </Typography>
                    </>
                  ) : (
                    <>
                      <CircularProgress size={30} sx={{ color: "#fff" }} />
                      <Typography sx={{ ...TYPE.small, fontFamily: FONT, color: "rgba(255,255,255,.65)" }}>
                        Opening camera…
                      </Typography>
                    </>
                  )}
                </Stack>
              )}
            </Box>

            {/* Entrada manual */}
            <Box sx={{ width: "min(90vw, 420px)" }}>
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.25 }}>
                <Box sx={{ flex: 1, height: "1px", bgcolor: SURFACE.line }} />
                <Stack direction="row" alignItems="center" gap={0.75}>
                  <KeyboardRoundedIcon sx={{ fontSize: 15, color: SURFACE.textMuted }} />
                  <Typography variant="caption" sx={{ color: SURFACE.textMuted }}>
                    or type it
                  </Typography>
                </Stack>
                <Box sx={{ flex: 1, height: "1px", bgcolor: SURFACE.line }} />
              </Stack>

              <Stack direction="row" gap={1}>
                <TextField
                  fullWidth
                  value={manual}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setManual(digits ? `SL-${digits}` : "");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && manualOk) lookup(manual);
                  }}
                  placeholder="SL-XXXXXX"
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    maxLength: 9,
                    style: {
                      fontFamily: "monospace",
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      letterSpacing: ".14em",
                      textAlign: "center",
                      color: SURFACE.text,
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: SURFACE.raised,
                      borderRadius: "12px",
                      "& fieldset": { borderColor: SURFACE.line },
                      "&:hover fieldset": { borderColor: SURFACE.textMuted },
                      "&.Mui-focused fieldset": { borderColor: PINK },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  disableElevation
                  disabled={!manualOk}
                  onClick={() => lookup(manual)}
                  startIcon={<SearchRoundedIcon />}
                  sx={{
                    px: 3,
                    borderRadius: "12px",
                    fontWeight: 800,
                    bgcolor: PINK,
                    "&:hover": { bgcolor: PINK_HOVER },
                    "&.Mui-disabled": { bgcolor: SURFACE.sunken, color: SURFACE.textMuted },
                  }}
                >
                  Search
                </Button>
              </Stack>
            </Box>

          </Box>
        )}

        {state === "loading" && (
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 320, py: 6, gap: 2 }}>
            <CircularProgress sx={{ color: PINK }} />
            <Typography color={SURFACE.textBody}>Looking up the list…</Typography>
          </Stack>
        )}

        {state === "used" && (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: 320, py: 6, gap: 2, px: 4, textAlign: "center" }}
          >
            <BlockRoundedIcon sx={{ fontSize: 60, color: STATE.warn }} />
            <Typography variant="h5" color={SURFACE.text} fontWeight={800}>
              {usedInfo?.expired ? "This list expired" : "This list was already used"}
            </Typography>
            <Typography variant="body2" sx={{ color: SURFACE.textBody, maxWidth: 400 }}>
              {usedInfo?.expired ? (
                "The QR is past its validity date. Ask the customer to build a new list from their link, or extend it from the store panel."
              ) : (
                <>
                  Validated
                  {usedInfo?.at
                    ? ` on ${new Date(usedInfo.at).toLocaleString("en-US", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                    : ""}
                  {usedInfo?.points ? `, ${usedInfo.points} points credited` : ""}. Each QR works
                  only once: ask the customer to generate a new one.
                </>
              )}
            </Typography>
            <Button
              variant="contained"
              onClick={reset}
              disableElevation
              sx={{ mt: 1, bgcolor: PINK, "&:hover": { bgcolor: PINK_HOVER }, borderRadius: "10px", fontWeight: 800 }}
            >
              Scan another
            </Button>
          </Stack>
        )}

        {state === "error" && (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: 320, py: 6, gap: 2, px: 4, textAlign: "center" }}
          >
            <ErrorRoundedIcon sx={{ fontSize: 56, color: STATE.error }} />
            <Typography variant="h6" color={SURFACE.text} fontWeight={700}>
              {error}
            </Typography>
            <Typography variant="body2" sx={{ color: SURFACE.textMuted, maxWidth: 380 }}>
              Revisa que el código esté completo. Si la lista venció, se puede extender
              desde el panel de la tienda.
            </Typography>
            <Button
              variant="contained"
              onClick={reset}
              disableElevation
              sx={{ mt: 1, bgcolor: PINK, "&:hover": { bgcolor: PINK_HOVER }, borderRadius: "10px", fontWeight: 800 }}
            >
              Try again
            </Button>
          </Stack>
        )}

        {state === "shopping-list" && shoppingList && (
          <ShoppingListResult
            shoppingList={shoppingList}
            onValidate={handleValidate}
            onReset={reset}
          />
        )}

        {state === "result" && scanResult && (
          <WeeklyAdResult scan={scanResult} onConfirm={confirmPurchase} onReset={reset} />
        )}
      </Box>
    </Dialog>
  );
}
