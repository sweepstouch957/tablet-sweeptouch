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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import QrCodeScannerRoundedIcon from "@mui/icons-material/QrCodeScannerRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { BRAND, MAGENTA, NEUTRAL, SURFACE, TYPE, FONT, RADIUS } from "@/libs/brand";
import { useAuth } from "@/context/auth-context";
import TodayParticipationCard from "./TotalParticipations";
import { useCashiersByStore } from "@/services/cashierService";
import LoginDialog from "./login-dialog";
import ScanListDialog from "./ScanListDialog";

interface CashierDrawerProps {
  open: boolean;
  onClose: () => void;
  onOpenLoginDialog?: () => void;
  storeId?: string;
}

const CashierDrawer: React.FC<CashierDrawerProps> = ({
  open,
  onClose,
  storeId,
}) => {
  const { user, logout, login } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [openManualLogin, setOpenManualLogin] = useState(false);
  const [openScan, setOpenScan] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedCashier, setSelectedCashier] = useState<any | null>(null);

  const { data, isLoading, error } = useCashiersByStore(storeId || "");

  // Esta función es llamada al seleccionar un cajero y hace login automáticamente
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLoginSelected = async (cashier: any) => {
    if (!cashier || !cashier.accessCode) return;

    try {
      // Ejecuta login directamente con el accessCode del cajero
      await login("", "", cashier.accessCode);
      setOpenModal(false); // Cerrar modal al completar el login
      onClose(); // Cerrar Drawer
      window.location.reload(); // Recargar para reflejar cambios
    } catch (err) {
      console.error("Error al iniciar sesión automáticamente:", err);
    }
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 380 },
            background: SURFACE.page,
            color: SURFACE.text,
            fontFamily: FONT,
            p: 2,
            borderRadius: "12px 0 0 12px",
            boxShadow: 4,
            maxHeight: "100vh",
            overflowY: "auto", // 👈 evita que se “salga”
          },
        }}
      >
        <Typography sx={{ ...TYPE.h4, fontFamily: FONT, mb: 2 }}>
          {user ? "Información de Cajera" : "Iniciar sesión"}
        </Typography>

        {user ? (
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Avatar
              sx={{
                bgcolor: BRAND.magenta,
                width: 80,
                height: 80,
                fontFamily: FONT,
                fontSize: "2rem",
              }}
            >
              {user.firstName[0]}
            </Avatar>
            <Typography>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography fontSize="0.9rem" color={SURFACE.textMuted}>
              {user.email}
            </Typography>
            <Typography fontSize="0.9rem" color={SURFACE.textMuted}>
              Rol: {user.role}
            </Typography>

            <TodayParticipationCard storeId={storeId} />

            {/* Acción principal de la cajera con una lista Pre-RCS delante:
                escanear. Va arriba de cerrar sesión porque es lo que hace
                cincuenta veces por turno. */}
            <Button
              variant="contained"
              disableElevation
              fullWidth
              startIcon={<QrCodeScannerRoundedIcon />}
              onClick={() => setOpenScan(true)}
              sx={{
                mt: 1,
                py: 1.5,
                borderRadius: `${RADIUS.md}px`,
                fontFamily: FONT,
                fontWeight: 500, // 5.4: Medium para botones y CTA
                fontSize: "1rem",
                backgroundColor: BRAND.magenta,
                "&:hover": { backgroundColor: MAGENTA[75] },
              }}
            >
              Escanear lista
            </Button>
            <Typography sx={{ ...TYPE.small, fontFamily: FONT, color: SURFACE.textMuted, mt: -1 }}>
              Suma puntos para el cliente y para ti
            </Typography>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<LogoutRoundedIcon />}
              onClick={() => {
                logout();
                onClose();
              }}
              sx={{
                mt: 2,
                borderRadius: `${RADIUS.md}px`,
                fontFamily: FONT,
                fontWeight: 500,
                borderColor: SURFACE.line,
                color: SURFACE.textBody,
                "&:hover": {
                  borderColor: BRAND.magenta,
                  backgroundColor: MAGENTA[10],
                  color: BRAND.magenta,
                },
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

            {/* Botón para abrir tabla de cajeras */}
            <Button
              variant="contained"
              fullWidth
              onClick={() => setOpenModal(true)}
              sx={{
                backgroundColor: BRAND.magenta,
                "&:hover": { backgroundColor: MAGENTA[75] },
                borderRadius: `${RADIUS.md}px`,
                fontFamily: FONT,
                fontWeight: 500,
                mt: 2,
              }}
            >
              Ver Ranking de Cajeras
            </Button>

            {/* Botón para login manual con código de acceso */}
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setOpenManualLogin(true)}
              sx={{
                borderColor: BRAND.magenta,
                color: BRAND.magenta,
                "&:hover": {
                  borderColor: MAGENTA[75],
                  backgroundColor: MAGENTA[10],
                },
                borderRadius: `${RADIUS.md}px`,
                fontFamily: FONT,
                fontWeight: 500,
              }}
            >
              Ingresar Access Code
            </Button>
          </Stack>
        )}
      </Drawer>

      <ScanListDialog open={openScan} onClose={() => setOpenScan(false)} />

      {/* Modal con tabla de cajeras */}
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
            bgcolor: "white",
            color: "#000",
            boxShadow: 24,
            borderRadius: 3,
            p: 4,
            width: { xs: "95%", sm: "90%", md: 800 },
            maxHeight: "85vh",
            overflowY: "auto",
            transition: "all 0.3s ease-in-out",
          }}
        >
          <Typography
            id="cashier-modal-title"
            variant="h5"
            fontWeight="bold"
            mb={3}
            sx={{ color: BRAND.magenta }}
          >
            Ranking de Cajeras
          </Typography>

          {isLoading ? (
            <Stack alignItems="center" mt={4}>
              <CircularProgress sx={{ color: BRAND.magenta }} />
              <Typography mt={2} color="text.secondary">
                Cargando cajeras...
              </Typography>
            </Stack>
          ) : error ? (
            <Typography color="error" textAlign="center">
              Error al cargar las cajeras.
            </Typography>
          ) : data && data.length > 0 ? (
            <>
              <TableContainer
                component={Paper}
                sx={{
                  backgroundColor: "white",
                  borderRadius: 2,
                  boxShadow: 3,
                  overflow: "hidden",
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        backgroundColor: BRAND.magenta,
                        "& .MuiTableCell-head": {
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "0.95rem",
                        },
                      }}
                    >
                      <TableCell align="center">Foto</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Teléfono</TableCell>
                      <TableCell align="center">Rol</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((cashier, index) => (
                      <TableRow
                        key={cashier._id}
                        hover
                        selected={selectedCashier?._id === cashier._id}
                        onClick={() => {
                          setSelectedCashier(cashier);
                          handleLoginSelected(cashier); // Ejecuta login automáticamente
                        }}
                        sx={{
                          cursor: "pointer",
                          backgroundColor:
                            selectedCashier?._id === cashier._id
                              ? MAGENTA[10]
                              : index % 2 === 0
                                ? NEUTRAL[10]
                                : "white",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: MAGENTA[25],
                            transform: "scale(1.01)",
                          },
                          "& .MuiTableCell-root": {
                            borderBottom: "1px solid #f0f0f0",
                            py: 2,
                          },
                        }}
                      >
                        <TableCell align="center">
                          <Avatar
                            src={
                              cashier.profileImage || ""
                            }
                            sx={{
                              bgcolor: BRAND.magenta,
                              width: 45,
                              height: 45,
                              fontSize: "1.1rem",
                              margin: "0 auto",
                              boxShadow: 2,
                            }}
                          >
                            {cashier.firstName[0]}
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={600} fontSize="0.95rem">
                            {cashier.firstName} {cashier.lastName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontSize="0.9rem" color="text.secondary">
                            {cashier.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontSize="0.9rem" color="text.secondary">
                            {cashier.countryCode} {cashier.phoneNumber}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: "inline-block",
                              px: 2,
                              py: 0.5,
                              borderRadius: 2,
                              backgroundColor: NEUTRAL[10],
                              color: NEUTRAL[75],
                              fontSize: "0.85rem",
                              fontWeight: 600,
                            }}
                          >
                            {cashier.role}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                mt={3}
                sx={{ fontStyle: "italic" }}
              >
                Haz clic en cualquier cajera para iniciar sesión automáticamente
              </Typography>
            </>
          ) : (
            <Typography textAlign="center" color="text.secondary">
              No se encontraron cajeras.
            </Typography>
          )}

          <Button
            variant="outlined"
            fullWidth
            onClick={() => setOpenModal(false)}
            sx={{
              mt: 3,
              borderColor: BRAND.magenta,
              color: BRAND.magenta,
              "&:hover": {
                borderColor: MAGENTA[75],
                backgroundColor: "rgba(244, 55, 137, 0.05)",
              },
              borderRadius: 2,
            }}
          >
            Cerrar
          </Button>
        </Box>
      </Modal>

      {/* Dialog para login manual */}
      <LoginDialog
        open={openManualLogin}
        onClose={() => setOpenManualLogin(false)}
      />
    </>
  );
};

export default CashierDrawer;
