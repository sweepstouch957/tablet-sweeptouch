"use client";

// Lo que ve la cajera después de escanear una lista Pre-RCS.
//
// El orden de la pantalla es el orden en que ella trabaja: primero a quién le
// está validando, después qué se lleva, y recién al final el botón. Los puntos
// no encabezan porque no son la decisión — son la consecuencia.

import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Switch,
  CircularProgress,
  Divider,
} from "@mui/material";
// 6.3: iconos de relleno solido, esquinas redondeadas, un solo color.
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import TimerRoundedIcon from "@mui/icons-material/TimerRounded";
import ShoppingBasketRoundedIcon from "@mui/icons-material/ShoppingBasketRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import { BRAND, MAGENTA, SURFACE, STATE, TYPE, FONT, RADIUS } from "@/libs/brand";
import type {
  ShoppingListResult as ShoppingListResultType,
  ShoppingListValidateResult,
} from "@/services/weeklyAdService";

const PINK = BRAND.magenta;
const PINK_HOVER = MAGENTA[75];
/** Verde de estado, no de marca: dice "validado", no "Sweepstouch". */
const GREEN = STATE.ok;
const INK = SURFACE.page;
const PANEL = SURFACE.raised;
const HAIR = SURFACE.line;

/** Segundos antes de volver solo a la pantalla de escaneo. */
const AUTO_RESET_S = 60;

interface Props {
  shoppingList: ShoppingListResultType;
  onValidate: (
    qrCode: string,
    validatedItems: string[]
  ) => Promise<ShoppingListValidateResult>;
  onReset: () => void;
}

export default function ShoppingListResult({
  shoppingList,
  onValidate,
  onReset,
}: Props) {
  // Todo marcado de entrada: lo normal es que el cliente lleve lo que pidió, y
  // así la cajera sólo destilda lo que falta en vez de tildar de a uno.
  const [selectedItems, setSelectedItems] = useState<string[]>(
    shoppingList.items.map((i) => i.name)
  );
  const [validated, setValidated] = useState(false);
  const [validateResult, setValidateResult] =
    useState<ShoppingListValidateResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [failed, setFailed] = useState("");
  const [seconds, setSeconds] = useState(AUTO_RESET_S);

  // Vuelve solo al escaneo: si la cajera se distrae, la caja no se queda con la
  // lista del cliente anterior en pantalla.
  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          onReset();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [onReset]);

  const toggleItem = useCallback((name: string) => {
    setSelectedItems((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }, []);

  const handleValidate = useCallback(async () => {
    if (selectedItems.length === 0 || validating) return;
    setValidating(true);
    setFailed("");
    try {
      const result = await onValidate(shoppingList.qrCode, selectedItems);
      setValidateResult(result);
      setValidated(true);
    } catch (err: unknown) {
      // El backend rechaza con 409 una lista ya validada. Antes esto sólo iba a
      // la consola: la cajera tocaba el botón y no pasaba nada visible.
      const e = err as { response?: { status?: number; data?: { error?: string } }; message?: string };
      setFailed(
        e.response?.status === 409
          ? "Esta lista ya fue validada. Pide al cliente que genere un QR nuevo."
          : e.response?.data?.error || e.message || "No se pudo validar. Intenta de nuevo."
      );
    } finally {
      setValidating(false);
    }
  }, [shoppingList.qrCode, selectedItems, onValidate, validating]);

  const customerName = shoppingList.customerName?.trim();
  const phoneTail = shoppingList.customerPhoneMasked;
  const initial = (customerName || "C")[0].toUpperCase();

  // ── Pantalla de confirmación ───────────────────────────────────────────────
  if (validated && validateResult) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ bgcolor: INK, minHeight: "100%", py: 8, gap: 2, px: 4, textAlign: "center", color: SURFACE.text }}
      >
        <CheckCircleRoundedIcon sx={{ fontSize: 76, color: GREEN }} />
        <Typography sx={{ ...TYPE.h2, fontFamily: FONT }}>Compra validada</Typography>
        <Typography sx={{ color: SURFACE.textMuted }}>
          {validateResult.confirmedProducts} producto
          {validateResult.confirmedProducts === 1 ? "" : "s"} confirmado
          {validateResult.confirmedProducts === 1 ? "" : "s"}
          {customerName ? ` · ${customerName}` : ""}
        </Typography>

        <Stack direction="row" gap={1.5} sx={{ mt: 1.5, width: "min(90vw, 420px)" }}>
          <Stat
            label="Para el cliente"
            value={`+${validateResult.pointsAwarded}`}
            accent={PINK}
          />
          <Stat
            label="Para ti"
            value={`+${validateResult.cashierPointsAwarded ?? 0}`}
            accent={GREEN}
            muted={!validateResult.cashierPointsAwarded}
          />
        </Stack>

        {!validateResult.cashierPointsAwarded && (
          <Typography variant="caption" sx={{ color: SURFACE.textMuted, maxWidth: 340 }}>
            No se acreditaron tus puntos porque no hay sesión de cajera iniciada.
          </Typography>
        )}

        <Button
          variant="contained"
          onClick={onReset}
          disableElevation
          sx={{
            mt: 2,
            px: 5,
            py: 1.4,
            borderRadius: "12px",
            fontWeight: 800,
            fontSize: "1rem",
            bgcolor: PINK,
            "&:hover": { bgcolor: PINK_HOVER },
          }}
        >
          Siguiente cliente
        </Button>
      </Stack>
    );
  }

  // ── Revisión de la lista ───────────────────────────────────────────────────
  return (
    <Box sx={{ bgcolor: INK, minHeight: "100%", color: SURFACE.text, px: { xs: 2, sm: 3 }, py: 3 }}>
      <Box sx={{ maxWidth: 620, mx: "auto" }}>
      {/* Quién */}
      <Stack
        direction="row"
        alignItems="center"
        gap={1.75}
        sx={{
          p: 2,
          borderRadius: `${RADIUS.lg}px`,
          bgcolor: PANEL,
          border: `1px solid ${HAIR}`,
          mb: 2,
        }}
      >
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            flexShrink: 0,
            bgcolor: PINK,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.3rem",
            fontWeight: 800,
          }}
        >
          {customerName ? initial : <PersonRoundedIcon />}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ ...TYPE.h4, fontFamily: FONT }}>
            {customerName || "Cliente"}
          </Typography>
          <Typography variant="caption" sx={{ color: SURFACE.textMuted }}>
            {phoneTail ? `Termina en ${phoneTail} · ` : ""}
            {shoppingList.qrCode}
          </Typography>
        </Box>
        <Stack alignItems="center" sx={{ color: SURFACE.textMuted, flexShrink: 0 }}>
          <TimerRoundedIcon sx={{ fontSize: 18 }} />
          <Typography variant="caption" sx={{ fontVariantNumeric: "tabular-nums" }}>
            {seconds}s
          </Typography>
        </Stack>
      </Stack>

      {/* Qué se lleva */}
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.25 }}>
        <ShoppingBasketRoundedIcon sx={{ fontSize: 19, color: SURFACE.textMuted }} />
        <Typography sx={{ ...TYPE.h4, fontFamily: FONT }}>Lo que pidió</Typography>
        <Box sx={{ flex: 1 }} />
        <Typography variant="caption" sx={{ color: SURFACE.textMuted }}>
          Destilda lo que no lleve
        </Typography>
      </Stack>

      <Stack gap={1} sx={{ mb: 2.5 }}>
        {shoppingList.items.map((item) => {
          const on = selectedItems.includes(item.name);
          return (
            <Stack
              key={item.name}
              direction="row"
              alignItems="center"
              gap={1.5}
              onClick={() => toggleItem(item.name)}
              sx={{
                px: 1.75,
                py: 1.5,
                borderRadius: `${RADIUS.md}px`,
                cursor: "pointer",
                bgcolor: on ? STATE.okSoft : SURFACE.raised,
                border: `1px solid ${on ? GREEN : HAIR}`,
                transition: "background-color .15s, border-color .15s",
                opacity: on ? 1 : 0.5,
              }}
            >
              <Switch
                checked={on}
                onChange={() => toggleItem(item.name)}
                onClick={(e) => e.stopPropagation()}
                sx={{
                  "& .Mui-checked": { color: `${GREEN} !important` },
                  "& .Mui-checked + .MuiSwitch-track": { backgroundColor: `${GREEN} !important` },
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  fontWeight={700}
                  sx={{ textDecoration: on ? "none" : "line-through" }}
                >
                  {item.name}
                </Typography>
                <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 0.35 }}>
                  <Typography fontSize=".92rem" sx={{ color: SURFACE.textBody }}>
                    {item.price}
                  </Typography>
                  <Chip
                    label={`×${item.quantity}${item.unit ? ` ${item.unit}` : ""}`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: ".72rem",
                      fontWeight: 700,
                      bgcolor: SURFACE.sunken,
                      color: SURFACE.textBody,
                    }}
                  />
                </Stack>
              </Box>
            </Stack>
          );
        })}
      </Stack>

      <Divider sx={{ borderColor: HAIR, mb: 2 }} />

      {/* Puntos: consecuencia, no encabezado */}
      <Stack
        direction="row"
        alignItems="center"
        gap={1.25}
        sx={{ mb: 2, px: 0.5, color: SURFACE.textBody }}
      >
        <StarRoundedIcon sx={{ fontSize: 20 }} />
        <Typography fontSize=".95rem">
          El cliente gana{" "}
          <strong style={{ color: SURFACE.text }}>
            {selectedItems.length} punto{selectedItems.length === 1 ? "" : "s"}
          </strong>{" "}
          por esta compra
        </Typography>
      </Stack>

      {failed && (
        <Stack
          direction="row"
          alignItems="center"
          gap={1.25}
          sx={{
            mb: 1.5,
            p: 1.5,
            borderRadius: "12px",
            bgcolor: STATE.errorSoft,
            border: `1px solid ${STATE.error}`,
          }}
        >
          <ErrorRoundedIcon sx={{ color: STATE.error, fontSize: 20 }} />
          <Typography fontSize=".9rem" sx={{ color: STATE.error }}>
            {failed}
          </Typography>
        </Stack>
      )}

      <Button
        fullWidth
        variant="contained"
        disabled={selectedItems.length === 0 || validating}
        onClick={handleValidate}
        startIcon={
          validating ? (
            <CircularProgress size={20} sx={{ color: SURFACE.text }} />
          ) : (
            <CheckCircleRoundedIcon />
          )
        }
        disableElevation
        sx={{
          py: 1.75,
          borderRadius: `${RADIUS.md}px`,
          fontWeight: 900,
          fontSize: "1.05rem",
          bgcolor: PINK,
          "&:hover": { bgcolor: PINK_HOVER },
          "&.Mui-disabled": { bgcolor: SURFACE.sunken, color: SURFACE.textMuted },
        }}
      >
        {validating
          ? "Validando…"
          : selectedItems.length === 0
          ? "Marca al menos un producto"
          : `Validar ${selectedItems.length} y dar puntos`}
        </Button>
      </Box>
    </Box>
  );
}

/** Tarjetita de resultado. Sólo se usa en la confirmación. */
function Stat({
  label,
  value,
  accent,
  muted,
}: {
  label: string;
  value: string;
  accent: string;
  muted?: boolean;
}) {
  return (
    <Box
      sx={{
        flex: 1,
        p: 1.75,
        borderRadius: `${RADIUS.md}px`,
        bgcolor: muted ? SURFACE.raised : `${accent}1f`,
        border: `1px solid ${muted ? HAIR : `${accent}55`}`,
        textAlign: "left",
      }}
    >
      <Typography
        variant="caption"
        sx={{ color: SURFACE.textMuted, fontWeight: 700, letterSpacing: ".05em" }}
      >
        {label.toUpperCase()}
      </Typography>
      <Typography
        fontSize="1.7rem"
        fontWeight={900}
        lineHeight={1.15}
        sx={{ color: muted ? SURFACE.textMuted : accent, fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </Typography>
    </Box>
  );
}
