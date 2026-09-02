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
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import { BRAND, MAGENTA, SURFACE, STATE, TYPE, FONT, RADIUS } from "@/libs/brand";
import type {
  ShoppingListResult as ShoppingListResultType,
  ShoppingListValidateResult,
} from "@/services/weeklyAdService";

const PINK = BRAND.magenta;
const PINK_HOVER = MAGENTA[75];
const INK = SURFACE.page;

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
  // Se valida la lista COMPLETA: el cliente ya eligió en su celular y la cajera
  // no revisa el carrito producto por producto. Ese paso frenaba la fila y era
  // lo primero que se salteaba en hora pico.
  const allItems = useMemo(() => shoppingList.items.map((i) => i.name), [shoppingList.items]);
  const [validated, setValidated] = useState(false);
  const [validateResult, setValidateResult] =
    useState<ShoppingListValidateResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [failed, setFailed] = useState("");
  const [seconds, setSeconds] = useState(AUTO_RESET_S);

  // Vuelve solo al escaneo: si la cajera se distrae, la caja no se queda con la
  // lista del cliente anterior en pantalla.
  //
  // El reloj arranca cuando aparece la CONFIRMACION, no al montar. Antes corria
  // durante el "Acreditando...", asi que si la peticion tardaba, la pantalla de
  // puntos se llevaba lo que sobraba del minuto — y con una red lenta podia
  // desaparecer casi enseguida.
  useEffect(() => {
    if (!validated) return;
    setSeconds(AUTO_RESET_S);
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
  }, [validated, onReset]);

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
        sx={{ bgcolor: INK, py: 5, px: 4, textAlign: "center", color: SURFACE.text }}
      >
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
