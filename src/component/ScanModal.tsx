"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Dialog, DialogContent, Box, Typography, IconButton, TextField,
  Button, Paper, Stack, Chip, Switch, Slide, InputAdornment,
  Divider, CircularProgress,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import CloseIcon from "@mui/icons-material/Close";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import {
  fetchShoppingList, validateShoppingList,
  type ShoppingListResult as ShoppingListType,
} from "@/services/weeklyAdService";

const CATEGORY_ICONS: Record<string, string> = {
  meat: "🥩", seafood: "🦐", produce: "🥬", dairy: "🧀",
  bakery: "🍞", frozen: "🧊", pantry: "🥫", beverages: "🥤",
  deli: "🥪", other: "🛒",
};

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type ModalStep = "scan" | "camera" | "loading" | "result" | "validated" | "error";
type InputMode = "scanner" | "manual" | "camera";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ScanModal({ open, onClose }: Props) {
  const [step, setStep] = useState<ModalStep>("scan");
  const [inputMode, setInputMode] = useState<InputMode>("scanner");
  const [manualCode, setManualCode] = useState("");
  const [shoppingList, setShoppingList] = useState<ShoppingListType | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [validating, setValidating] = useState(false);
  const [cameraError, setCameraError] = useState("");

  // Barcode scanner buffer
  const inputRef = useRef<HTMLInputElement>(null);
  const [scanBuffer, setScanBuffer] = useState("");

  // Camera refs
  const cameraContainerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);

  // Auto-focus hidden input for hardware scanner
  useEffect(() => {
    if (!open || step !== "scan" || inputMode !== "scanner") return;
    const interval = setInterval(() => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
      }
    }, 300);
    return () => clearInterval(interval);
  }, [open, step, inputMode]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      stopCamera();
      setTimeout(() => {
        setStep("scan"); setInputMode("scanner"); setManualCode("");
        setShoppingList(null); setSelectedItems([]);
        setError(""); setScanBuffer(""); setCameraError("");
      }, 300);
    }
  }, [open]);

  // Camera lifecycle
  useEffect(() => {
    if (step === "camera" && open) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [step, open]);

  const startCamera = async () => {
    setCameraError("");
    // Wait for DOM element
    await new Promise((r) => setTimeout(r, 400));
    const container = document.getElementById("qr-reader-modal");
    if (!container) { setCameraError("Camera container not found"); return; }

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader-modal");
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1 },
        (decodedText: string) => {
          scanner.stop().catch(() => {});
          html5QrCodeRef.current = null;
          handleScan(decodedText);
        },
        () => {} // ignore scan failures
      );
    } catch (err: any) {
      console.error("[Camera]", err);
      setCameraError(err?.message || "Cannot access camera. Check permissions.");
    }
  };

  const stopCamera = () => {
    if (html5QrCodeRef.current) {
      try { html5QrCodeRef.current.stop(); } catch {}
      html5QrCodeRef.current = null;
    }
  };

  const handleScan = useCallback(async (code: string) => {
    const value = code.trim().toUpperCase();
    if (
      !(value.startsWith("SUPER-") && value.length >= 10) &&
      !(value.startsWith("SL-") && value.length >= 5)
    ) return;

    setStep("loading"); setError("");
    try {
      if (value.startsWith("SL-")) {
        const { shoppingList: list } = await fetchShoppingList(value);
        setShoppingList(list);
        setSelectedItems(list.items.map((i) => i.name));
        setStep("result");
      } else {
        setError("Standard barcode scan not yet implemented in modal");
        setStep("error");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Error looking up code");
      setStep("error");
    }
  }, []);

  const handleScannerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleScan(scanBuffer);
        setScanBuffer("");
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [scanBuffer, handleScan]
  );

  const handleManualSubmit = useCallback(() => {
    if (manualCode.trim().length >= 3) { handleScan(manualCode); setManualCode(""); }
  }, [manualCode, handleScan]);

  const toggleItem = useCallback((name: string) => {
    setSelectedItems((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }, []);

  const handleValidate = useCallback(async () => {
    if (!shoppingList || selectedItems.length === 0) return;
    setValidating(true);
    try {
      await validateShoppingList(shoppingList.qrCode, selectedItems);
      setStep("validated");
    } catch (err: any) {
      setError(err.response?.data?.error || "Validation failed");
      setStep("error");
    } finally { setValidating(false); }
  }, [shoppingList, selectedItems]);

  const goBack = () => {
    stopCamera();
    setStep("scan");
    setInputMode("scanner");
  };

  /* ─── Step titles ─── */
  const stepTitle: Record<ModalStep, string> = {
    scan: "Scan Code", camera: "📷 Camera Scanner", loading: "Looking up...",
    result: "Shopping List", validated: "Validated ✅", error: "Error",
  };

  return (
    <Dialog
      open={open} onClose={onClose} TransitionComponent={Transition}
      maxWidth="sm" fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
          color: "white", maxHeight: "90vh", overflow: "auto",
        },
      }}
    >
      {/* ─── Header ─── */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        px: 2.5, py: 1.5, borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(0,0,0,0.2)",
      }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          {!["scan", "loading"].includes(step) && (
            <IconButton onClick={goBack} sx={{ color: "rgba(255,255,255,0.7)" }} size="small">
              <ArrowBackIcon />
            </IconButton>
          )}
          <QrCodeScannerIcon sx={{ color: "#f43789", fontSize: 22 }} />
          <Typography fontWeight="bold" fontSize={16}>{stepTitle[step]}</Typography>
        </Stack>
        <IconButton onClick={onClose} sx={{ color: "rgba(255,255,255,0.6)" }} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {/* ═══════ SCAN STEP ═══════ */}
        {step === "scan" && (
          <Box sx={{ px: 3, py: 3, textAlign: "center" }}>
            {/* Hidden scanner input */}
            {inputMode === "scanner" && (
              <input ref={inputRef} type="text" inputMode="none" autoComplete="off" autoFocus value={scanBuffer}
                onChange={(e) => setScanBuffer(e.target.value)}
                onKeyDown={handleScannerKeyDown}
                style={{ position: "absolute", opacity: 0, width: 1, height: 1, overflow: "hidden" }}
                tabIndex={-1}
              />
            )}

            {/* Scan animation circle */}
            <Box sx={{
              width: 100, height: 100, borderRadius: "50%", mx: "auto", mb: 2,
              background: "linear-gradient(135deg, #f43789 0%, #ff6b9d 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 30px rgba(244,55,137,0.3)",
              animation: "modalPulse 2s ease-in-out infinite",
              "@keyframes modalPulse": {
                "0%,100%": { transform: "scale(1)", boxShadow: "0 0 30px rgba(244,55,137,0.3)" },
                "50%": { transform: "scale(1.05)", boxShadow: "0 0 50px rgba(244,55,137,0.5)" },
              },
            }}>
              <QrCodeScannerIcon sx={{ fontSize: 42, color: "white" }} />
            </Box>

            <Typography variant="h6" fontWeight="bold" mb={0.5}>Point scanner at code</Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)", mb: 2 }}>
              MMS barcode or Shopping List QR
            </Typography>

            {/* Status */}
            <Box sx={{
              display: "inline-flex", alignItems: "center", gap: 1, px: 2, py: 0.6,
              borderRadius: 2, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", mb: 2,
            }}>
              <Box sx={{
                width: 8, height: 8, borderRadius: "50%", backgroundColor: "#4caf50",
                animation: "blink 1.5s infinite",
                "@keyframes blink": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.3 } },
              }} />
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>Scanner ready</Typography>
            </Box>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 2 }} />

            {/* Mode buttons OR manual input */}
            {inputMode === "scanner" ? (
              <Stack direction="row" spacing={1.5} justifyContent="center">
                <Button variant="outlined" size="small" startIcon={<KeyboardIcon />}
                  onClick={() => setInputMode("manual")}
                  sx={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", textTransform: "none", fontSize: 13, borderRadius: 2, "&:hover": { borderColor: "#f43789", color: "#f43789" } }}>
                  Type code
                </Button>
                <Button variant="outlined" size="small" startIcon={<CameraAltIcon />}
                  onClick={() => setStep("camera")}
                  sx={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", textTransform: "none", fontSize: 13, borderRadius: 2, "&:hover": { borderColor: "#f43789", color: "#f43789" } }}>
                  Use camera
                </Button>
              </Stack>
            ) : (
              <Box sx={{ mt: 1 }}>
                <TextField fullWidth autoFocus placeholder="Enter code (e.g. SL-XXXXXX)"
                  value={manualCode} onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()} size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "rgba(255,255,255,0.4)" }} /></InputAdornment>,
                    sx: { color: "white", bgcolor: "rgba(255,255,255,0.06)", borderRadius: 2, "& fieldset": { borderColor: "rgba(255,255,255,0.12)" }, "&:hover fieldset": { borderColor: "#f43789" }, "&.Mui-focused fieldset": { borderColor: "#f43789" } },
                  }}
                />
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                  <Button variant="outlined" onClick={() => setInputMode("scanner")} sx={{ flex: 1, borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", textTransform: "none", borderRadius: 2 }}>
                    Back
                  </Button>
                  <Button fullWidth variant="contained" onClick={handleManualSubmit} disabled={manualCode.trim().length < 3}
                    sx={{ flex: 2, background: "linear-gradient(135deg, #f43789 0%, #ff6b9d 100%)", textTransform: "none", fontWeight: "bold", borderRadius: 2, "&:hover": { background: "linear-gradient(135deg, #d42f78 0%, #f43789 100%)" }, "&.Mui-disabled": { bgcolor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" } }}>
                    Look up code
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>
        )}

        {/* ═══════ CAMERA STEP ═══════ */}
        {step === "camera" && (
          <Box sx={{ px: 2, py: 2, textAlign: "center" }}>
            <Box ref={cameraContainerRef} id="qr-reader-modal"
              sx={{
                width: "100%", maxWidth: 360, mx: "auto", borderRadius: 3, overflow: "hidden",
                border: "3px solid rgba(244,55,137,0.5)",
                "& video": { borderRadius: 2 },
                "& #qr-shaded-region": { borderColor: "#f43789 !important" },
              }}
            />
            {cameraError && (
              <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "rgba(255,50,50,0.12)", border: "1px solid rgba(255,50,50,0.3)" }}>
                <VideocamOffIcon sx={{ fontSize: 32, color: "#ff5252", mb: 0.5 }} />
                <Typography sx={{ color: "#ff5252", fontSize: 13 }}>{cameraError}</Typography>
              </Box>
            )}
            <Typography sx={{ mt: 2, color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
              Point camera at QR code — it will scan automatically
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
              <Button variant="outlined" size="small" startIcon={<KeyboardIcon />}
                onClick={() => { stopCamera(); setStep("scan"); setInputMode("manual"); }}
                sx={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", textTransform: "none", borderRadius: 2 }}>
                Type code instead
              </Button>
              <Button variant="outlined" size="small" startIcon={<ArrowBackIcon />}
                onClick={goBack}
                sx={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", textTransform: "none", borderRadius: 2 }}>
                Back
              </Button>
            </Stack>
          </Box>
        )}

        {/* ═══════ LOADING ═══════ */}
        {step === "loading" && (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <CircularProgress size={60} sx={{ color: "#f43789", mb: 2 }} />
            <Typography fontWeight="bold">Looking up code...</Typography>
          </Box>
        )}

        {/* ═══════ RESULT ═══════ */}
        {step === "result" && shoppingList && (
          <Box sx={{ px: 2.5, py: 2.5 }}>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Chip label={shoppingList.qrCode} sx={{ bgcolor: "rgba(244,55,137,0.15)", color: "#f43789", fontFamily: "monospace", fontWeight: "bold", fontSize: 13, mb: 1 }} />
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
                {shoppingList.totalItems} items • {shoppingList.storeSlug?.split("-").slice(0, 3).join(" ") || "Store"}
              </Typography>
            </Box>

            {/* Points card */}
            <Paper sx={{ background: "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)", borderRadius: 2.5, p: 2, textAlign: "center", mb: 2, color: "white" }}>
              <Typography sx={{ fontSize: 11, opacity: 0.9, textTransform: "uppercase", letterSpacing: 1 }}>Potential Points</Typography>
              <Typography variant="h3" fontWeight="bold" sx={{ textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>+{selectedItems.length}</Typography>
              <Typography sx={{ fontSize: 11, opacity: 0.75 }}>1 point per validated product</Typography>
            </Paper>

            <Typography sx={{ fontWeight: "bold", fontSize: 13, mb: 1, color: "#FFD700", textAlign: "center" }}>
              📋 Customer&apos;s Selected Items
            </Typography>

            {shoppingList.items.map((item, idx) => {
              const hasImage = item.imageUrl && item.imageUrl !== "no-image.jpg" && item.imageUrl !== "";
              const emoji = CATEGORY_ICONS[item.category || "other"] || "🛒";
              const isSelected = selectedItems.includes(item.name);
              return (
                <Paper key={idx} elevation={0} onClick={() => toggleItem(item.name)}
                  sx={{
                    display: "flex", alignItems: "center", p: 1.2, mb: 0.8, borderRadius: 2, cursor: "pointer",
                    background: isSelected ? "rgba(76,175,80,0.12)" : "rgba(255,255,255,0.04)",
                    border: isSelected ? "1px solid rgba(76,175,80,0.4)" : "1px solid rgba(255,255,255,0.06)",
                    transition: "all 0.15s ease", "&:hover": { background: "rgba(255,255,255,0.08)" },
                  }}>
                  <Switch checked={isSelected} size="small" sx={{ mr: 0.8, "& .MuiSwitch-switchBase.Mui-checked": { color: "#4caf50" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#4caf50" } }} />
                  {hasImage ? (
                    <Box sx={{ width: 36, height: 36, minWidth: 36, borderRadius: 1.5, overflow: "hidden", mr: 1.2, bgcolor: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img src={item.imageUrl} alt={item.name} style={{ width: "85%", height: "85%", objectFit: "contain" }} />
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: 22, mr: 1.2, minWidth: 36, textAlign: "center" }}>{emoji}</Typography>
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: "bold", fontSize: 13, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography sx={{ color: "#FFD700", fontWeight: "bold", fontSize: 14 }}>{item.price}</Typography>
                      <Chip label={`×${item.quantity} ${item.unit}`} size="small" sx={{ height: 18, fontSize: 10, bgcolor: "rgba(255,255,255,0.08)", color: "white", fontWeight: "bold" }} />
                    </Stack>
                  </Box>
                </Paper>
              );
            })}

            <Button fullWidth variant="contained" onClick={handleValidate}
              disabled={selectedItems.length === 0 || validating}
              sx={{
                mt: 2, py: 1.5, fontWeight: "bold", fontSize: 15, borderRadius: 2, textTransform: "none",
                background: selectedItems.length > 0 ? "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)" : "rgba(255,255,255,0.08)",
                boxShadow: selectedItems.length > 0 ? "0 4px 16px rgba(76,175,80,0.35)" : "none",
                "&:hover": { background: "linear-gradient(135deg, #388e3c 0%, #4caf50 100%)" },
              }}>
              {validating ? "Validating..." : selectedItems.length > 0 ? `✅ Validate ${selectedItems.length} Item${selectedItems.length > 1 ? "s" : ""} & Award Points` : "Toggle items above"}
            </Button>
          </Box>
        )}

        {/* ═══════ VALIDATED ═══════ */}
        {step === "validated" && (
          <Box sx={{ py: 5, px: 3, textAlign: "center" }}>
            <Typography variant="h5" fontWeight="bold" sx={{ color: "#4caf50", mb: 3 }}>Purchase Validated!</Typography>
            <Button variant="outlined" onClick={onClose} sx={{ borderColor: "rgba(255,255,255,0.2)", color: "white", textTransform: "none", borderRadius: 2, px: 4, "&:hover": { borderColor: "#f43789", color: "#f43789" } }}>
              Close
            </Button>
          </Box>
        )}

        {/* ═══════ ERROR ═══════ */}
        {step === "error" && (
          <Box sx={{ py: 5, px: 3, textAlign: "center" }}>
            <Typography sx={{ fontSize: 48, mb: 1 }}>❌</Typography>
            <Typography variant="h6" fontWeight="bold" mb={1}>Not Found</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.5)", mb: 3, fontSize: 13 }}>{error}</Typography>
            <Button variant="contained" onClick={goBack}
              sx={{ background: "linear-gradient(135deg, #f43789 0%, #ff6b9d 100%)", textTransform: "none", fontWeight: "bold", borderRadius: 2, px: 4 }}>
              Try Again
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
