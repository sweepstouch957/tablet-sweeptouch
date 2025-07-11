// FathersDayPromo.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { Store } from "@/services/store.service";

import { Box } from "@mui/material";
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
  const [index, setIndex] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const { data } = useActiveSweepstake(store?._id);
  const { data: promosData, isLoading } = usePromos("tablet", store?._id);
  const images = promosData?.map((promo) => promo.imageMobile) || imagesDummy;

  const prize = data?.prize[0] || undefined;

  const nextSlide = useCallback(() => {
    setIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);
  const prevSlide = () =>
    setIndex((prev) => (prev - 1 + images.length) % images.length);

  const handlers = useSwipeable({
    onSwipedLeft: nextSlide,
    onSwipedRight: prevSlide,
    trackMouse: true,
  });

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const formattedValue = formatPhone(value); // Allow only digits and limit to 10 characters
    setPhoneNumber(formattedValue);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <Box
      display="flex"
      flexDirection={{ xs: "column", md: "row" }}
      minHeight="100vh"
      overflow="hidden"
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
      />
      <RightCarousel
        store={store}
        images={images}
        index={index}
        handlers={handlers}
        isLoading={isLoading}
      />
      <PrivacyDialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </Box>
  );
};

export default FathersDayPromo;
