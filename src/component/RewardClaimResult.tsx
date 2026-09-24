"use client";

// Lo que ve la cajera cuando escanea el QR de un premio (RW-XXXXXXXX).
//
// Mismo orden que la validación de listas: primero de quién es el premio,
// después qué se lleva, y al final el botón. Entregar es irreversible desde
// acá —el cupón queda quemado— así que el estado del canje se muestra antes
// que el botón, no después.

import React, { useState } from "react";
import { Box, Button, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CardGiftcardRoundedIcon from "@mui/icons-material/CardGiftcardRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";
import { BRAND, MAGENTA, SURFACE, STATE, TYPE, FONT, RADIUS } from "@/libs/brand";
import type { RewardClaim } from "@/services/redeem.service";

const PINK = BRAND.magenta;
const PINK_HOVER = MAGENTA[75];

interface Props {
  claim: RewardClaim;
  /** Entrega el premio. Ausente = la cajera no está logueada. */
  onDeliver?: () => Promise<RewardClaim>;
  onReset: () => void;
  /** Pide login de cajera (el kiosco ya tiene su diálogo). */
  onNeedsLogin?: () => void;
}

function money(claim: RewardClaim) {
  return claim.reward?.name || "Premio";
}

export default function RewardClaimResult({ claim: initial, onDeliver, onReset, onNeedsLogin }: Props) {
  const [claim, setClaim] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const delivered = claim.status === "fulfilled";
  const dead = claim.status === "rejected" || claim.status === "cancelled";

  const deliver = async () => {
    if (!onDeliver || busy) return;
    setBusy(true);
    setError("");
    try {
      setClaim(await onDeliver());
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setError(e.response?.data?.error || e.message || "No se pudo entregar el premio");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack alignItems="center" sx={{ px: 3, py: 4, gap: 2, textAlign: "center" }}>
      {delivered ? (
        <CheckCircleRoundedIcon sx={{ fontSize: 64, color: STATE.ok }} />
      ) : dead ? (
        <BlockRoundedIcon sx={{ fontSize: 60, color: STATE.warn }} />
      ) : (
        <CardGiftcardRoundedIcon sx={{ fontSize: 60, color: PINK }} />
      )}

      <Stack gap={0.5}>
        <Typography sx={{ ...TYPE.caption, fontFamily: FONT, color: SURFACE.textMuted, letterSpacing: ".08em" }}>
          {claim.claimantName || "Cliente VIP"}
          {claim.claimantPhone ? ` · ${claim.claimantPhone}` : ""}
        </Typography>
        <Typography sx={{ ...TYPE.h2, fontFamily: FONT, color: SURFACE.text, fontWeight: 900 }}>
          {money(claim)}
        </Typography>
        <Typography sx={{ ...TYPE.small, fontFamily: FONT, color: SURFACE.textBody, letterSpacing: ".1em" }}>
          {claim.redeemCode}
        </Typography>
      </Stack>

      <Chip
        label={
          delivered
            ? `Entregado${claim.validatedBy ? ` por ${claim.validatedBy}` : ""}`
            : dead
              ? "Cancelado"
              : "Pendiente de entrega"
        }
        sx={{
          fontFamily: FONT,
          fontWeight: 800,
          bgcolor: delivered ? "rgba(46,160,67,.16)" : dead ? "rgba(255,171,0,.16)" : "rgba(252,6,128,.16)",
          color: delivered ? STATE.ok : dead ? STATE.warn : PINK,
        }}
      />

      {/* Qué es y de dónde salió: una cajera que nunca vio el flujo del Pre-RCS
          necesita saber por qué este cliente tiene un cupón. */}
      <Typography sx={{ ...TYPE.small, fontFamily: FONT, color: SURFACE.textMuted, maxWidth: 420 }}>
        {claim.sourceType === "survey"
          ? "Lo ganó contestando la encuesta de la tienda."
          : claim.pointsSpent > 0
            ? `Canjeado con ${claim.pointsSpent} puntos.`
            : "Premio de la tienda."}
      </Typography>

      {error && (
        <Typography sx={{ ...TYPE.small, fontFamily: FONT, color: STATE.error, maxWidth: 420 }}>
          {error}
        </Typography>
      )}

      {delivered ? (
        <Typography sx={{ ...TYPE.small, fontFamily: FONT, color: SURFACE.textBody, maxWidth: 420 }}>
          {claim.fulfilledAt
            ? `Este cupón ya se usó el ${new Date(claim.fulfilledAt).toLocaleString("es-US", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}.`
            : "Este cupón ya se usó."}{" "}
          Cada QR vale una sola vez.
        </Typography>
      ) : dead ? null : onDeliver ? (
        <Button
          variant="contained"
          disableElevation
          onClick={deliver}
          disabled={busy}
          startIcon={busy ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <CheckCircleRoundedIcon />}
          sx={{
            mt: 0.5,
            px: 4,
            py: 1.25,
            borderRadius: `${RADIUS.md}px`,
            fontFamily: FONT,
            fontWeight: 900,
            bgcolor: PINK,
            "&:hover": { bgcolor: PINK_HOVER },
          }}
        >
          {busy ? "Entregando…" : `Entregar ${money(claim)}`}
        </Button>
      ) : (
        // Sin cajera logueada no se entrega: el backend lo rechaza igual, pero
        // acá se dice por qué y se ofrece el login en vez de un error seco.
        <Stack alignItems="center" gap={1} sx={{ mt: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: SURFACE.textBody }}>
            <LockPersonRoundedIcon sx={{ fontSize: 18 }} />
            <Typography sx={{ ...TYPE.small, fontFamily: FONT }}>
              Iniciá sesión como cajera para entregar el premio.
            </Typography>
          </Box>
          {onNeedsLogin && (
            <Button
              variant="contained"
              disableElevation
              onClick={onNeedsLogin}
              sx={{ px: 3, borderRadius: `${RADIUS.md}px`, fontFamily: FONT, fontWeight: 900, bgcolor: PINK, "&:hover": { bgcolor: PINK_HOVER } }}
            >
              Iniciar sesión
            </Button>
          )}
        </Stack>
      )}

      <Button onClick={onReset} sx={{ fontFamily: FONT, color: SURFACE.textBody, fontWeight: 700 }}>
        Escanear otro
      </Button>
    </Stack>
  );
}
