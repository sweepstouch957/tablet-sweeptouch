// FathersDayPromo.tsx
"use client";

import { useState } from "react";
import { Box } from "@mui/material";
import { Store } from "@/services/store.service";

import LeftPanel from "./left-pannel";
import RightCarousel from "./right-pannel";
import PrivacyDialog from "./pannel";
import LoginDialog from "./login-dialog";
import { formatPhone } from "@/libs/utils/formatPhone";
import { useActiveSweepstake } from "@/hooks/useActiveSwepake";
import { usePromos } from "@/hooks/usePromos";

interface FathersDayPromoProps {
  store?: Store;
}

const imagesDummy = [
  "https://res.cloudinary.com/dg9gzic4s/image/upload/v1750444504/8a8ac749-e75e-424b-ad77-1a18a39d987b_swtqv6.webp",
  "https://res.cloudinary.com/dg9gzic4s/image/upload/v1750444504/112783a0-a34e-4108-a372-fabe93cedc16_a9oyix.webp",
  "https://res.cloudinary.com/dg9gzic4s/image/upload/v1750444504/08b5df1a-9220-40bf-b6f0-428c95901be7_mxzdpo.webp",
];

const FathersDayPromo: React.FC<FathersDayPromoProps> = ({ store }) => {
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { data } = useActiveSweepstake(store?._id);
  const { data: promosData, isLoading } = usePromos("tablet", store?._id);
  const images =
    promosData && promosData.length > 0
      ? promosData.map((promo) => promo.imageMobile)
      : imagesDummy;

  const prize = data?.prize[0] || undefined;

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const formattedValue = formatPhone(value);
    setPhoneNumber(formattedValue);
  };

  const handleGlobalClick = (event: React.MouseEvent) => {
    // Verificar si el click fue en el área excluida (parte inferior)
    const target = event.target as HTMLElement;
    const isExcludedArea = target.closest('[data-exclude-global-click="true"]');
    
    if (!isExcludedArea && modalOpen) {
      setModalOpen(false);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection={{ xs: "column", md: "row" }}
      minHeight="100vh"
      overflow="hidden"
      onClick={handleGlobalClick}
      sx={{ cursor: "pointer" }}
    >
      <LeftPanel
        store={store}
        termsAccepted={termsAccepted}
        setTermsAccepted={setTermsAccepted}
        setPrivacyOpen={setPrivacyOpen}
        handlePhoneChange={handlePhoneChange}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        onLogin={() => setLoginOpen(true)}
        prize={prize}
        sweeptakeId={data?._id || ""}
        optinType={data?.optinType}
        sweepstakeName={data?.name}
        imageYear={data?.imageYear || ""}
        hasQR={data?.hasQr || false}
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
      />

      <RightCarousel
        store={store}
        images={images}
        isLoading={isLoading}
        intervalMs={6000} // opcional
      />

      <PrivacyDialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </Box>
  );
};

export default FathersDayPromo;
