"use client";

import React, { useState, useCallback, Suspense } from "react";
import { Box, Typography, CircularProgress, Button, Stack } from "@mui/material";
import WeeklyAdScanInput from "@/component/WeeklyAdScanInput";
import WeeklyAdResult from "@/component/WeeklyAdResult";
import {
  scanWeeklyAdBarcode,
  confirmPurchase,
  type ScanResult,
} from "@/services/weeklyAdService";
import Image from "next/image";
import Logo from "@public/logo.webp";

type PageStateComponent = "waiting" | "loading" | "result" | "error";

function WeeklyAdScanContent() {
  const [state, setState] = useState<PageStateComponent>("waiting");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");

  const handleScan = useCallback(async (barcode: string) => {
    setState("loading");
    setError("");

    try {
      const { scan } = await scanWeeklyAdBarcode(barcode);
      setScanResult(scan);
      setState("result");
    } catch (err: any) {
      const msg =
        err.response?.data?.error || err.message || "Error processing barcode";
      setError(msg);
      setState("error");
    }
  }, []);

  const handleConfirm = useCallback(
    async (scanId: string, products: string[]) => {
      return confirmPurchase(scanId, products);
    },
    []
  );

  const handleReset = useCallback(() => {
    setState("waiting");
    setScanResult(null);
    setError("");
  }, []);

  // ─── WAITING STATE ─────────────────────────────────────
  if (state === "waiting") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)",
        }}
      >
        {/* Top bar */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 2,
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Image
            src={Logo.src}
            alt="Sweepstouch"
            width={180}
            height={30}
            style={{ objectFit: "contain" }}
          />
        </Box>

        <WeeklyAdScanInput onScan={handleScan} />
      </Box>
    );
  }

  // ─── LOADING STATE ─────────────────────────────────────
  if (state === "loading") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          color: "white",
        }}
      >
        <CircularProgress
          size={80}
          sx={{
            color: "#FFD700",
            mb: 3,
          }}
        />
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Verifying...
        </Typography>
        <Typography sx={{ opacity: 0.7, mt: 1 }}>
          Looking up your VIP code
        </Typography>
      </Box>
    );
  }

  // ─── ERROR STATE ──────────────────────────────────────
  if (state === "error") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #2d1b1b 0%, #1a1a2e 100%)",
          color: "white",
          px: 4,
          textAlign: "center",
        }}
      >
        <Typography sx={{ fontSize: 80, mb: 2 }}>❌</Typography>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
          Code Not Found
        </Typography>
        <Typography sx={{ opacity: 0.7, mb: 4, maxWidth: 400 }}>
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={handleReset}
          sx={{
            background: "linear-gradient(135deg, #DC1F26 0%, #ff6b6b 100%)",
            px: 4,
            py: 1.5,
            fontWeight: "bold",
            borderRadius: 2,
          }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  // ─── RESULT STATE ─────────────────────────────────────
  if (state === "result" && scanResult) {
    return (
      <WeeklyAdResult
        scan={scanResult}
        onConfirm={handleConfirm}
        onReset={handleReset}
      />
    );
  }

  return null;
}

export default function WeeklyAdScanPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <WeeklyAdScanContent />
    </Suspense>
  );
}
