"use client";

// Lo que ve la cajera después de escanear una lista Pre-RCS.
//
// El orden de la pantalla es el orden en que ella trabaja: primero a quién le
// está validando, después qué se lleva, y recién al final el botón. Los puntos
// no encabezan porque no son la decisión — son la consecuencia.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Typography,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";
// 6.3: iconos de relleno solido, esquinas redondeadas, un solo color.
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import { BRAND, MAGENTA, SURFACE, STATE, TYPE, FONT, RADIUS } from "@/libs/brand";
import type {
  ShoppingListResult as ShoppingListResultType,
  ShoppingListValidateResult,
} from "@/services/weeklyAdService";

const PINK = BRAND.magenta;
const PINK_HOVER = MAGENTA[75];
const GREEN = STATE.ok;
const INK = SURFACE.page;

/** Tiempo que permanece visible la confirmación antes de cerrar el modal. */
const CONFIRMATION_MS = 3000;

interface Props {
  shoppingList: ShoppingListResultType;
  onValidate: (
    qrCode: string,
    validatedItems: string[]
  ) => Promise<ShoppingListValidateResult>;
  onReset: () => void;
  onValidatedClose?: () => void;
}

export default function ShoppingListResult({
  shoppingList,
  onValidate,
  onReset,
  onValidatedClose,
}: Props) {
  // Se valida la lista COMPLETA: el cliente ya eligió en su celular y la cajera
  // no revisa el carrito producto por producto. Ese paso frenaba la fila y era
  // lo primero que se salteaba en hora pico.
  const allItems = useMemo(() => shoppingList.items.map((i) => i.name), [shoppingList.items]);
  const [validated, setValidated] = useState(false);
  const [validateResult, setValidateResult] =
    useState<ShoppingListValidateResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [failed, setFailed] = useState("");
  // La confirmación se muestra tres segundos y luego cierra el modal completo.
  // Si se cierra manualmente antes, el desmontaje cancela este temporizador.
  useEffect(() => {
    if (!validated || !onValidatedClose) return;
    const id = setTimeout(onValidatedClose, CONFIRMATION_MS);
    return () => clearTimeout(id);
  }, [validated, onValidatedClose]);

  const handleValidate = useCallback(async () => {
    if (allItems.length === 0 || validating) return;
    setValidating(true);
    setFailed("");
    try {
      const result = await onValidate(shoppingList.qrCode, allItems);
      setValidateResult(result);
      setValidated(true);
    } catch (err: unknown) {
      // El backend rechaza con 409 una lista ya validada. Antes esto sólo iba a
      // la consola: la cajera tocaba el botón y no pasaba nada visible.
      const e = err as { response?: { status?: number; data?: { error?: string } }; message?: string };
      setFailed(
        e.response?.status === 409
          ? "This list was already validated. Ask the customer to generate a new QR."
          : e.response?.data?.error || e.message || "Could not validate. Try again."
      );
    } finally {
      setValidating(false);
    }
  }, [shoppingList.qrCode, allItems, onValidate, validating]);

  // Acredita apenas se lee el QR. `ranRef` la deja correr una sola vez aunque
  // React vuelva a montar el efecto (StrictMode en dev lo hace) — si no, se
  // dispara dos veces y la segunda vuelve con 409.
  const ranRef = useRef(false);
  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    handleValidate();
  }, [handleValidate]);

  const customerName = shoppingList.customerName?.trim();
  const phoneTail = shoppingList.customerPhoneMasked;
  const initial = (customerName || "C")[0].toUpperCase();

  // ── Pantalla de confirmación ───────────────────────────────────────────────
  if (validated && validateResult) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ bgcolor: INK, py: 5, px: 4, gap: 2, textAlign: "center", color: SURFACE.text }}
      >
        <CheckCircleRoundedIcon sx={{ fontSize: 76, color: GREEN }} />
        <Typography sx={{ ...TYPE.h2, fontFamily: FONT }}>Purchase Validated</Typography>
      </Stack>
    );
  }

  // ── Acreditando ────────────────────────────────────────────────────────────
  // Ya no hay paso de revisión: al leer el QR se valida la lista entera y se
  // acreditan los puntos. Esta pantalla es sólo el rato que tarda la petición,
  // más el error si algo sale mal.
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{ bgcolor: INK, py: 5, px: 4, gap: 2, textAlign: "center", color: SURFACE.text }}
    >
      {failed ? (
        <>
          <ErrorRoundedIcon sx={{ fontSize: 56, color: STATE.error }} />
          <Typography sx={{ ...TYPE.h4, fontFamily: FONT }}>{failed}</Typography>
          <Button
            variant="contained"
            disableElevation
            onClick={onReset}
            sx={{
              mt: 1,
              px: 4,
              py: 1.3,
              borderRadius: `${RADIUS.md}px`,
              fontFamily: FONT,
              fontWeight: 500,
              bgcolor: PINK,
              color: "#fff",
              "&:hover": { bgcolor: PINK_HOVER },
            }}
          >
            Scan another
          </Button>
        </>
      ) : (
        <>
          <CircularProgress sx={{ color: PINK }} />
          <Typography sx={{ ...TYPE.h4, fontFamily: FONT }}>
            Validating purchase{customerName ? ` for ${customerName}` : ""}…
          </Typography>
          <Typography sx={{ ...TYPE.small, fontFamily: FONT, color: SURFACE.textMuted }}>
            {allItems.length} product{allItems.length === 1 ? "" : "s"} · {shoppingList.qrCode}
          </Typography>
        </>
      )}
    </Stack>
  );
}
