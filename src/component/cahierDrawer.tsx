"use client";

import React, { useState } from "react";
import {
  Drawer,
  Typography,
  Stack,
  Avatar,
  Button,
  Modal,
  Box,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "@/context/auth-context";
import TodayParticipationCard from "./TotalParticipations";
import { useCashiersByStore } from "@/services/cashierService";

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
  const { user, logout, login } = useAuth(); // ✅ Se añade login del contexto
  const [openModal, setOpenModal] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState<string | null>(null); // para mostrar spinner en el cajero clicado

  const storeId = "132cd8db009865f573c26947";
  const { data, isLoading, error } = useCashiersByStore(storeId);

  // 🔹 Función para loguear automáticamente al seleccionar un cajero
  const handleSelectCashier = async (cashier: any) => {
    try {
      setLoadingLogin(cashier._id);
      await login(cashier.accessCode); // 👈 Simula login automático con su código
      setOpenModal(false);
      onClose();
    } catch (err) {
      console.error("Error al iniciar sesión automáticamente:", err);
    } finally {
      setLoadingLogin(null);
    }
  };

  return (
    <>
      {/* ==========================
          📦 Drawer lateral original
      ========================== */}
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
              sx={{
                bgcolor: "#fc0680",
                width: 80,
                height: 80,
                fontSize: "2rem",
              }}
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

            {/* 💥 Tarjeta de participaciones */}
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
              onClick={() => setOpenModal(true)} // 🔹 Abrimos el modal
              sx={{
                backgroundColor: "#fc0680",
                "&:hover": {
                  backgroundColor: "#e0046f",
                },
                borderRadius: "8px",
                mt: 2,
              }}
            >
              Iniciar Sesión
            </Button>
          </Stack>
        )}
      </Drawer>

      {/* ==========================
          🪟 Modal con lista de cajeras
      ========================== */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="cashier-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#121212",
            color: "#fff",
            boxShadow: 24,
            borderRadius: 2,
            p: 3,
            width: { xs: "90%", sm: 500 },
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <Typography
            id="cashier-modal-title"
            variant="h6"
            fontWeight="bold"
            mb={2}
          >
            Cajeras disponibles
          </Typography>

          {/* 🔄 Cargando */}
          {isLoading && (
            <Stack alignItems="center" mt={4}>
              <CircularProgress sx={{ color: "#fc0680" }} />
              <Typography mt={1}>Cargando cajeras...</Typography>
            </Stack>
          )}

          {/* ⚠️ Error */}
          {error && (
            <Typography color="error" textAlign="center">
              Error al cargar las cajeras.
            </Typography>
          )}

          {/* ✅ Lista de cajeras */}
          {!isLoading && data && (
            <Stack spacing={2}>
              {data.map((cashier) => (
                <Box
                  key={cashier._id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "#1a1a1a",
                    cursor: "pointer",
                    transition: "0.2s",
                    "&:hover": {
                      backgroundColor: "#2a2a2a",
                    },
                  }}
                  onClick={() => handleSelectCashier(cashier)} // 👈 login directo
                >
                  <Stack direction="row" alignItems="center" gap={2}>
                    <Avatar
                      src={
                        cashier.profileImage
                          ? `https://api2.sweepstouch.com/uploads/${cashier.profileImage}`
                          : undefined
                      }
                      sx={{
                        bgcolor: "#fc0680",
                        width: 50,
                        height: 50,
                        fontSize: "1.2rem",
                      }}
                    >
                      {cashier.firstName[0]}
                    </Avatar>

                    <Box>
                      <Typography fontWeight="bold">
                        {cashier.firstName} {cashier.lastName}
                      </Typography>
                      <Typography fontSize="0.9rem" color="gray">
                        {cashier.email}
                      </Typography>
                      <Typography fontSize="0.8rem" color="gray">
                        {cashier.countryCode} {cashier.phoneNumber}
                      </Typography>
                      <Typography fontSize="0.8rem" color="gray">
                        Rol: {cashier.role}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Indicador de carga individual */}
                  {loadingLogin === cashier._id && (
                    <CircularProgress size={24} sx={{ color: "#fc0680" }} />
                  )}
                </Box>
              ))}

              {data.length === 0 && (
                <Typography textAlign="center" color="gray">
                  No se encontraron cajeras.
                </Typography>
              )}
            </Stack>
          )}

          <Button
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              backgroundColor: "#fc0680",
              "&:hover": { backgroundColor: "#e0046f" },
            }}
            onClick={() => setOpenModal(false)}
          >
            Cerrar
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default CashierDrawer;
