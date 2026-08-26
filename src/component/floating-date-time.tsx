"use client";

import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

const NEW_YORK_TIME_ZONE = "America/New_York";

export default function FloatingDateTime() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const updateTime = () => setNow(new Date());
    updateTime();

    const interval = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(interval);
  }, []);

  if (!now) return null;

  const date = now.toLocaleDateString("en-US", {
    timeZone: NEW_YORK_TIME_ZONE,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const time = now.toLocaleTimeString("en-US", {
    timeZone: NEW_YORK_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <Box
      sx={{
        position: "fixed",
        top: { xs: 8, md: 12 },
        right: { xs: 8, md: 16 },
        zIndex: 2000,
        pointerEvents: "none",
        px: { xs: 1.25, md: 1.75 },
        py: { xs: 0.65, md: 0.8 },
        borderRadius: 1.5,
        bgcolor: "rgba(0, 0, 0, 0.68)",
        color: "white",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
      }}
    >
      <Typography
        component="time"
        dateTime={now.toISOString()}
        fontWeight={700}
        textAlign="center"
        sx={{
          fontSize: { xs: "0.72rem", sm: "0.82rem", md: "0.9rem" },
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {date} at {time}
      </Typography>
    </Box>
  );
}
