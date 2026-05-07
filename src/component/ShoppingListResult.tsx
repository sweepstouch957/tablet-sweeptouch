"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Divider,
  Chip,
  Switch,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import type {
  ShoppingListResult as ShoppingListResultType,
  ShoppingListValidateResult,
} from "@/services/weeklyAdService";

const CATEGORY_ICONS: Record<string, string> = {
  meat: "🥩", seafood: "🦐", produce: "🥬", dairy: "🧀",
  bakery: "🍞", frozen: "🧊", pantry: "🥫", beverages: "🥤",
  deli: "🥪", other: "🛒",
};

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
  const [selectedItems, setSelectedItems] = useState<string[]>(
    // Start with all items selected
    shoppingList.items.map((i) => i.name)
  );
  const [validated, setValidated] = useState(false);
  const [validateResult, setValidateResult] =
    useState<ShoppingListValidateResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [autoResetTimer, setAutoResetTimer] = useState(60);

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

  const toggleItem = useCallback((itemName: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((n) => n !== itemName)
        : [...prev, itemName]
    );
  }, []);

  const handleValidate = useCallback(async () => {
    if (selectedItems.length === 0) return;
    setValidating(true);
    try {
      const result = await onValidate(shoppingList.qrCode, selectedItems);
      setValidateResult(result);
      setValidated(true);
    } catch (err) {
      console.error("Validation failed:", err);
    } finally {
      setValidating(false);
    }
  }, [shoppingList.qrCode, selectedItems, onValidate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        color: "white",
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
            color: "white",
            borderColor: "rgba(255,255,255,0.3)",
            fontSize: 12,
            "&:hover": { borderColor: "white" },
          }}
        >
          Next →
        </Button>
      </Box>

      {/* Header */}
      <Box sx={{ textAlign: "center", mt: 2, mb: 3 }}>
        <Typography sx={{ fontSize: 60, mb: 1 }}>🛒</Typography>
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            background: "linear-gradient(135deg, #4caf50, #81c784)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 0.5,
          }}
        >
          Shopping List
        </Typography>
        <Chip
          label={shoppingList.qrCode}
          sx={{
            bgcolor: "rgba(255,255,255,0.1)",
            color: "white",
            fontFamily: "monospace",
            fontWeight: "bold",
            fontSize: 14,
          }}
        />
        <Typography sx={{ color: "rgba(255,255,255,0.6)", mt: 1, fontSize: 13 }}>
          {shoppingList.totalItems} items • {shoppingList.storeSlug || "Store"}
        </Typography>
      </Box>

      {/* Points Preview */}
      <Paper
        elevation={8}
        sx={{
          background: "linear-gradient(135deg, #4caf50 0%, #81c784 100%)",
          borderRadius: 3,
          p: 3,
          width: "100%",
          maxWidth: 450,
          textAlign: "center",
          mb: 3,
          color: "white",
        }}
      >
        <Typography sx={{ fontSize: 14, opacity: 0.9, mb: 0.5 }}>
          {validated ? "POINTS AWARDED" : "POTENTIAL POINTS"}
        </Typography>
        <Typography
          variant="h2"
          sx={{
            fontWeight: "bold",
            textShadow: "0 2px 10px rgba(0,0,0,0.3)",
          }}
        >
          {validated && validateResult
            ? `+${validateResult.pointsAwarded}`
            : `+${selectedItems.length}`}
        </Typography>
        <Typography sx={{ fontSize: 12, opacity: 0.8, mt: 0.5 }}>
          1 point per validated product
        </Typography>
      </Paper>

      {/* Items List */}
      <Box sx={{ width: "100%", maxWidth: 450, mb: 3 }}>
        <Typography
          sx={{
            fontWeight: "bold",
            fontSize: 16,
            mb: 1.5,
            textAlign: "center",
            color: "#FFD700",
          }}
        >
          📋 Customer&apos;s Selected Items
        </Typography>

        {shoppingList.items.map((item, idx) => {
          const hasImage = item.imageUrl && item.imageUrl !== "no-image.jpg" && item.imageUrl !== "";
          const emoji = CATEGORY_ICONS[item.category || "other"] || "🛒";
          const isSelected = selectedItems.includes(item.name);

          return (
            <Paper
              key={idx}
              elevation={2}
              sx={{
                display: "flex",
                alignItems: "center",
                p: 1.5,
                mb: 1,
                borderRadius: 2,
                background: isSelected
                  ? "rgba(76, 175, 80, 0.15)"
                  : "rgba(255,255,255,0.05)",
                border: isSelected
                  ? "1px solid rgba(76, 175, 80, 0.5)"
                  : "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.2s ease",
                cursor: validated ? "default" : "pointer",
                "&:hover": validated
                  ? {}
                  : { background: "rgba(255,255,255,0.12)" },
              }}
              onClick={() => !validated && toggleItem(item.name)}
            >
              {/* Toggle */}
              {!validated && (
                <Switch
                  checked={isSelected}
                  size="small"
                  sx={{
                    mr: 1,
                    "& .MuiSwitch-switchBase.Mui-checked": { color: "#4caf50" },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#4caf50",
                    },
                  }}
                />
              )}
              {validated && isSelected && (
                <CheckCircleIcon
                  sx={{ color: "#4caf50", mr: 1, fontSize: 22 }}
                />
              )}

              {/* Product image */}
              {hasImage ? (
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    minWidth: 44,
                    borderRadius: 1.5,
                    overflow: "hidden",
                    mr: 1.5,
                    bgcolor: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{ width: "85%", height: "85%", objectFit: "contain" }}
                  />
                </Box>
              ) : (
                <Typography sx={{ fontSize: 28, mr: 1.5, minWidth: 44, textAlign: "center" }}>
                  {emoji}
                </Typography>
              )}

              {/* Item info */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{ fontWeight: "bold", fontSize: 14, color: "white" }}
                >
                  {item.name}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography
                    sx={{ color: "#FFD700", fontWeight: "bold", fontSize: 16 }}
                  >
                    {item.price}
                  </Typography>
                  <Chip
                    label={`×${item.quantity} ${item.unit}`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 11,
                      bgcolor: "rgba(255,255,255,0.1)",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  />
                </Stack>
              </Box>
            </Paper>
          );
        })}
      </Box>

      {/* Validate Button */}
      {!validated && (
        <Button
          variant="contained"
          onClick={handleValidate}
          disabled={selectedItems.length === 0 || validating}
          fullWidth
          sx={{
            maxWidth: 450,
            py: 2,
            fontWeight: "bold",
            fontSize: 18,
            borderRadius: 2,
            background:
              selectedItems.length > 0
                ? "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)"
                : "#555",
            "&:hover": {
              background: "linear-gradient(135deg, #388e3c 0%, #4caf50 100%)",
            },
            boxShadow:
              selectedItems.length > 0
                ? "0 4px 20px rgba(76, 175, 80, 0.4)"
                : "none",
          }}
        >
          {validating
            ? "Validating..."
            : selectedItems.length > 0
            ? `✅ Validate ${selectedItems.length} Item${selectedItems.length > 1 ? "s" : ""} & Award Points`
            : "Toggle items the customer purchased"}
        </Button>
      )}

      {validated && validateResult && (
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <CheckCircleIcon sx={{ fontSize: 48, color: "#4caf50", mb: 1 }} />
          <Typography
            sx={{ color: "#4caf50", fontWeight: "bold", fontSize: 20, mb: 1 }}
          >
            ✅ Purchase Validated!
          </Typography>
          <Typography sx={{ color: "#FFD700", fontSize: 16, fontWeight: "bold" }}>
            +{validateResult.pointsAwarded} points awarded
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: 12, mt: 1 }}>
            {validateResult.confirmedProducts} products confirmed
          </Typography>
        </Box>
      )}

      {/* QR Code */}
      <Typography
        sx={{
          mt: 3,
          fontSize: 11,
          opacity: 0.4,
          fontFamily: "monospace",
        }}
      >
        {shoppingList.qrCode}
      </Typography>
    </Box>
  );
}
