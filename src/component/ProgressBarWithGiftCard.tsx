"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  LinearProgress,
  Typography,
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Image from "next/image";

interface ProgressBarWithGiftCardProps {
  currentParticipations: number;
  targetParticipations: number;
  onComplete: () => void;
  /** Si se envía, este porcentaje (0–100) reemplaza el cálculo interno */
  percentOverride?: number;
}

const ProgressBarWithGiftCard: React.FC<ProgressBarWithGiftCardProps> = ({
  currentParticipations,
  targetParticipations,
  onComplete,
  percentOverride,
}) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Porcentaje mostrado (usa override si viene)
  const computedPercent = Math.min(
    100,
    percentOverride ??
      (currentParticipations / Math.max(1, targetParticipations)) * 100
  );

  useEffect(() => {
    const animationDuration = 1000;
    const start = progress;
    const end = computedPercent;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(1, elapsed / animationDuration);
      const animatedProgress = start + (end - start) * t;
      setProgress(animatedProgress);

      if (t < 1) {
        requestAnimationFrame(animate);
      } else if (computedPercent >= 100 && !isComplete) {
        setIsComplete(true);
        setShowPopup(true);
        onComplete();
      }
    };

    requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentParticipations,
    targetParticipations,
    computedPercent,
    isComplete,
    onComplete,
  ]);

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => setShowPopup(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  return (
    <>
      <Stack
        spacing={1}
        sx={{ width: "100%", p: 2, backgroundColor: "#222", borderRadius: 2 }}
      >
        {/* ✅ TITULO + TOOLTIP */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.8,
            mb: 0.5,
          }}
        >
          <Typography variant="body2" color="white" fontWeight="bold">
            Meta de Participaciones: {currentParticipations} /{" "}
            {targetParticipations}
          </Typography>

          <Tooltip
            title="Solo cuentan números nuevos registrados por primera vez en la tienda."
            arrow
            placement="top"
          >
            <IconButton size="small" sx={{ color: "#ff85c2", p: 0 }}>
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ width: "100%" }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 15,
                borderRadius: 5,
                backgroundColor: "#444",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#fc0680",
                  transition: "transform 1s ease-out",
                },
              }}
            />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="white">
              {`${Math.round(computedPercent)}%`}
            </Typography>
          </Box>
        </Box>

        {/* Gift Card */}
        <Box
          sx={{
            position: "relative",
            width: 100,
            height: 60,
            margin: "10px auto",
            opacity: isComplete ? 1 : 0.5,
            transform: isComplete ? "scale(1.2) rotate(5deg)" : "scale(1)",
            transition: "all 0.5s ease-in-out",
            cursor: "pointer",
          }}
        >
          <Image
            src="/gift-card.png"
            alt="Gift Card"
            fill
            style={{ objectFit: "contain" }}
          />
        </Box>

        {isComplete && (
          <Typography textAlign="center" color="#fc0680" fontWeight="bold">
            ¡Recompensa Desbloqueada!
          </Typography>
        )}
      </Stack>

      {/* Pop-up */}
      {showPopup && (
        <Box
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) scale(0)",
            zIndex: 10000,
            animation: "giftCardJump 0.5s ease-out forwards",
            "@keyframes giftCardJump": {
              "0%": { transform: "translate(-50%, -50%) scale(0)" },
              "50%": { transform: "translate(-50%, -50%) scale(1.5)" },
              "100%": { transform: "translate(-50%, -50%) scale(1)" },
            },
          }}
        >
          <Box
            sx={{
              width: 200,
              height: 120,
              position: "relative",
              boxShadow: "0 0 20px rgba(252, 6, 128, 0.8)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Image
              src="/gift-card.png"
              alt="Gift Card Pop-up"
              fill
              style={{ objectFit: "cover" }}
            />
          </Box>
          <Typography
            variant="h6"
            textAlign="center"
            mt={1}
            sx={{
              color: "#fc0680",
              fontWeight: "bold",
              textShadow: "1px 1px 2px #000",
            }}
          >
            ¡500 Participaciones!
          </Typography>
        </Box>
      )}
    </>
  );
};

export default ProgressBarWithGiftCard;
