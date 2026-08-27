"use client";

// Escaneo de listas Pre-RCS desde el kiosco, sin que la cajera se salga de la
// pantalla principal. Antes esto sólo vivía en la ruta /weekly-ad-scan, que deja
// la tablet fuera del flujo de opt-ins mientras tanto.
//
// Reusa los mismos componentes que esa ruta (WeeklyAdScanInput, WeeklyAdResult,
// ShoppingListResult) y los mismos servicios; lo único propio es la máquina de
// estados y la entrada manual del código.

import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Stack,
  TextField,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import QrCodeScannerRoundedIcon from "@mui/icons-material/QrCodeScannerRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import WeeklyAdScanInput from "./WeeklyAdScanInput";
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

const PINK = "#fc0680";

type State = "waiting" | "loading" | "result" | "shopping-list" | "error";

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

  const reset = useCallback(() => {
    setState("waiting");
    setScanResult(null);
    setShoppingList(null);
    setManual("");
    setError("");
  }, []);

  // Cada apertura arranca limpia: si la anterior quedó en el resultado de otro
  // cliente, la cajera veía sus productos al abrir para el siguiente.
  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const handleScan = useCallback(async (code: string) => {
    const value = code.trim().toUpperCase();
    if (!value) return;
    setState("loading");
    setError("");
    try {
      if (value.startsWith("SL-")) {
        const { shoppingList: list } = await fetchShoppingList(value);
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
    }
  }, []);

  const handleValidate = useCallback(
    (qrCode: string, validatedItems: string[]) =>
      // La cajera logueada es la que cobra los puntos de la lista.
      validateShoppingList(qrCode, validatedItems, user?._id || "tablet-default"),
    [user?._id]
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{ sx: { bgcolor: "#0f1117" } }}
    >
      {/* Barra */}
      <Stack
        direction="row"
        alignItems="center"
        gap={1.5}
        sx={{ px: 2, py: 1.5, borderBottom: "1px solid rgba(255,255,255,.08)" }}
      >
        <QrCodeScannerRoundedIcon sx={{ color: PINK }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontWeight={800} color="#fff" lineHeight={1.2}>
            Escanear lista del cliente
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,.45)" }}>
            {user ? `${user.firstName} ${user.lastName}` : "Sin cajera identificada"}
          </Typography>
        </Box>
        {state !== "waiting" && (
          <Button onClick={reset} sx={{ color: "rgba(255,255,255,.7)" }}>
            Otro código
          </Button>
        )}
        <IconButton onClick={onClose} sx={{ color: "#fff" }} aria-label="Cerrar">
          <CloseRoundedIcon />
        </IconButton>
      </Stack>

      <Box sx={{ flex: 1, overflowY: "auto", bgcolor: state === "waiting" ? "#f8f9fa" : "#0f1117" }}>
        {state === "waiting" && (
          <>
            <WeeklyAdScanInput onScan={handleScan} />

            {/* Sin lector: la cajera tipea el código que el cliente tiene en
                pantalla. Es el plan B que evita mandarlo a rehacer la lista. */}
            <Box sx={{ maxWidth: 420, mx: "auto", px: 3, pb: 5 }}>
              <Divider sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  o ingresa el código a mano
                </Typography>
              </Divider>
              <Stack direction="row" gap={1}>
                <TextField
                  fullWidth
                  size="small"
                  value={manual}
                  onChange={(e) => setManual(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleScan(manual);
                  }}
                  placeholder="SL-XXXXXX"
                  inputProps={{ style: { fontFamily: "monospace", letterSpacing: ".08em" } }}
                />
                <Button
                  variant="contained"
                  disabled={manual.trim().length < 5}
                  onClick={() => handleScan(manual)}
                  sx={{ bgcolor: PINK, "&:hover": { bgcolor: "#e0046f" }, px: 3 }}
                >
                  Buscar
                </Button>
              </Stack>
            </Box>
          </>
        )}

        {state === "loading" && (
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: "70vh", gap: 2 }}>
            <CircularProgress sx={{ color: PINK }} />
            <Typography color="rgba(255,255,255,.7)">Buscando la lista…</Typography>
          </Stack>
        )}

        {state === "error" && (
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: "70vh", gap: 2, px: 4, textAlign: "center" }}>
            <ErrorOutlineRoundedIcon sx={{ fontSize: 56, color: "#ef4444" }} />
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
              sx={{ mt: 1, bgcolor: PINK, "&:hover": { bgcolor: "#e0046f" } }}
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
          <WeeklyAdResult
            scan={scanResult}
            onConfirm={confirmPurchase}
            onReset={reset}
          />
        )}
      </Box>
    </Dialog>
  );
}
