"use client";

// Lo que ve la cajera cuando escanea el cupón del programa de referidos (RF-XXXXXX):
// de quién es, cuánto descuenta, compra mínima, si venció, y el botón para quemarlo.
// Mismo orden y mismo trato que el premio RW- (RewardClaimResult).

import React, { useState } from "react";
import { Box, Button, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import { BRAND, MAGENTA, SURFACE, STATE, TYPE, FONT, RADIUS } from "@/libs/brand";
import type { ReferralCoupon } from "@/services/redeem.service";

const PINK = BRAND.magenta;
const PINK_HOVER = MAGENTA[75];

interface Props {
  coupon: ReferralCoupon;
  /** Quema el cupón. Ausente = la cajera no está logueada. */
  onDeliver?: () => Promise<ReferralCoupon>;
  onReset: () => void;
  onNeedsLogin?: () => void;
}

const when = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("es-US", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

export default function ReferralCouponResult({ coupon: initial, onDeliver, onReset }: Props) {
  const [coupon, setCoupon] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const redeemed = coupon.status === "redeemed";
  const dead = coupon.status === "cancelled" || coupon.expired;

  const deliver = async () => {
    if (!onDeliver || busy) return;
    setBusy(true);
    setError("");
    try {
      const r = await onDeliver();
      setCoupon({ ...coupon, ...r, status: "redeemed" });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setError(e.response?.data?.error || e.message || "No se pudo canjear el cupón");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack alignItems="center" sx={{ px: 3, py: 4, gap: 2, textAlign: "center" }}>
      {redeemed ? (
        <CheckCircleRoundedIcon sx={{ fontSize: 64, color: STATE.ok }} />
      ) : dead ? (
        <BlockRoundedIcon sx={{ fontSize: 60, color: STATE.warn }} />
      ) : (
        <Box
          component="img"
          src="/kiosk2026/referral-coupon.png"
          alt="Cupón de $10 OFF"
          sx={{ width: 240, maxWidth: "100%", height: "auto", objectFit: "contain" }}
        />
      )}

      <Stack gap={0.5}>
        <Typography sx={{ fontSize: 20, lineHeight: 1.4, fontFamily: FONT, color: "#000", letterSpacing: ".04em" }}>
          {coupon.customerName || "Cliente"}
          {coupon.customerPhone ? ` · ${coupon.customerPhone}` : ""}
        </Typography>
        <Typography sx={{ ...TYPE.h2, fontFamily: FONT, color: SURFACE.text, fontWeight: 900 }}>
          {coupon.title}
        </Typography>
        <Typography sx={{ fontSize: 20, lineHeight: 1.4, fontFamily: FONT, color: "#000", letterSpacing: ".1em" }}>
          {coupon.code}
        </Typography>
      </Stack>

      <Chip
        label={redeemed ? "Canjeado" : coupon.expired ? "Vencido" : coupon.status === "cancelled" ? "Cancelado" : "Listo para canjear"}
        sx={{
          fontFamily: FONT,
          fontWeight: 800,
          bgcolor: redeemed ? "rgba(46,160,67,.16)" : dead ? "rgba(255,171,0,.16)" : "rgba(252,6,128,.16)",
          color: redeemed ? STATE.ok : dead ? STATE.warn : PINK,
        }}
      />

      <Typography sx={{ fontSize: 22, lineHeight: 1.5, fontFamily: FONT, color: "#000", maxWidth: 620 }}>
        Cupón del programa de referidos (invitó a sus amigos).
        {coupon.minPurchase > 0 ? ` Aplica en compras de $${coupon.minPurchase} o más.` : ""}
        {coupon.expiresAt ? ` Vence ${when(coupon.expiresAt)}.` : ""}
        {coupon.terms ? ` ${coupon.terms}` : ""}
      </Typography>

      {error && (
        <Typography sx={{ ...TYPE.small, fontFamily: FONT, color: STATE.error, maxWidth: 420 }}>
          {error}
        </Typography>
      )}

      {redeemed ? (
        <Typography sx={{ fontSize: 20, lineHeight: 1.5, fontFamily: FONT, color: "#000", maxWidth: 620 }}>
          {coupon.redeemedAt ? `Este cupón ya se usó el ${when(coupon.redeemedAt)}.` : "Cupón canjeado."} Cada código vale una sola vez.
        </Typography>
      ) : dead ? null : onDeliver ? (
        <Button
          variant="contained"
          disableElevation
          onClick={deliver}
          disabled={busy}
          startIcon={busy ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <CheckCircleRoundedIcon />}
          sx={{ mt: 0.5, px: 4, py: 1.25, borderRadius: `${RADIUS.md}px`, fontFamily: FONT, fontWeight: 900, bgcolor: PINK, "&:hover": { bgcolor: PINK_HOVER } }}
        >
          Aplicar {coupon.title} y canjear
        </Button>
      ) : null}

      <Box>
        <Button onClick={onReset} sx={{ fontFamily: FONT, fontSize: 20, color: "#000", textTransform: "none" }}>
          Escanear otro código
        </Button>
      </Box>
    </Stack>
  );
}
