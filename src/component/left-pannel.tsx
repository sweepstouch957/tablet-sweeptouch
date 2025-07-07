// LeftPanel.tsx
import React, { useState } from "react";
import Image from "next/image";
import Logo from "@public/logo.webp";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Store } from "@/services/store.service";
import { useAuth } from "@/context/auth-context";

import BgImage from "@public/BgBlack.webp";

import NewYearImage from "@public/2026.webp";

import RibbonBanner from "./title-box";
import { PhoneInputModal } from "./inputModal";

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
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  store,
  setTermsAccepted,
  sweeptakeId = "",
  prize = { name: "No Prize", image: "" }, // Default prize if not provided
}) => {
  const [brand, ...restParts] = prize.name.split(" ");
  const model = restParts.join(" ");
  const { user } = useAuth();

  const [openModal, setOpenModal] = useState(false);

  return (
    <Box
      color="white"
      display="flex"
      flexDirection={{ xs: "row", md: "column" }}
      alignItems="center"
      justifyContent={{ xs: "space-between", md: "flex-start" }}
      width={{ xs: "100%", md: "25%" }}
      minHeight={{ xs: "31vh", md: "100vh" }}
      maxHeight={{ xs: "31vh", md: "100vh" }}
      sx={{
        backgroundImage: `url(${BgImage.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      gap={1}
    >
      <Stack pt={{ xs: 0, md: 3 }} px={3}>
        <RibbonBanner />
        <Image
          src={NewYearImage.src}
          alt="New Year 2026"
          width={200}
          height={150}
          style={{
            objectFit: "contain",
            marginBottom: "10px",
            width: "100%",
            height: "auto",
          }}
        />

        <Button
          variant="contained"
          sx={{
            bgcolor: "#BF171B",
            color: "#ffffff",
            my: 2,
            borderRadius: "32px",

            "&:hover": {
              bgcolor: "#bf171a",
              color: "#fff",
            },
          }}
          onClick={() => {
            setOpenModal(true); // Abre el modal de términos
          }}
        >
          <Typography fontSize="1rem" fontWeight="bold">
            Participate and Win!
          </Typography>
        </Button>

        <Stack textAlign={"center"} mb={0}>
          <Typography fontSize={"4rem"} fontWeight={800} lineHeight={0.9}>
            {brand}
          </Typography>
          <Typography fontWeight="medium" fontSize="2.5rem">
            {model}
          </Typography>
        </Stack>
      </Stack>
      <Stack alignItems={"flex-end"} width={"100%"}>
        <Image
          src={prize.image || Logo.src}
          alt="Prize Image"
          width={150}
          height={100}
          style={{
            objectFit: "contain",
            width: "80%",
            height: "auto",
          }}
        />
      </Stack>

      <Stack justifyContent="center" alignItems="center">
        {store?.image && (
          <Image
            src={store.image}
            alt="Store Logo"
            width={200}
            height={120}
            style={{ objectFit: "contain", marginTop: "8px" }}
          />
        )}

        <Typography fontSize="1rem" mt={"8px"}>
          Contact Us: (201) 982-4102
        </Typography>

        <PhoneInputModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          sweepstakeId={sweeptakeId}
          storeId={store?.id}
          storeName={store?.name}
          createdBy={store?.id}
          method={user ? "cashier" : "tablet"}
          onSuccessRegister={() => setTermsAccepted(true)}
        />
      </Stack>
    </Box>
  );
};

export default LeftPanel;
