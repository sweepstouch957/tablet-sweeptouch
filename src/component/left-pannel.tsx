// LeftPanel.tsx
import React, { useState } from "react";
import Image from "next/image";
import Logo from "@public/logo.webp";
import { Box, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Store } from "@/services/store.service";
import { useAuth } from "@/context/auth-context";

import BgImage from "@public/BgBlack.webp";

import NewYearImage from "@public/2026.webp";
import VipImage from "@public/VipImage.webp";

import RibbonBanner from "./title-box";
import { PhoneInputModal } from "./inputModal";
import CallToActionButton from "./button";

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
  sweepstakeName?: string;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  store,
  setTermsAccepted,
  sweeptakeId = "",
  prize = { name: "No Prize", image: "" }, // Default prize if not provided
  optinType,
  sweepstakeName,
}) => {
  const [brand, ...restParts] = prize.name.split(" ");
  const model = restParts.join(" ");
  const { user } = useAuth();

  const [openModal, setOpenModal] = useState(false);
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      color="white"
      display="flex"
      flexDirection={{ xs: "row", md: "column" }}
      alignItems="center"
      justifyContent={{ xs: "space-between", md: "flex-start" }}
      width={{ xs: "100%", md: "25%" }}
      minHeight={{ xs: "28vh", md: "100vh" }}
      maxHeight={{ xs: "28vh", md: "100vh" }}
      sx={{
        backgroundImage: `url(${BgImage.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      pl={{ xs: 2, md: 0 }}
      gap={1}
    >
      <Stack order={{ xs: 1, md: 0 }} px={1}>
        <RibbonBanner />
        <Image
          src={optinType === "generic" ? VipImage.src : NewYearImage.src}
          alt="New Year 2026"
          width={200}
          height={150}
          style={{
            objectFit: "contain",
            width: matches && optinType === "generic" ? "80%" : "100%",
            height: "auto",
          }}
        />
        {!matches && optinType !== "generic" && (
          <CallToActionButton
            onClick={() => {
              setOpenModal(true); // Abre el modal de términos
            }}
          />
        )}
      </Stack>

      <Stack textAlign={"center"} mb={0} order={{ xs: 0, md: 1 }}>
        {optinType !== "generic" && (
          <Stack>
            <Typography fontSize={"4rem"} fontWeight={800} lineHeight={0.9}>
              {brand}
            </Typography>
            <Typography fontWeight="medium" fontSize="2.5rem" lineHeight={1}>
              {model}
            </Typography>
          </Stack>
        )}

        <Stack
          justifyContent="center"
          alignItems="center"
          display={{ xs: "flex", md: "none" }}
        >
          {store?.image && (
            <Box>
              <Image
                src={store.image}
                alt="Store Logo"
                width={200}
                height={120}
                style={{ objectFit: "contain", marginTop: "8px" }}
              />
            </Box>
          )}

          <Typography fontSize="0.8rem" mt={"8px"}>
            Contact Us: (201) 982-4102
          </Typography>
        </Stack>
      </Stack>

      {optinType === "generic" && matches && (
        <Stack alignItems={"center"}>
          <CallToActionButton
            onClick={() => {
              setOpenModal(true); // Abre el modal de términos
            }}
          />
        </Stack>
      )}
      {optinType !== "generic" && (
        <Stack
          alignItems={"flex-end"}
          width={{ xs: "30%", md: "100%" }}
          order={{ xs: 3, md: 2 }}
        >
          <Image
            src={prize.image || Logo.src}
            alt="Prize Image"
            width={150}
            height={100}
            style={{
              objectFit: "contain",
              width: matches ? "100%" : "80%",
              height: "auto",
              marginTop: "-10px",
            }}
          />
        </Stack>
      )}
      <Stack
        justifyContent="center"
        alignItems="center"
        display={{ xs: "none", md: "flex" }}
        order={4}
        mt={-3}
      >
        {store?.image && (
          <Box>
            <Image
              src={store.image}
              alt="Store Logo"
              width={200}
              height={80}
              style={{ objectFit: "cover", marginTop: "8px" }}
            />
          </Box>
        )}

        <Typography fontSize="0.8rem" mt={"8px"}>
          Contact Us: (201) 982-4102
        </Typography>
      </Stack>
      <PhoneInputModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        sweepstakeId={sweeptakeId}
        storeId={store?.id}
        storeName={store?.name}
        type={optinType}
        createdBy={store?.id}
        sweepstakeName={sweepstakeName || ""}
        method={user ? "cashier" : "tablet"}
        onSuccessRegister={() => setTermsAccepted(true)}
      />
    </Box>
  );
};

export default LeftPanel;
