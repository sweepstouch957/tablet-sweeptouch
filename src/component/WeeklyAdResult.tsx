"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  Chip,
  Divider,
  Paper,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { ScanResult, ConfirmResult } from "@/services/weeklyAdService";
import { BRAND, MAGENTA, NEUTRAL, SURFACE, STATE, RADIUS } from "@/libs/brand";

interface Props {
  scan: ScanResult;
  onConfirm: (scanId: string, products: string[]) => Promise<ConfirmResult>;
  onReset: () => void;
}

export default function WeeklyAdResult({ scan, onConfirm, onReset }: Props) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmResult, setConfirmResult] = useState<ConfirmResult | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [autoResetTimer, setAutoResetTimer] = useState(45);

  // Auto-reset countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setAutoResetTimer((prev) => {
        if (prev <= 1) {
          onReset();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onReset]);

  const toggleProduct = useCallback((productName: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productName)
        ? prev.filter((p) => p !== productName)
        : [...prev, productName]
    );
  }, []);

  const handleConfirm = useCallback(async () => {
    if (selectedProducts.length === 0) return;
    setConfirming(true);
    try {
      const result = await onConfirm(scan._id, selectedProducts);
      setConfirmResult(result);
      setConfirmed(true);
    } catch (err) {
      console.error("Confirm failed:", err);
    } finally {
      setConfirming(false);
    }
  }, [scan._id, selectedProducts, onConfirm]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: SURFACE.page,
        color: SURFACE.text,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        px: 3,
        py: 4,
        position: "relative",
      }}
    >
      {/* Auto-reset timer */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography variant="caption" sx={{ opacity: 0.6 }}>
          Auto-reset in {autoResetTimer}s
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={onReset}
          sx={{
            color: SURFACE.text,
            borderColor: SURFACE.line,
            fontSize: 12,
            "&:hover": { borderColor: "white" },
          }}
        >
          Next →
        </Button>
      </Box>

      {/* Welcome */}
      <Box sx={{ textAlign: "center", mt: 2, mb: 3 }}>
        <Typography sx={{ fontSize: 60, mb: 1 }}>🎉</Typography>
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            background: BRAND.magenta,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
          }}
        >
          Welcome!
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          {scan.customerName}
        </Typography>
      </Box>

      {/* Points Card */}
      <Paper
        elevation={8}
        sx={{
          background: BRAND.magenta,
          borderRadius: 3,
          p: 3,
          width: "100%",
          maxWidth: 400,
          textAlign: "center",
          mb: 3,
          color: SURFACE.text,
        }}
      >
        <Typography sx={{ fontSize: 14, opacity: 0.9, mb: 0.5 }}>
          POINTS EARNED THIS VISIT
        </Typography>
        <Typography
          variant="h2"
          sx={{
            fontWeight: "bold",
            mb: 0.5,
            textShadow: "0 2px 10px rgba(0,0,0,0.3)",
          }}
        >
          +{confirmed && confirmResult ? confirmResult.totalPointsThisScan : scan.totalPointsThisScan}
        </Typography>
        <Divider sx={{ my: 1.5, borderColor: SURFACE.line }} />
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography sx={{ fontSize: 11, opacity: 0.8 }}>Base Points</Typography>
            <Typography sx={{ fontWeight: "bold", fontSize: 18 }}>
              +{scan.basePointsAwarded}
            </Typography>
          </Box>
          {confirmed && confirmResult && confirmResult.bonusPointsAwarded > 0 && (
            <Box>
              <Typography sx={{ fontSize: 11, opacity: 0.8 }}>Bonus</Typography>
              <Typography sx={{ fontWeight: "bold", fontSize: 18, color: BRAND.magenta }}>
                +{confirmResult.bonusPointsAwarded}
              </Typography>
            </Box>
          )}
          <Box>
            <Typography sx={{ fontSize: 11, opacity: 0.8 }}>Total All-Time</Typography>
            <Typography sx={{ fontWeight: "bold", fontSize: 18 }}>
              {confirmed && confirmResult ? confirmResult.totalPointsAllTime : scan.totalPointsAllTime}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Campaign Products */}
      <Box sx={{ width: "100%", maxWidth: 400, mb: 3 }}>
        <Typography
          sx={{
            fontWeight: "bold",
            fontSize: 16,
            mb: 1.5,
            textAlign: "center",
            color: BRAND.magenta,
          }}
        >
          📋 This Week&apos;s Offers
        </Typography>

        {scan.campaignProducts.map((product, idx) => (
          <Paper
            key={idx}
            elevation={2}
            sx={{
              display: "flex",
              alignItems: "center",
              p: 1.5,
              mb: 1,
              borderRadius: 2,
              background: selectedProducts.includes(product.name)
                ? "rgba(76, 175, 80, 0.15)"
                : SURFACE.raised,
              border: selectedProducts.includes(product.name)
                ? "1px solid rgba(76, 175, 80, 0.5)"
                : `1px solid ${SURFACE.line}`,
              transition: "all 0.2s ease",
              cursor: confirmed ? "default" : "pointer",
              "&:hover": confirmed
                ? {}
                : { background: SURFACE.sunken },
            }}
            onClick={() => !confirmed && toggleProduct(product.name)}
          >
            {!confirmed && (
              <Checkbox
                checked={selectedProducts.includes(product.name)}
                sx={{
                  color: SURFACE.textMuted,
                  "&.Mui-checked": { color: STATE.ok },
                  p: 0.5,
                  mr: 1,
                }}
              />
            )}
            {confirmed && selectedProducts.includes(product.name) && (
              <CheckCircleIcon
                sx={{ color: STATE.ok, mr: 1, fontSize: 20 }}
              />
            )}
            {/* Product visual: image or emoji */}
            {product.imageUrl && product.imageUrl !== "no-image.jpg" && product.imageUrl !== "" ? (
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  minWidth: 44,
                  borderRadius: 1.5,
                  overflow: "hidden",
                  mr: 1.5,
                  bgcolor: SURFACE.text,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px solid ${SURFACE.line}`,
                }}
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  style={{ width: "85%", height: "85%", objectFit: "contain" }}
                />
              </Box>
            ) : (
              <Typography sx={{ fontSize: 24, mr: 1.5, minWidth: 44, textAlign: "center" }}>
                {product.emoji || "🛒"}
              </Typography>
            )}
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: 14,
                  color: product.isHero ? BRAND.magenta : "white",
                }}
              >
                {product.name}
                {product.isHero && (
                  <Chip
                    label="⭐ DEAL"
                    size="small"
                    sx={{
                      ml: 1,
                      height: 18,
                      fontSize: 9,
                      bgcolor: BRAND.magenta,
                      color: NEUTRAL[75],
                      fontWeight: "bold",
                    }}
                  />
                )}
              </Typography>
              <Typography sx={{ color: BRAND.magenta, fontWeight: "bold", fontSize: 16 }}>
                {product.price}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Confirm Button */}
      {!confirmed && (
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={selectedProducts.length === 0 || confirming}
          fullWidth
          sx={{
            maxWidth: 400,
            py: 1.5,
            fontWeight: "bold",
            fontSize: 16,
            borderRadius: 2,
            background:
              selectedProducts.length > 0
                ? STATE.ok
                : NEUTRAL[50],
            "&:hover": {
              background: STATE.ok,
            },
            boxShadow: selectedProducts.length > 0
              ? "0 4px 20px rgba(76, 175, 80, 0.4)"
              : "none",
          }}
        >
          {confirming
            ? "Confirming..."
            : selectedProducts.length > 0
            ? `✅ Confirm ${selectedProducts.length} Product${selectedProducts.length > 1 ? "s" : ""} Purchased`
            : "Select products the customer purchased"}
        </Button>
      )}

      {confirmed && confirmResult && (
        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ color: STATE.ok, fontWeight: "bold", fontSize: 18, mb: 1 }}>
            ✅ Purchase Confirmed!
          </Typography>
          {confirmResult.bonusPointsAwarded > 0 && (
            <Typography sx={{ color: BRAND.magenta, fontSize: 14 }}>
              +{confirmResult.bonusPointsAwarded} bonus points awarded
            </Typography>
          )}
        </Box>
      )}

      {/* Campaign Code */}
      <Typography
        sx={{
          mt: 3,
          fontSize: 11,
          opacity: 0.4,
          fontFamily: "monospace",
        }}
      >
        {scan.barcode} | {scan.campaignCode}
      </Typography>
    </Box>
  );
}
