"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography, Stack } from "@mui/material";
import Image from "next/image";
import { Store } from "@/services/store.service";
import { useActiveSweepstake } from "@/hooks/useActiveSwepake";
import { usePromos } from "@/hooks/usePromos";
import PhoneKeypad from "./PhoneKeypad";
import { PhoneInputModal } from "./inputModal";
import PrivacyDialog from "./pannel";
import Logo from "@public/logo.webp";

const imagesDummy = [
  "https://res.cloudinary.com/dg9gzic4s/image/upload/v1763078132/2_oadnkv.png",
  "https://res.cloudinary.com/dg9gzic4s/image/upload/v1763078132/3_dhbtm0.png",
  "https://res.cloudinary.com/dg9gzic4s/image/upload/v1763078131/1_o4rplu.png",
  "https://res.cloudinary.com/dg9gzic4s/image/upload/v1763078132/2_oadnkv.png",
];

interface Props {
  store?: Store;
}

function useCountdown(endDate?: string) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (!endDate) return;
    const tick = () => {
      const diff = Math.max(0, new Date(endDate).getTime() - Date.now());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ d, h, m, s });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [endDate]);

  return timeLeft;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <Box textAlign="center">
      <Box
        sx={{
          bgcolor: "rgba(0,0,0,0.35)",
          border: "1.5px solid rgba(255,200,0,0.4)",
          borderRadius: "8px",
          px: { xs: 1, md: 1.5 },
          py: { xs: 0.5, md: 0.8 },
          minWidth: { xs: 44, md: 54 },
        }}
      >
        <Typography
          sx={{
            fontWeight: 900,
            fontSize: { xs: "1.4rem", md: "1.8rem" },
            color: "#FFD600",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {String(value).padStart(2, "0")}
        </Typography>
      </Box>
      <Typography
        sx={{
          color: "rgba(255,220,0,0.75)",
          fontSize: { xs: "0.55rem", md: "0.65rem" },
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1,
          mt: 0.3,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export default function KioskLayoutRed({ store }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  const { data } = useActiveSweepstake(store?._id);
  const { data: promosData } = usePromos("tablet", store?._id);

  const images = promosData?.length
    ? promosData.map((p) => p.imageMobile)
    : imagesDummy;

  const prize = data?.prize?.[0];
  const countdown = useCountdown(data?.endDate);

  useEffect(() => {
    const t = setInterval(
      () => setImgIndex((i) => (i + 1) % Math.max(images.length, 1)),
      5000
    );
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <Box
      display="flex"
      flexDirection={{ xs: "column", md: "row" }}
      minHeight="100vh"
      overflow="hidden"
    >
      {/* LEFT — Red brand panel */}
      <Box
        flex={{ xs: "none", md: "0 0 30%" }}
        minHeight={{ xs: "auto", md: "100vh" }}
        sx={{
          background:
            "linear-gradient(175deg, #7f0000 0%, #b71c1c 40%, #e53935 80%, #ef5350 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, md: 2.5 },
          py: { xs: 2, md: 3 },
          gap: { xs: 1, md: 1.5 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative */}
        <Box
          sx={{
            position: "absolute",
            top: -60,
            left: -60,
            width: 200,
            height: 200,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,0,0.06)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -40,
            right: -40,
            width: 160,
            height: 160,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.04)",
            pointerEvents: "none",
          }}
        />

        {/* Store logo */}
        {store?.image && (
          <Box sx={{ zIndex: 1 }}>
            <Image
              src={store.image}
              alt={store.name || "Store"}
              width={140}
              height={70}
              style={{ objectFit: "contain" }}
            />
          </Box>
        )}

        {/* Headline */}
        <Box textAlign="center" sx={{ zIndex: 1, px: 1 }}>
          <Typography
            sx={{
              color: "#FFD600",
              fontWeight: 900,
              fontSize: { xs: "1.1rem", md: "1.4rem" },
              textTransform: "uppercase",
              lineHeight: 1.15,
              textShadow: "0 2px 10px rgba(0,0,0,0.4)",
              letterSpacing: 0.5,
            }}
          >
            🏆 Register &amp; WIN!
          </Typography>
          {data?.name && (
            <Typography
              sx={{
                color: "rgba(255,255,255,0.8)",
                fontWeight: 700,
                fontSize: { xs: "0.8rem", md: "0.95rem" },
                mt: 0.3,
              }}
            >
              {data.name}
            </Typography>
          )}
        </Box>

        {/* Prize image */}
        {prize?.image && (
          <Box
            sx={{
              zIndex: 1,
              width: "100%",
              maxWidth: { xs: 160, md: 220 },
              textAlign: "center",
            }}
          >
            <img
              src={prize.image}
              alt={prize.name}
              style={{
                width: "100%",
                maxHeight: 170,
                objectFit: "contain",
                filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.4))",
              }}
            />
            <Typography
              sx={{
                color: "#FFD600",
                fontWeight: 900,
                fontSize: { xs: "0.85rem", md: "1rem" },
                textTransform: "uppercase",
                mt: 0.5,
                textShadow: "0 1px 4px rgba(0,0,0,0.3)",
              }}
            >
              {prize.name}
            </Typography>
          </Box>
        )}

        {/* Countdown */}
        {data?.endDate && (
          <Box sx={{ zIndex: 1, textAlign: "center" }}>
            <Typography
              sx={{
                color: "rgba(255,220,0,0.7)",
                fontSize: "0.65rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                mb: 0.5,
              }}
            >
              ⏱ Ends in
            </Typography>
            <Stack direction="row" gap={{ xs: 0.6, md: 1 }} justifyContent="center">
              <CountdownUnit value={countdown.d} label="Days" />
              <CountdownUnit value={countdown.h} label="Hrs" />
              <CountdownUnit value={countdown.m} label="Min" />
              <CountdownUnit value={countdown.s} label="Sec" />
            </Stack>
          </Box>
        )}

        {/* Sweepstouch */}
        <Box sx={{ zIndex: 1, opacity: 0.65, mt: 0.5 }}>
          <Image
            src={Logo.src}
            alt="Sweepstouch"
            width={100}
            height={25}
            style={{ objectFit: "contain" }}
          />
        </Box>
      </Box>

      {/* MIDDLE — Keypad panel */}
      <Box
        flex={{ xs: "none", md: "0 0 32%" }}
        minHeight={{ xs: "auto", md: "100vh" }}
        sx={{
          background: "linear-gradient(175deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 3 },
          gap: 2,
        }}
      >
        <Typography
          sx={{
            color: "#fff",
            fontWeight: 900,
            fontSize: { xs: "1.1rem", md: "1.4rem" },
            textTransform: "uppercase",
            textAlign: "center",
            letterSpacing: 1,
            textShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
        >
          📱 Enter Your Number
        </Typography>
        <Typography
          sx={{
            color: "rgba(255,255,255,0.55)",
            fontSize: { xs: "0.8rem", md: "0.9rem" },
            textAlign: "center",
            mt: -1,
          }}
        >
          to participate for FREE
        </Typography>

        <PhoneKeypad
          variant="red"
          onSubmit={() => setModalOpen(true)}
          onKeypadClick={() => setModalOpen(true)}
        />

        <Typography
          onClick={() => setPrivacyOpen(true)}
          sx={{
            color: "rgba(255,255,255,0.35)",
            fontSize: "0.7rem",
            cursor: "pointer",
            textDecoration: "underline",
            mt: 1,
          }}
        >
          Privacy Policy / Terms
        </Typography>
      </Box>

      {/* RIGHT — Offers panel */}
      <Box
        flex={1}
        minHeight={{ xs: "auto", md: "100vh" }}
        sx={{
          background:
            "linear-gradient(175deg, #f57f17 0%, #f9a825 40%, #fdd835 80%, #fff9c4 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          px: { xs: 2, md: 2.5 },
          py: { xs: 2, md: 3 },
          overflow: "hidden",
        }}
      >
        <Typography
          sx={{
            fontWeight: 900,
            fontSize: { xs: "1.3rem", md: "1.7rem" },
            color: "#7f0000",
            textTransform: "uppercase",
            textAlign: "center",
            letterSpacing: 1.5,
            mb: { xs: 1.5, md: 2 },
            textShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        >
          🔥 Offers That You Love!
        </Typography>

        {/* Promo images — stacked carousel-like */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            width: "100%",
            maxWidth: 320,
            flex: 1,
            overflow: "hidden",
          }}
        >
          {images.slice(0, 3).map((src, i) => (
            <Box
              key={i}
              sx={{
                borderRadius: "14px",
                overflow: "hidden",
                width: "100%",
                aspectRatio: "16 / 9",
                bgcolor: "#fff",
                border: `2.5px solid ${
                  i === imgIndex % 3 ? "#b71c1c" : "rgba(127,0,0,0.15)"
                }`,
                transition: "border-color 0.6s ease",
                boxShadow: "0 4px 18px rgba(127,0,0,0.15)",
                flexShrink: i === 2 ? 1 : 0,
              }}
            >
              <img
                src={src}
                alt="Promo"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
          ))}
        </Box>
      </Box>

      <PhoneInputModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccessRegister={() => setModalOpen(false)}
        sweepstakeId={data?._id || ""}
        storeId={store?._id}
        storeName={store?.name}
        method="tablet"
        sweepstakeName={data?.name || ""}
        type={data?.optinType}
        hasQR={data?.hasQr}
      />
      <PrivacyDialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </Box>
  );
}
