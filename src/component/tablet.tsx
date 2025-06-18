"use client";

import { Store } from "@/services/store.service";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import Logo from "@public/logo.webp";

const images = [
  "https://res.cloudinary.com/proyectos-personales/image/upload/v1750190510/Tablet_1_1_1_qywur3.webp",
  "https://res.cloudinary.com/proyectos-personales/image/upload/v1750189041/png-transparent-fanta-orange-soda-can-illustration-fizzy-drinks-coca-cola-fresca-fanta-orange-soft-drink-fanta-orange-orange-drink-juice-thumbnail_fri1tn.png",
  "https://res.cloudinary.com/proyectos-personales/image/upload/v1679111146/pepsi_f61trw.png",
];

interface FathersDayPromoProps {
  store?: Store;
}

const FathersDayPromo: React.FC<FathersDayPromoProps> = ({ store }) => {
  const [index, setIndex] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const nextSlide = () => setIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () =>
    setIndex((prev) => (prev - 1 + images.length) % images.length);

  const handlers = useSwipeable({
    onSwipedLeft: nextSlide,
    onSwipedRight: prevSlide,
    trackMouse: true,
  });

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
      {/* Left Section */}
      <Box
        bgcolor="#f43789"
        color="white"
        py={3}
        px={3}
        display="flex"
        flexDirection={{ xs: "row", md: "column" }}
        alignItems="center"
        justifyContent={{ xs: "space-between", md: "flex-start" }}
        width={{ xs: "100%", md: "35%" }}
        gap={2}
        minHeight={{ xs: "31vh", md: "100vh" }}
      >
        <Stack>
          <Typography
            fontWeight="bold"
            textAlign="center"
            fontSize={{ xs: "2rem", sm: "2rem", md: "2.5rem" }}
            lineHeight={1.2}
            mb={2}
          >
            Participate <br /> for{" "}
            <span style={{ color: "#fff200" }}>FREE!</span> <br />
            <span style={{ color: "#fff200" }}>only customers</span>
          </Typography>

          <Stack
            direction="row"
            spacing={0}
            width="100%"
            maxWidth="360px"
            sx={{
              borderRadius: "4px",
              overflow: "hidden",
              bgcolor: "white",
              mb: 2,
            }}
          >
            <TextField
              variant="standard"
              placeholder="Phone Number"
              fullWidth
              InputProps={{
                disableUnderline: true,
                sx: {
                  px: 2,
                  py: { xs: 1.5, sm: 2.2 },
                  fontSize: { xs: "1rem", sm: "1.2rem" },
                  height: { xs: "48px", sm: "56px" },
                },
              }}
            />
            <Button
              variant="contained"
              sx={{
                bgcolor: "#fff200",
                color: "#000",
                px: 3,
                fontWeight: "bold",
                borderRadius: 0,
                fontSize: "1rem",
                height: { xs: "48px", sm: "56px" },
                "&:hover": { bgcolor: "#f4c400" },
              }}
              disabled={!termsAccepted}
            >
              JOIN
            </Button>
          </Stack>

          <FormControlLabel
            control={
              <Checkbox
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                sx={{
                  color: "white",
                  "& .MuiSvgIcon-root": {
                    borderRadius: "4px",
                    fontSize: 24,
                  },
                  "&.Mui-checked .MuiSvgIcon-root": {
                    backgroundColor: "white",
                    color: "#f43789",
                  },
                }}
              />
            }
            label={
              <Typography
                variant="caption"
                fontSize="0.8rem"
                lineHeight={1.4}
                maxWidth="300px"
                textAlign="left"
              >
                By providing your phone number, you are consenting to receive
                messages about sales/coupons/promotors/etc. Text HELP for info.
                Text STOP to opt out. MSG&Data rates may apply.{" "}
                <Box
                  component="span"
                  sx={{ textDecoration: "underline", cursor: "pointer" }}
                >
                  Privacy Policy
                </Box>
              </Typography>
            }
            sx={{ alignSelf: "flex-start", mb: 3 }}
          />
        </Stack>

        <Stack justifyContent={"center"} alignItems={"center"}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap={2}
            mb={3}
            flexWrap="wrap"
          >
            {store?.image && (
              <Image
                src={store.image}
                alt="Store Logo"
                width={150}
                height={150}
                style={{ objectFit: "contain" }}
              />
            )}
            <Image
              src="https://res.cloudinary.com/proyectos-personales/image/upload/v1750187948/Bravo_Supermarket_402_S_Main_St_Wilkes-Barre_Township_PA_18702_bhdrkg.png"
              alt="QR Code"
              width={150}
              height={150}
              style={{ objectFit: "contain" }}
            />
          </Box>

          <Box width={"100%"} mt={2}>
            <Image
              src={Logo.src}
              alt="Sweepstouch logo"
              width={240}
              height={40}
              style={{ objectFit: "contain", width: "100%", height: "auto" }}
            />
          </Box>
          <Typography fontSize="0.95rem" mt={1}>
            Contact Us: (201) 982-4102
          </Typography>
        </Stack>
      </Box>

      {/* Right Section */}
      <Box
        width={{ xs: "100%", md: "65%" }}
        position="relative"
        minHeight={{ xs: "69vh", md: "100vh" }}
        overflow="hidden"
        {...handlers}
      >
        {images.map((src, i) => (
          <Box
            key={i}
            position="absolute"
            top={0}
            left={0}
            width="100%"
            height="100%"
            sx={{
              opacity: i === index ? 1 : 0,
              visibility: i === index ? "visible" : "hidden",
              transition: "opacity 1s ease-in-out, visibility 1s",
              zIndex: i === index ? 1 : 0,
            }}
          >
            <Image
              src={src}
              alt={`Slide ${i + 1}`}
              fill
              style={{ objectFit: "contain" }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default FathersDayPromo;
