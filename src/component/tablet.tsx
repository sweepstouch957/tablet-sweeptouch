"use client";

import { Store } from "@/services/store.service";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
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
  const [privacyOpen, setPrivacyOpen] = useState(false);
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
        py={{xs:0,md:3}}
        px={3}
        display="flex"
        flexDirection={{ xs: "row", md: "column" }}
        alignItems="center"
        justifyContent={{ xs: "space-between", md: "flex-start" }}
        width={{ xs: "100%", md: "30%" }}
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
                  onClick={() => setPrivacyOpen(true)}
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
            flexWrap="wrap"
            flexDirection={"column"}
          >
            <Stack justifyContent={"center"} alignItems={"center"} gap={1}>
              <Avatar sx={{
                width:84,
                height:84
              }}/>
              <Typography>cajera@gmail.com</Typography>
            </Stack>

            {store?.image && (
              <Image
                src={store.image}
                alt="Store Logo"
                width={150}
                height={100}
                style={{ objectFit: "contain" }}
              />
            )}
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
        width={{ xs: "100%", md: "70%" }}
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
        {store?.name && (
          <Box position="absolute" bottom={16} right={16} zIndex={2}>
            <Box
              sx={{
                backgroundColor: "rgba(0,0,0,0.8)",
                opacity: 0.8,
                color: "white",
                borderRadius: "16px",
                px: 2,
                py: 0.5,
                fontSize: "0.9rem",
                fontWeight: "bold",
                whiteSpace: "nowrap",
              }}
            >
              {store.name}
            </Box>
          </Box>
        )}
      </Box>

      <Dialog open={privacyOpen} onClose={() => setPrivacyOpen(false)}>
        <DialogTitle>Privacy Policy</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <Typography variant="body2" paragraph>
            By entering your phone number, you are opting in to receive
            promotional messages from sweepsTOUCH. These may include special
            offers, store promotions, and sweepstakes alerts. You can text STOP
            at any time to opt out, or HELP for assistance. MSG & data rates may
            apply.
          </Typography>
          <Typography variant="body2">
            We respect your privacy. Your data will not be shared with third
            parties, and is used exclusively to provide updates from sweepsTOUCH
            and affiliated stores.
          </Typography>

          <Box>
            <Button
              variant="outlined"
              onClick={() => setPrivacyOpen(false)}
              sx={{ mt: 2 }}
            >
              Close
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default FathersDayPromo;
