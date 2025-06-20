// LeftPanel.tsx
import React, { useState } from "react";
import Image from "next/image";
import Logo from "@public/logo.webp";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import { Store } from "@/services/store.service";
import { useAuth } from "@/context/auth-context";

interface LeftPanelProps {
  store?: Store;
  termsAccepted: boolean;
  setTermsAccepted: (value: boolean) => void;
  setPrivacyOpen: (value: boolean) => void;
  onLogin: () => void;
  handlePhoneChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  phoneNumber: string;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  store,
  termsAccepted,
  setTermsAccepted,
  setPrivacyOpen,
  onLogin,
  handlePhoneChange,
  phoneNumber,
}) => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

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
          fontSize={{ xs: "1.4rem", sm: "1.6rem", md: "2.5rem" }}
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
            sx={{
              bgcolor: "#fff200",
              color: "#000",
              px: 3,
              fontWeight: "bold",
              borderRadius: 0,
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
          sx={{ alignSelf: "flex-start", mb: 2 }}
        />
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
            }}
          >
            Admin Login
          </Button>
        ) : (
          <>
            <IconButton onClick={handleMenuClick} sx={{ mt: 1 }}>
              <Avatar sx={{ width: 84, height: 84 }} />
            </IconButton>
            <Typography fontSize="0.9rem" mt={1} color="white">
              {user?.email}
            </Typography>
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
            style={{ objectFit: "contain" }}
          />
        )}

        <Box width="100%" mt={2}>
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
  );
};

export default LeftPanel;
