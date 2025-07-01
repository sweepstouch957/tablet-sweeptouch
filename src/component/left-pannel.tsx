/* eslint-disable @typescript-eslint/no-explicit-any */
// LeftPanel.tsx
import React, { useState } from "react";
import Image from "next/image";
import Logo from "@public/logo.webp";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import { Store } from "@/services/store.service";
import { useAuth } from "@/context/auth-context";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useMutation } from "@tanstack/react-query";
import {
  createSweepstake,
  getActiveSweepstakeByStore,
} from "@/services/sweepstake.service";
import { validatePhone } from "@/libs/utils/formatPhone";
import { FormHelperText } from "@mui/material";

import Woman from "@public/woman.jpg";

const MySwal = withReactContent(Swal);

interface LeftPanelProps {
  store?: Store;
  termsAccepted: boolean;
  setTermsAccepted: (value: boolean) => void;
  setPrivacyOpen: (value: boolean) => void;
  onLogin: () => void;
  handlePhoneChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  store,
  termsAccepted,
  setTermsAccepted,
  setPrivacyOpen,
  onLogin,
  setPhoneNumber,
  handlePhoneChange,
  phoneNumber,
}) => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const [termsTouched, setTermsTouched] = useState(false);

  function printWithRawBT(data: {
    storeName: string;
    phone: string;
    couponCode: string;
    pariticpantNumber?: string;
  }) {
    const now = new Date();
    const date = now.toLocaleDateString(); // Solo la fecha (ej: 7/1/2025)
    const time = now.toLocaleTimeString(); // Solo la hora (ej: 3:45 PM)

    const ticket = `=============================
${data.storeName.toUpperCase()}
=============================
°PARTICIPANT: ${data.pariticpantNumber}
PHONE : ${data.phone}
COUPON: ${data.couponCode}
DATE  : ${date}
TIME  : ${time}
=============================
THANK YOU FOR PARTICIPATING
PLEASE KEEP THIS RECEIPT
=============================
`;

    const encoded = encodeURIComponent(ticket);
    window.location.href = `rawbt:${encoded}`;
  }
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const { mutate: registerParticipant, isPending } = useMutation({
    mutationFn: async () => {
      if (!store || !phoneNumber) return;
      const sweepstakeId = await getActiveSweepstakeByStore(store.id);
      const resp = await createSweepstake({
        sweepstakeId,
        storeId: store.id,
        customerPhone: phoneNumber.replace(/\D/g, ""),
        customerName: "",
        method: user ? "cashier" : "tablet",
        createdBy: store.id,
      });

      return resp;
    },
    onSuccess: (resp) => {
      MySwal.fire({
        title: "Thank You!",
        html: `
     <div style="font-size: 1.3rem;">
        <p>🎉 Thank you for participating!</p>
        <p>📩 Check your SMS inbox for more details about the sweepstake and upcoming promotions.</p>
     </div>
    `,
        icon: "success",
        confirmButtonColor: "#f43789",
        confirmButtonText: "Ok",
        timer: 5000, // ⏱️ 2 segundos
        timerProgressBar: true,
      });

      printWithRawBT({
        storeName: store?.name || "Sorteo",
        phone: phoneNumber,
        couponCode: resp.coupon || "XXXXXX",
        pariticpantNumber: resp.participantNumber || "N/A",
      });

      setPhoneNumber("");
      setTermsAccepted(true);
    },

    onError: (error: any) => {
      MySwal.fire({
        title: "Oops...",
        text: error || "An error occurred while registering.",
        icon: "error",
        confirmButtonColor: "#f43789",
        timer: 4000, // ⏱️ 4 segundos
        timerProgressBar: true,
      });
    },
  });

  return (
    <Box
      bgcolor="#f43789"
      color="white"
      py={{ xs: 0, md: 3 }}
      px={3}
      display="flex"
      flexDirection={{ xs: "row", md: "column" }}
      alignItems="center"
      justifyContent={{ xs: "space-between", md: "flex-start" }}
      width={{ xs: "100%", md: "30%" }}
      minHeight={{ xs: "31vh", md: "100vh" }}
      maxHeight={{ xs: "31vh", md: "100vh" }}
      gap={2}
    >
      <Stack>
        <Typography
          fontWeight="bold"
          textAlign="center"
          fontSize={{ xs: "1.7rem", sm: "1.7rem", md: "2rem" }}
          lineHeight={1}
          mb={"8px"}
        >
          Participate <br /> for <span style={{ color: "#fff200" }}>FREE!</span>{" "}
          <br />
          <span style={{ color: "#fff200" }}>only customers</span>
        </Typography>

        <Stack
          direction="row"
          maxWidth="360px"
          sx={{ borderRadius: 1, overflow: "hidden", bgcolor: "white", mb: 2 }}
        >
          <TextField
            variant="standard"
            placeholder="Phone Number"
            fullWidth
            type="tel"
            InputProps={{
              disableUnderline: true,
              sx: {
                px: 2,
                py: { xs: 1.5, sm: 2.2 },
                fontSize: { xs: "1rem", sm: "1.2rem" },
                height: { xs: "48px", sm: "56px" },
              },
            }}
            value={phoneNumber}
            onChange={handlePhoneChange}
          />
          <Button
            variant="contained"
            onClick={() => {
              setTermsTouched(true); // Marca que intentaron enviar

              if (!validatePhone(phoneNumber)) {
                return;
              }
              if (!termsAccepted) return; // Evita enviar si no aceptó términos

              registerParticipant();
            }}
            sx={{
              bgcolor: "#fff200",
              color: "#000",
              px: 3,
              fontWeight: "bold",
              borderRadius: 0,
            }}
            disabled={
              isPending || !phoneNumber || validatePhone(phoneNumber) === false
            }
          >
            JOIN
          </Button>
        </Stack>

        <Box sx={{ alignSelf: "flex-start", mb: 0 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                sx={{
                  color: "white",
                  "& .MuiSvgIcon-root": { borderRadius: 1, fontSize: 24 },
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
                fontSize="0.6rem"
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
          />
          {termsTouched && !termsAccepted && (
            <FormHelperText
              sx={{ color: "#fff200", fontSize: "0.7rem", ml: "32px" }}
            >
              You must accept the terms and conditions.
            </FormHelperText>
          )}
        </Box>
      </Stack>

      <Stack justifyContent="center" alignItems="center">
        {!user ? (
          <Button
            onClick={onLogin}
            variant="outlined"
            sx={{
              color: "white",
              borderColor: "white",
              "&:hover": { borderColor: "#fff200", color: "#fff200" },
              mb: 1,
            }}
          >
            Admin Login
          </Button>
        ) : (
          <>
            <Stack
              direction="column"
              alignItems="center"
              justifyContent="center"
              sx={{ cursor: "pointer" }}
              onClick={handleMenuClick}
            >
              <Image
                src={Woman.src}
                height={80}
                width={80}
                alt="User Avatar"
                style={{
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginBottom: "10px",
                }}
              />
              <Typography fontSize="0.9rem" mt={0} color="white">
                {user?.email}
              </Typography>
            </Stack>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem disabled>{user?.email}</MenuItem>
              <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
            </Menu>
          </>
        )}

        {store?.image && (
          <Image
            src={store.image}
            alt="Store Logo"
            width={150}
            height={100}
            style={{ objectFit: "contain", marginTop: "8px" }}
          />
        )}

        <Stack width="90%" mt={2} justifyContent={"center"} alignItems="center">
          <Typography mb={"2px"}>Powered by</Typography>
          <Image
            src={Logo.src}
            alt="Sweepstouch logo"
            width={200}
            height={40}
            style={{ objectFit: "contain", width: "100%", height: "auto" }}
          />
          <Typography fontSize="0.95rem" mt={"2px"}>
            Contact Us: (201) 982-4102
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default LeftPanel;
