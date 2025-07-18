// components/CashierDrawer.tsx
"use client";

import React from "react";
import { Drawer, Typography, Stack, Avatar, Button } from "@mui/material";
import { useAuth } from "@/context/auth-context";
import TodayParticipationCard from "./TotalParticipations";

interface CashierDrawerProps {
  open: boolean;
  onClose: () => void;
  onOpenLoginDialog: () => void;
}

const CashierDrawer: React.FC<CashierDrawerProps> = ({
  open,
  onClose,
  onOpenLoginDialog,
}) => {
  const { user, logout } = useAuth();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 300 },
          background: "#0a0a0a",
          color: "#fff",
          p: 2,
        },
      }}
    >
      <Typography variant="h6" fontWeight="bold" mb={2}>
        {user ? "Información de Cajera" : "Iniciar sesión"}
      </Typography>

      {user ? (
        <Stack spacing={2} alignItems="center" textAlign="center">
          <Avatar
            sx={{ bgcolor: "#fc0680", width: 80, height: 80, fontSize: "2rem" }}
          >
            {user.firstName[0]}
          </Avatar>
          <Typography>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography fontSize="0.9rem" color="gray">
            {user.email}
          </Typography>
          <Typography fontSize="0.9rem" color="gray">
            Rol: {user.role}
          </Typography>

          {/* 💥 Aquí va la tarjeta de participaciones */}
          <TodayParticipationCard />

          <Button
            variant="contained"
            color="error"
            fullWidth
            onClick={() => {
              logout();
              onClose();
            }}
          >
            Cerrar sesión
          </Button>
        </Stack>
      ) : (
        <Stack spacing={2}>
          <Typography textAlign="center" fontSize="0.95rem">
            Para continuar, inicia sesión como cajera
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              onOpenLoginDialog();
              onClose();
            }}
            sx={{
              backgroundColor: "#fc0680",
              "&:hover": {
                backgroundColor: "#e0046f",
              },
              borderRadius: "8px",
              mt: 2,
            }}
          >
            Ingresar código de acceso
          </Button>
        </Stack>
      )}
    </Drawer>
  );
};

export default CashierDrawer;
