"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

interface Props {
  onScan: (barcode: string) => void;
  disabled?: boolean;
}

/**
 * Hidden input that captures barcode scanner input (USB/Bluetooth HID).
 * Auto-focuses and detects SUPER-{CODE}-{ID} pattern.
 */
export default function WeeklyAdScanInput({ onScan, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [buffer, setBuffer] = useState("");

  // Keep input focused
  useEffect(() => {
    const interval = setInterval(() => {
      if (inputRef.current && document.activeElement !== inputRef.current && !disabled) {
        inputRef.current.focus();
      }
    }, 500);
    return () => clearInterval(interval);
  }, [disabled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      if (e.key === "Enter") {
        const value = buffer.trim().toUpperCase();
        if (value.startsWith("SUPER-") && value.length >= 10) {
          onScan(value);
        }
        setBuffer("");
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
    },
    [buffer, disabled, onScan]
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        px: 4,
      }}
    >
      {/* Scan animation */}
      <Box
        sx={{
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: disabled
            ? "linear-gradient(135deg, #ccc 0%, #999 100%)"
            : "linear-gradient(135deg, #DC1F26 0%, #ff6b6b 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 4,
          boxShadow: disabled
            ? "0 0 30px rgba(0,0,0,0.1)"
            : "0 0 40px rgba(220, 31, 38, 0.3), 0 0 80px rgba(220, 31, 38, 0.1)",
          animation: disabled ? "none" : "pulse 2s ease-in-out infinite",
          "@keyframes pulse": {
            "0%, 100%": {
              transform: "scale(1)",
              boxShadow: "0 0 40px rgba(220, 31, 38, 0.3)",
            },
            "50%": {
              transform: "scale(1.05)",
              boxShadow: "0 0 60px rgba(220, 31, 38, 0.5)",
            },
          },
        }}
      >
        <Typography sx={{ fontSize: 80 }}>
          {disabled ? "⏳" : "📷"}
        </Typography>
      </Box>

      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          mb: 1,
          color: disabled ? "#999" : "#333",
        }}
      >
        {disabled ? "Processing..." : "Scan MMS Code"}
      </Typography>

      <Typography
        variant="body1"
        sx={{ color: "#666", mb: 3, maxWidth: 400 }}
      >
        {disabled
          ? "Please wait while we process the barcode"
          : "Point the barcode scanner at the customer's MMS code"}
      </Typography>

      {/* Hidden barcode input */}
      <input
        ref={inputRef}
        type="text"
        autoFocus
        value={buffer}
        onChange={(e) => setBuffer(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          position: "absolute",
          opacity: 0,
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
        tabIndex={-1}
      />

      {/* Visual indicator */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 3,
          py: 1.5,
          borderRadius: 2,
          background: "#f5f5f5",
          border: "1px solid #e0e0e0",
        }}
      >
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: disabled ? "#ccc" : "#4caf50",
            animation: disabled ? "none" : "blink 1.5s infinite",
            "@keyframes blink": {
              "0%, 100%": { opacity: 1 },
              "50%": { opacity: 0.3 },
            },
          }}
        />
        <Typography variant="body2" color="text.secondary">
          {disabled ? "Scanner paused" : "Scanner ready — waiting for input"}
        </Typography>
      </Box>
    </Box>
  );
}
