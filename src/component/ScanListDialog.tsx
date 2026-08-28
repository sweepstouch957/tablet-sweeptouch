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
const INK = SURFACE.dark;

type State = "waiting" | "loading" | "result" | "shopping-list" | "used" | "error";

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
  const hidRef = useRef<HTMLInputElement>(null);
  const manualRef = useRef<HTMLInputElement>(null);
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
      setError(e.response?.data?.error || e.message || "No se pudo leer el código");
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
          { facingMode: "environment" },
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
        if (!cancelled) setCamError(e?.message || "No pudimos abrir la cámara");
      }
    })();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [open, state, lookup, stopCamera]);

  // ── Lector HID ────────────────────────────────────────────────────────────
  // Una pistola USB teclea el código y manda Enter. El input está oculto y se
  // mantiene enfocado mientras se espera, sin robarle el foco al campo manual.
  useEffect(() => {
    if (!open || state !== "waiting") return;
    const id = setInterval(() => {
      const el = hidRef.current;
      const active = document.activeElement;
      // Comparación directa contra el input real. Con `getAttribute` alcanzaba
      // con que MUI no propagara el data-attr para que el foco se lo robara a la
      // cajera a media palabra.
      if (el && active !== el && active !== manualRef.current) el.focus();
    }, 600);
    return () => clearInterval(id);
  }, [open, state]);

  const handleValidate = useCallback(
    (qrCode: string, validatedItems: string[]) =>
      // La cajera logueada es la que cobra los puntos de la lista.
      validateShoppingList(qrCode, validatedItems, user?._id || "tablet-default"),
    [user?._id]
  );

  const manualOk = isValidCode(manual.trim().toUpperCase());

  return (
    <Dialog open={open} onClose={onClose} fullScreen PaperProps={{ sx: { bgcolor: INK } }}>
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

      {/* Barra */}
      <Stack
        direction="row"
        alignItems="center"
        gap={1.5}
        sx={{ px: 2.5, py: 1.75, borderBottom: "1px solid rgba(255,255,255,.07)", flexShrink: 0 }}
      >
        <QrCodeScannerRoundedIcon sx={{ color: PINK, fontSize: 26 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ ...TYPE.h4, fontFamily: FONT, color: SURFACE.onDark }}>
            Escanear lista del cliente
          </Typography>
          <Typography sx={{ ...TYPE.small, fontFamily: FONT, color: SURFACE.onDarkFaint }}>
            {user ? `${user.firstName} ${user.lastName}` : "Sin cajera identificada · no suma puntos"}
          </Typography>
        </Box>
        {state !== "waiting" && (
          <Button onClick={reset} sx={{ ...TYPE.caption, fontFamily: FONT, color: SURFACE.onDarkMuted }}>
            Otro código
          </Button>
        )}
        <IconButton onClick={onClose} sx={{ color: "#fff" }} aria-label="Cerrar">
          <CloseRoundedIcon />
        </IconButton>
      </Stack>

      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {state === "waiting" && (
          <Box
            sx={{
              minHeight: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              px: 3,
              py: 4,
            }}
          >
            <Stack alignItems="center" gap={0.5}>
              <Typography sx={{ ...TYPE.h3, fontFamily: FONT, color: SURFACE.onDark }}>
                Acerca el QR del cliente
              </Typography>
              <Typography sx={{ ...TYPE.body, fontFamily: FONT, color: SURFACE.onDarkMuted }}>
                Se lee solo. No hay que tocar nada.
              </Typography>
            </Stack>

            {/* Visor */}
            <Box
              sx={{
                position: "relative",
                width: "min(78vw, 340px)",
                aspectRatio: "1",
                borderRadius: `${RADIUS.lg}px`,
                overflow: "hidden",
                bgcolor: "#000",
                boxShadow: "0 0 0 1px rgba(255,255,255,.10)",
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
                      <PhotoCameraRoundedIcon sx={{ fontSize: 42, color: "rgba(255,255,255,.35)" }} />
                      <Typography fontWeight={700} color="rgba(255,255,255,.8)">
                        Cámara no disponible
                      </Typography>
                      <Typography variant="caption" sx={{ color: "rgba(255,255,255,.42)" }}>
                        Usa el lector o escribe el código abajo.
                      </Typography>
                    </>
                  ) : (
                    <>
                      <CircularProgress size={30} sx={{ color: PINK }} />
                      <Typography variant="caption" sx={{ color: "rgba(255,255,255,.45)" }}>
                        Abriendo cámara…
                      </Typography>
                    </>
                  )}
                </Stack>
              )}
            </Box>

            {/* Estado del lector: informa sin gritar */}
            {!camError && (
              <Stack direction="row" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: camReady ? STATE.ok : SURFACE.onDarkFaint,
                    animation: camReady ? "prercsPulse 1.6s infinite" : "none",
                  }}
                />
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,.42)" }}>
                  {camReady ? "Cámara y lector activos" : "Preparando…"}
                </Typography>
              </Stack>
            )}

            {/* Entrada manual */}
            <Box sx={{ width: "min(90vw, 420px)" }}>
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.25 }}>
                <Box sx={{ flex: 1, height: "1px", bgcolor: "rgba(255,255,255,.10)" }} />
                <Stack direction="row" alignItems="center" gap={0.75}>
                  <KeyboardRoundedIcon sx={{ fontSize: 15, color: "rgba(255,255,255,.35)" }} />
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,.35)" }}>
                    o escríbelo
                  </Typography>
                </Stack>
                <Box sx={{ flex: 1, height: "1px", bgcolor: "rgba(255,255,255,.10)" }} />
              </Stack>

              <Stack direction="row" gap={1}>
                <TextField
                  fullWidth
                  value={manual}
                  onChange={(e) => setManual(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && manualOk) lookup(manual);
                  }}
                  placeholder="SL-XXXXXX"
                  inputRef={manualRef}
                  inputProps={{
                    style: {
                      fontFamily: "monospace",
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      letterSpacing: ".14em",
                      textAlign: "center",
                      color: "#fff",
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "rgba(255,255,255,.05)",
                      borderRadius: "12px",
                      "& fieldset": { borderColor: "rgba(255,255,255,.14)" },
                      "&:hover fieldset": { borderColor: "rgba(255,255,255,.28)" },
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
                    "&.Mui-disabled": { bgcolor: "rgba(255,255,255,.07)", color: "rgba(255,255,255,.25)" },
                  }}
                >
                  Buscar
                </Button>
              </Stack>
            </Box>

            {/* Lector HID: teclea el código y manda Enter */}
            <input
              ref={hidRef}
              type="text"
              aria-hidden
              tabIndex={-1}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                const v = (e.currentTarget.value || "").trim().toUpperCase();
                e.currentTarget.value = "";
                if (isValidCode(v)) lookup(v);
              }}
              style={{ position: "absolute", opacity: 0, width: 1, height: 1, pointerEvents: "none" }}
            />
          </Box>
        )}

        {state === "loading" && (
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: "70vh", gap: 2 }}>
            <CircularProgress sx={{ color: PINK }} />
            <Typography color="rgba(255,255,255,.7)">Buscando la lista…</Typography>
          </Stack>
        )}

        {state === "used" && (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: "70vh", gap: 2, px: 4, textAlign: "center" }}
          >
            <BlockRoundedIcon sx={{ fontSize: 60, color: STATE.warn }} />
            <Typography variant="h5" color="#fff" fontWeight={800}>
              {usedInfo?.expired ? "Esta lista venció" : "Esta lista ya se usó"}
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,.55)", maxWidth: 400 }}>
              {usedInfo?.expired ? (
                "El QR pasó su fecha de validez. Pide al cliente que arme una lista nueva desde su link, o extiende la vigencia desde el panel de la tienda."
              ) : (
                <>
                  Se validó
                  {usedInfo?.at
                    ? ` el ${new Date(usedInfo.at).toLocaleString("es", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                    : ""}
                  {usedInfo?.points ? ` y se acreditaron ${usedInfo.points} puntos` : ""}. Cada QR sirve
                  una sola vez: pide al cliente que genere uno nuevo.
                </>
              )}
            </Typography>
            <Button
              variant="contained"
              onClick={reset}
              disableElevation
              sx={{ mt: 1, bgcolor: PINK, "&:hover": { bgcolor: PINK_HOVER }, borderRadius: "10px", fontWeight: 800 }}
            >
              Escanear otro
            </Button>
          </Stack>
        )}

        {state === "error" && (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: "70vh", gap: 2, px: 4, textAlign: "center" }}
          >
            <ErrorRoundedIcon sx={{ fontSize: 56, color: STATE.error }} />
            <Typography variant="h6" color="#fff" fontWeight={700}>
              {error}
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,.5)", maxWidth: 380 }}>
              Revisa que el código esté completo. Si la lista venció, se puede extender
              desde el panel de la tienda.
            </Typography>
            <Button
              variant="contained"
              onClick={reset}
              disableElevation
              sx={{ mt: 1, bgcolor: PINK, "&:hover": { bgcolor: PINK_HOVER }, borderRadius: "10px", fontWeight: 800 }}
            >
              Intentar de nuevo
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
