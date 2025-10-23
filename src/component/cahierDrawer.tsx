'use client';

import React, { useState } from 'react';
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
} from '@mui/material';
import { useAuth } from '@/context/auth-context';
import TodayParticipationCard from './TotalParticipations';
import { useCashiersByStore } from '@/services/cashierService';
import LoginDialog from './login-dialog';

interface CashierDrawerProps {
  open: boolean;
  onClose: () => void;
  onOpenLoginDialog?: () => void;
}
interface Cashier {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  role: string;
  profileImage?: string; // La propiedad profileImage es opcional
  accessCode?: string; // Si es que también puede ser opcional en el caso de los cajeros
}

const CashierDrawer: React.FC<CashierDrawerProps> = ({ open, onClose }) => {
  const { user, logout, login } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [openManualLogin, setOpenManualLogin] = useState(false);

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(null);
  const storeId = '132cd8db009865f573c26947';
  const { data, isLoading, error } = useCashiersByStore(storeId) as {
    data: Cashier[] | undefined;
    isLoading: boolean;
    error: unknown;
  };

  // Esta función es llamada al seleccionar un cajero y hace login automáticamente

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const handleLoginSelected = async (cashier: any) => {
    if (!cashier || !cashier.accessCode) return;

    try {
      // Ejecuta login directamente con el accessCode del cajero
      await login('', '', cashier.accessCode);
      setOpenModal(false); // Cerrar modal al completar el login
      onClose(); // Cerrar Drawer
      window.location.reload(); // Recargar para reflejar cambios
    } catch (err) {
      console.error('Error al iniciar sesión automáticamente:', err);
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
            width: { xs: '100%', sm: 350 },
            background: '#1a1a1a',
            color: '#fff',
            p: 2,
            borderRadius: '12px 0 0 12px',
            boxShadow: 4,
          },
        }}
      >
        <Typography variant="h6" fontWeight="bold" mb={2}>
          {user ? 'Información de Cajera' : 'Iniciar sesión'}
        </Typography>

        {user ? (
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Avatar
              sx={{
                bgcolor: '#fc0680',
                width: 80,
                height: 80,
                fontSize: '2rem',
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

            <TodayParticipationCard />

            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={() => {
                logout();
                onClose();
              }}
              sx={{
                mt: 2,
                borderRadius: '8px',
                backgroundColor: '#e0046f',
                '&:hover': { backgroundColor: '#fc0680' },
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
                backgroundColor: '#fc0680',
                '&:hover': { backgroundColor: '#e0046f' },
                borderRadius: '8px',
                mt: 2,
              }}
            >
              Ver Ranking de Cashiers
            </Button>

            {/* Botón para login manual con código de acceso */}
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setOpenManualLogin(true)}
              sx={{
                borderColor: '#fc0680',
                color: '#fc0680',
                '&:hover': {
                  borderColor: '#e0046f',
                  backgroundColor: 'rgba(252, 6, 128, 0.1)',
                },
                borderRadius: '8px',
              }}
            >
              Ingresar Código de Acceso
            </Button>
          </Stack>
        )}
      </Drawer>

      {/* Modal con tabla de cajeras */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="cashier-modal-title"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'white',
            color: '#000',
            boxShadow: 24,
            borderRadius: 3,
            p: 4,
            width: { xs: '95%', sm: '90%', md: 800 },
            maxHeight: '85vh',
            overflowY: 'auto',
            transition: 'all 0.3s ease-in-out',
          }}
        >
          <Typography
            id="cashier-modal-title"
            variant="h5"
            fontWeight="bold"
            mb={3}
            sx={{ color: '#f43789' }}
          >
            Ranking de Cajeras
          </Typography>

          {isLoading ? (
            <Stack alignItems="center" mt={4}>
              <CircularProgress sx={{ color: '#fc0680' }} />
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
                  backgroundColor: 'white',
                  borderRadius: 2,
                  boxShadow: 3,
                  overflow: 'hidden',
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        backgroundColor: '#f43789',
                        '& .MuiTableCell-head': {
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.95rem',
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
                          cursor: 'pointer',
                          backgroundColor:
                            selectedCashier?._id === cashier._id
                              ? '#fce4ec'
                              : index % 2 === 0
                              ? '#fafafa'
                              : 'white',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: '#f8bbd0',
                            transform: 'scale(1.01)',
                          },
                          '& .MuiTableCell-root': {
                            borderBottom: '1px solid #f0f0f0',
                            py: 2,
                          },
                        }}
                      >
                        <TableCell align="center">
                          <Avatar
                            src={
                              cashier.profileImage
                                ? `https://api2.sweepstouch.com/uploads/${cashier.profileImage}`
                                : undefined
                            }
                            sx={{
                              bgcolor: '#fc0680',
                              width: 45,
                              height: 45,
                              fontSize: '1.1rem',
                              margin: '0 auto',
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
                              display: 'inline-block',
                              px: 2,
                              py: 0.5,
                              borderRadius: 2,
                              backgroundColor: '#e1f5fe',
                              color: '#0277bd',
                              fontSize: '0.85rem',
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
                sx={{ fontStyle: 'italic' }}
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
              borderColor: '#f43789',
              color: '#f43789',
              '&:hover': {
                borderColor: '#d62b74',
                backgroundColor: 'rgba(244, 55, 137, 0.05)',
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
