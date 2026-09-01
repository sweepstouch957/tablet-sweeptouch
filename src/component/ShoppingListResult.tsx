"use client";

// Lo que ve la cajera después de escanear una lista Pre-RCS.
//
// El orden de la pantalla es el orden en que ella trabaja: primero a quién le
// está validando, después qué se lleva, y recién al final el botón. Los puntos
// no encabezan porque no son la decisión — son la consecuencia.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";
// 6.3: iconos de relleno solido, esquinas redondeadas, un solo color.
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import SmsFailedRoundedIcon from "@mui/icons-material/SmsFailedRounded";
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
        sx={{ bgcolor: INK, py: 5, gap: 2, px: 4, textAlign: "center", color: SURFACE.text }}
      >
        <CheckCircleRoundedIcon sx={{ fontSize: 76, color: GREEN }} />
        <Typography sx={{ ...TYPE.h2, fontFamily: FONT }}>Purchase validated</Typography>
        <Typography sx={{ color: SURFACE.textMuted }}>
          {validateResult.confirmedProducts} product
          {validateResult.confirmedProducts === 1 ? "" : "s"} confirmed
          {customerName ? ` · ${customerName}` : ""}
        </Typography>

        <Stack direction="row" gap={1.5} sx={{ mt: 1.5, width: "min(90vw, 420px)" }}>
          <Stat
            label="For the customer"
            value={`+${validateResult.pointsAwarded}`}
            accent={PINK}
          />
          <Stat
            label="For you"
            value={`+${validateResult.cashierPointsAwarded ?? 0}`}
            accent={GREEN}
            muted={!validateResult.cashierPointsAwarded}
          />
        </Stack>

        <Stack direction="row" alignItems="center" gap={0.75} sx={{ mt: 0.5 }}>
          {validateResult.smsSent ? (
            <>
              <SmsRoundedIcon sx={{ fontSize: 17, color: STATE.ok }} />
              <Typography sx={{ ...TYPE.small, fontFamily: FONT, color: STATE.ok }}>
                Summary sent by SMS
              </Typography>
            </>
          ) : (
            <>
              <SmsFailedRoundedIcon sx={{ fontSize: 17, color: SURFACE.textMuted }} />
              <Typography sx={{ ...TYPE.small, fontFamily: FONT, color: SURFACE.textMuted }}>
                SMS did not go out — points were credited anyway
              </Typography>
            </>
          )}
        </Stack>

        {!validateResult.cashierPointsAwarded && (
          <Typography variant="caption" sx={{ color: SURFACE.textMuted, maxWidth: 340 }}>
            Your points were not credited because no cashier is signed in.
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
          Next customer
        </Button>
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
            Crediting points{customerName ? ` to ${customerName}` : ""}…
          </Typography>
          <Typography sx={{ ...TYPE.small, fontFamily: FONT, color: SURFACE.textMuted }}>
            {allItems.length} product{allItems.length === 1 ? "" : "s"} · {shoppingList.qrCode}
          </Typography>
        </>
      )}
    </Stack>
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
