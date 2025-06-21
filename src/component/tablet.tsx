// FathersDayPromo.tsx
"use client";

import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { Store } from "@/services/store.service";

import { Box } from "@mui/material";
import LeftPanel from "./left-pannel";
import RightCarousel from "./right-pannel";
import PrivacyDialog from "./pannel";
import LoginDialog from "./login-dialog";
import { formatPhone } from "@/libs/utils/formatPhone";

interface FathersDayPromoProps {
  store?: Store;
}

const images = [
  "https://res.cloudinary.com/dg9gzic4s/image/upload/v1750521141/95fbbfb6-4825-40db-be16-e7f5b6e00397_miuoek.jpg",
  "https://res.cloudinary.com/dg9gzic4s/image/upload/v1750521275/068e176a-b234-4684-9652-3681cebb397d_szrsy0.jpg",
  "https://res.cloudinary.com/dg9gzic4s/image/upload/v1750444504/08b5df1a-9220-40bf-b6f0-428c95901be7_mxzdpo.webp",
];

const FathersDayPromo: React.FC<FathersDayPromoProps> = ({ store }) => {
  const [index, setIndex] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const nextSlide = () => setIndex((prev) => (prev + 1) % images.length);
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
  }, []);

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
      />
      <RightCarousel
        store={store}
        images={images}
        index={index}
        handlers={handlers}
      />
      <PrivacyDialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </Box>
  );
};

export default FathersDayPromo;
