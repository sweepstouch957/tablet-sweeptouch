import React from "react";
import Image from "next/image";
import Logo from "@public/logo.webp";
import { Box, Stack, Typography, useMediaQuery } from "@mui/material";
import { Store } from "@/services/store.service";
import { useAuth } from "@/context/auth-context";

import BgImage from "@public/BgBlack.webp";
import NewYearImage from "@public/2026.webp";
import VipImage from "@public/VipImage.webp";

import RibbonBanner from "./title-box";
import { PhoneInputModal } from "./inputModal";
import CallToActionButton from "./button";
import PhoneKeypad from "./PhoneKeypad";

interface LeftPanelProps {
  store?: Store;
  termsAccepted: boolean;
  setTermsAccepted: (value: boolean) => void;
  setPrivacyOpen: (value: boolean) => void;
  onLogin: () => void;
  handlePhoneChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  prize?: {
    name: string;
    image: string;
  };
  sweeptakeId?: string;
  optinType?: string;
  imageYear?: string;
  sweepstakeName?: string;
  hasQR?: boolean;
  modalOpen: boolean;
  setModalOpen: (value: boolean) => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  store,
  setTermsAccepted,
  sweeptakeId = "",
  prize = { name: "No Prize", image: "" },
  optinType,
  sweepstakeName,
  imageYear = NewYearImage.src,
  hasQR,
  modalOpen,
  setModalOpen,
}) => {
  const [brand, ...restParts] = prize.name.split(" ");
  const model = restParts.join(" ");
  const { user } = useAuth();

  const isPortrait = useMediaQuery("(orientation: portrait)");

  return (
    <>
      <Box
        color="white"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="flex-start"
        width={{ xs: "100%", md: "22%" }}
        minHeight={isPortrait ? "20vh" : "100vh"}
        maxHeight={isPortrait ? "31vh" : "100vh"}
        sx={{
          backgroundImage: `url(${BgImage.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          cursor: "default",
        }}
        pl={{ xs: 1.5, md: 2 }}
        pr={0}
        py={0.75}
        gap={0}
      >
        {isPortrait ? (
          /* 🎉 Layout PORTRAIT */
          <Box
            display="grid"
            gridTemplateColumns="1fr 1fr 1fr"
            gridTemplateRows="auto auto"
            minHeight="31vh" // ✅ evita línea blanca inferior
            maxHeight="40vh"
            alignItems="center"
            px={1}
            py={7}
          >
            {/* Columna izquierda */}
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="flex-start"
              alignItems="center"
              gridRow="1 / span 2"
              gridColumn="1"
              height="100%"
              gap={2}
              pt={2} // ✅ sube más el logo
            >
              <Box>
                {prize.name !== "No Prize" && (
                  <Typography
                    fontWeight={900}
                    sx={{
                      fontSize: "clamp(1.1rem, 5vw, 1.6rem)",
                      lineHeight: 1,
                    }}
                  >
                    {(brand || "").toUpperCase()}
                  </Typography>
                )}

                <Typography
                  fontWeight={700}
                  sx={{
                    fontSize: "clamp(1rem, 4vw, 1.4rem)",
                    lineHeight: 1,
                  }}
                >
                  {(model || "").toUpperCase()}
                </Typography>
              </Box>

              {store?.image && (
                <Image
                  src={store.image}
                  alt="Store Logo"
                  width={200} // ✅ un poco más grande
                  height={130}
                  style={{ objectFit: "contain" }}
                />
              )}
            </Box>

            {/* Columna central */}
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              gridColumn="2"
              gap={1}
            >
              {/* 🎀 Cinta arriba de la imagen */}
              <RibbonBanner />

              <Box sx={{ maxWidth: 200 }}>
                <Image
                  src={optinType === "generic" ? VipImage.src : imageYear}
                  alt="New Year Image"
                  width={400}
                  height={200}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </Box>

              <Box sx={{ transform: "scale(1)" }}>
                <CallToActionButton onClick={() => setModalOpen(true)} />
              </Box>
            </Box>

            {/* Columna derecha */}
            <Box
              gridColumn="3"
              gridRow="1 / span 2"
              display="flex"
              alignItems="center"
              justifyContent="center"
              height="100%"
            >
              <Image
                src={prize.image || Logo.src}
                alt="Prize Car"
                width={600}
                height={400}
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                  objectPosition: "center right",
                }}
              />
            </Box>
          </Box>
        ) : (
          /* 🎆 Layout LANDSCAPE/desktop original */
          <>
            {/* 🎉 Banner */}
            <RibbonBanner />

            {/* 🧩 Hero grid: car + title + new year */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr 1fr", md: "1.2fr 1fr" },
                gridTemplateRows: { xs: "auto auto", md: "auto auto" },
                alignItems: "end",
                columnGap: 0,
                rowGap: 0,
                width: "100%",
              }}
            >
              {/* 🚘 Car */}
              <Box
                sx={{
                  gridColumn: "1 / span 2",
                  justifySelf: "stretch",
                  alignSelf: "start",
                  mr: { xs: -1.5, md: -2 },
                }}
              >
                <Image
                  src={prize.image || Logo.src}
                  alt="Prize Image"
                  width={900}
                  height={500}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                    objectPosition: "right center",
                    transform: "scale(0.94)",
                    transformOrigin: "right center",
                    display: "block",
                  }}
                />
              </Box>

              {/* 🏷 Brand + model */}
              <Box sx={{ gridColumn: "1 / span 1", alignSelf: "start" }}>
                <Typography
                  fontWeight={900}
                  sx={{
                    fontSize: {
                      xs: "clamp(1.0rem, 6.2vw, 1.6rem)",
                      md: "clamp(1.2rem, 3.2vw, 2.2rem)",
                    },
                    lineHeight: 0.95,
                    letterSpacing: "0.02em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {(brand || "").toUpperCase()}
                </Typography>
                <Typography
                  fontWeight={700}
                  sx={{
                    fontSize: {
                      xs: "clamp(0.9rem, 5vw, 1.3rem)",
                      md: "clamp(1.0rem, 2.6vw, 1.6rem)",
                    },
                    lineHeight: 0.95,
                    letterSpacing: "0.02em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {(model || "").toUpperCase()}
                </Typography>
              </Box>

              {/* 🎆 2026 NEW YEAR */}
              <Box
                sx={{
                  gridColumn: { xs: "2 / span 1", md: "2 / span 1" },
                  justifySelf: "end",
                  alignSelf: "end",
                  maxWidth: { xs: 150, md: 210 },
                  mt: { xs: -0.5, md: -1 },
                }}
              >
                <Image
                  src={optinType === "generic" ? VipImage.src : imageYear}
                  alt="New Year Image"
                  width={400}
                  height={200}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                    transform: "scale(0.94)",
                  }}
                />
              </Box>
            </Box>

            {/* 🔘 CTA */}
            <Box my={0.5}>
              <CallToActionButton onClick={() => setModalOpen(true)} />
            </Box>

            {/* 📱 Keypad */}
            <Box mt={0.5}>
              <PhoneKeypad
                onSubmit={(phone) => console.log("Número ingresado:", phone)}
                onKeypadClick={() => setModalOpen(true)}
              />
            </Box>

            {/* ℹ️ Footer */}
            <Stack alignItems="center" spacing={0.3} mt="auto" pb={1}>
              {store?.image && (
                <Image
                  src={store.image}
                  alt="Store Logo"
                  width={110}
                  height={60}
                  style={{ objectFit: "contain" }}
                />
              )}
              <Typography fontSize="0.7rem" textAlign="center" color="white">
                Contact Us: (201) 982-4102
              </Typography>
            </Stack>
          </>
        )}
      </Box>

      {/* 📱 Modal */}
      <PhoneInputModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        sweepstakeId={sweeptakeId}
        storeId={store?.id}
        storeName={store?.name}
        type={optinType}
        createdBy={user?._id || store?.id}
        sweepstakeName={sweepstakeName || ""}
        method={user ? "cashier" : "tablet"}
        onSuccessRegister={() => setTermsAccepted(true)}
        hasQR={hasQR}
        userId={user?._id}
      />
    </>
  );
};

export default LeftPanel;
