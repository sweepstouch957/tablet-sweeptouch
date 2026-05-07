"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
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

export default function KioskLayoutPink({ store }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  const { data } = useActiveSweepstake(store?._id);
  const { data: promosData } = usePromos("tablet", store?._id);

  const images = promosData?.length
    ? promosData.map((p) => p.imageMobile)
    : imagesDummy;

  const prize = data?.prize?.[0];

  useEffect(() => {
    const t = setInterval(
      () => setImgIndex((i) => (i + 1) % Math.max(images.length, 1)),
      4000
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
      {/* LEFT — Pink panel */}
      <Box
        flex={{ xs: "none", md: "0 0 42%" }}
        minHeight={{ xs: "56vh", md: "100vh" }}
        sx={{
          background:
            "linear-gradient(160deg, #880e4f 0%, #c2185b 40%, #e91e8c 75%, #f06292 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 3 },
          gap: { xs: 1.5, md: 2 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.06)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -40,
            left: -40,
            width: 150,
            height: 150,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.04)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "30%",
            left: -20,
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.05)",
            pointerEvents: "none",
          }}
        />

        {/* Store logo */}
        {store?.image && (
          <Box sx={{ zIndex: 1 }}>
            <Image
              src={store.image}
              alt={store.name || "Store"}
              width={130}
              height={65}
              style={{ objectFit: "contain" }}
            />
          </Box>
        )}

        {/* Prize image */}
        {prize?.image && (
          <Box
            sx={{
              zIndex: 1,
              width: "100%",
              maxWidth: { xs: 200, md: 280 },
              textAlign: "center",
            }}
          >
            <img
              src={prize.image}
              alt={prize.name}
              style={{
                width: "100%",
                maxHeight: 200,
                objectFit: "contain",
                filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.35))",
              }}
            />
          </Box>
        )}

        {/* CTA text */}
        <Box textAlign="center" sx={{ zIndex: 1, px: 1 }}>
          <Typography
            sx={{
              color: "#fff",
              fontWeight: 900,
              fontSize: { xs: "1.3rem", md: "1.7rem" },
              textTransform: "uppercase",
              lineHeight: 1.1,
              textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            {prize?.name
              ? `WIN A ${prize.name.toUpperCase()}!`
              : "WIN AMAZING PRIZES!"}
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.88)",
              fontWeight: 700,
              fontSize: { xs: "0.9rem", md: "1.1rem" },
              mt: 0.4,
              textShadow: "0 1px 4px rgba(0,0,0,0.2)",
            }}
          >
            🎁 Participate for FREE
          </Typography>
        </Box>

        {/* Keypad */}
        <Box sx={{ zIndex: 1 }}>
          <PhoneKeypad
            variant="pink"
            onSubmit={() => setModalOpen(true)}
            onKeypadClick={() => setModalOpen(true)}
          />
        </Box>

        {/* Sweepstouch logo */}
        <Box sx={{ zIndex: 1, opacity: 0.75, mt: 0.5 }}>
          <Image
            src={Logo.src}
            alt="Sweepstouch"
            width={110}
            height={28}
            style={{ objectFit: "contain" }}
          />
        </Box>
      </Box>

      {/* RIGHT — Deals panel */}
      <Box
        flex={1}
        minHeight={{ xs: "44vh", md: "100vh" }}
        sx={{
          background: "linear-gradient(160deg, #fce4ec 0%, #fff9fb 50%, #fff 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          p: { xs: 2, md: 3 },
          overflow: "hidden",
        }}
      >
        <Typography
          sx={{
            fontWeight: 900,
            fontSize: { xs: "1.5rem", md: "2rem" },
            color: "#880e4f",
            textTransform: "uppercase",
            textAlign: "center",
            letterSpacing: 2,
            mb: { xs: 1.5, md: 2 },
          }}
        >
          🌸 Deals! Ofertas!
        </Typography>

        {/* Promo grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: { xs: 1, md: 1.5 },
            width: "100%",
            maxWidth: 560,
          }}
        >
          {images.slice(0, 4).map((src, i) => (
            <Box
              key={i}
              sx={{
                borderRadius: "14px",
                overflow: "hidden",
                aspectRatio: "1 / 1",
                bgcolor: "#fff",
                border: `2.5px solid ${
                  i === imgIndex % 4 ? "#e91e8c" : "#f8bbd9"
                }`,
                transition: "border-color 0.6s ease",
                boxShadow: "0 3px 16px rgba(233,30,140,0.12)",
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

        {/* Privacy link */}
        <Typography
          onClick={() => setPrivacyOpen(true)}
          sx={{
            mt: "auto",
            pt: 2,
            color: "#c2185b",
            fontSize: "0.75rem",
            cursor: "pointer",
            textDecoration: "underline",
            opacity: 0.7,
          }}
        >
          Privacy Policy / Terms
        </Typography>
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
