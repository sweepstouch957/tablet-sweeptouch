'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Stack,
} from '@mui/material';
import { useAuth } from '@/context/auth-context';
import { useCashiersByStore } from '@/services/cashierService';

interface LoginDialogCashiersProps {
  open: boolean;
  onClose: () => void;
  storeId?: string;
}

const LoginDialogCashiers: React.FC<LoginDialogCashiersProps> = ({
  open,
  onClose,
  storeId,
}) => {
  const [accessCode, setAccessCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [showRanking, setShowRanking] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedCashier, setSelectedCashier] = useState<any | null>(null);
  const { login, error } = useAuth();

  const {
    data,
    isLoading,
    error: fetchError,
  } = useCashiersByStore(storeId || '');

  const handleLogin = async () => {
    if (!accessCode) {
      setLocalError('Por favor ingresa tu código de acceso.');
      return;
    }

    setLocalError(null);
    try {
      await login('', '', accessCode);
      onClose();
      setAccessCode('');
      setShowRanking(false);
    } catch (error) {
      console.log(error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLoginSelected = async (cashier: any) => {
    if (!cashier || !cashier.accessCode) return;

    try {
      await login('', '', cashier.accessCode);
      setShowRanking(false);
      onClose();
    } catch (err) {
      console.error('Error al iniciar sesión automáticamente:', err);
    }
  };

  const handleClose = () => {
    setAccessCode('');
    setLocalError(null);
    setShowRanking(false);
    setSelectedCashier(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth={showRanking ? 'md' : 'sm'}
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
    >
      {/* Header con fondo rosa */}
      <Box
        sx={{
          bgcolor: '#f43789',
          color: 'white',
          textAlign: 'center',
          py: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '1.8rem', md: '2.2rem' },
          }}
        >
          Acceso para Cajeros
        </Typography>
      </Box>

      <DialogContent sx={{ px: { xs: 3, md: 5 }, pt: 4, pb: 3 }}>
        {!showRanking ? (
          // Vista inicial: Código de acceso
          <>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                textAlign: 'center',
                my: 3,
                color: '#333',
                fontWeight: 500,
              }}
            >
              Ingresa tu código de acceso
            </Typography>

            <TextField
              placeholder="Código de acceso"
              variant="outlined"
              fullWidth
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#f43789',
                  },
                },
                '& label.Mui-focused': {
                  color: '#f43789',
                },
              }}
            />

            {(localError || error) && (
              <Typography
                variant="body2"
                color="error"
                sx={{ mt: 1, textAlign: 'center' }}
              >
                {localError || error}
              </Typography>
            )}

            {/* Botones secundarios */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 2,
                my: 3,
              }}
            >
              <Button
                variant="text"
                sx={{
                  color: '#f43789',
                  textTransform: 'none',
                  fontSize: '1rem',
                  bgcolor: '#e0e0e0',
                  borderRadius: '12px',
                  px: 3,
                  py: 1.5,
                  flex: 1,
                  '&:hover': {
                    bgcolor: '#d0d0d0',
                  },
                }}
                onClick={() => {
                  // Funcionalidad de "olvidaste tu código" - puedes personalizarla
                  alert('Contacta al administrador para recuperar tu código');
                }}
              >
                ¿Olvidaste tu código?
              </Button>

              <Button
                variant="text"
                sx={{
                  color: '#f43789',
                  textTransform: 'none',
                  fontSize: '1rem',
                  bgcolor: '#e0e0e0',
                  borderRadius: '12px',
                  px: 3,
                  py: 1.5,
                  flex: 1,
                  '&:hover': {
                    bgcolor: '#d0d0d0',
                  },
                }}
                onClick={() => setShowRanking(true)}
              >
                Ver ranking
              </Button>
            </Box>

            {/* Botones principales */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 3,
                mt: 4,
              }}
            >
              <Button
                variant="outlined"
                onClick={handleClose}
                sx={{
                  color: '#f43789',
                  borderColor: '#f43789',
                  textTransform: 'uppercase',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  flex: 1,
                  '&:hover': {
                    borderColor: '#d62b74',
                    bgcolor: 'rgba(244, 55, 137, 0.05)',
                  },
                }}
              >
                Cancelar
              </Button>

              <Button
                variant="contained"
                onClick={handleLogin}
                sx={{
                  bgcolor: '#f43789',
                  textTransform: 'uppercase',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  flex: 1,
                  '&:hover': {
                    bgcolor: '#d62b74',
                  },
                }}
              >
                Entrar
              </Button>
            </Box>
          </>
        ) : (
          // Vista de ranking de cajeras
          <>
            <Typography
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
            ) : fetchError ? (
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
                    maxHeight: '400px',
                  }}
                >
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow
                        sx={{
                          backgroundColor: '#f43789',
                          '& .MuiTableCell-head': {
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.95rem',
                            backgroundColor: '#f43789',
                          },
                        }}
                      >
                        <TableCell align="center">Foto</TableCell>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Código de Acceso</TableCell>
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
                            handleLoginSelected(cashier);
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
                            <Typography
                              fontSize="0.9rem"
                              color="text.secondary"
                            >
                              {cashier.email}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              fontSize="0.9rem"
                              fontWeight="bold"
                              color="#f43789"
                            >
                              {cashier.accessCode || 'N/A'}
                            </Typography>
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
                  Haz clic en cualquier cajera para iniciar sesión
                  automáticamente
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
              onClick={() => setShowRanking(false)}
              sx={{
                mt: 3,
                borderColor: '#f43789',
                color: '#f43789',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                '&:hover': {
                  borderColor: '#d62b74',
                  backgroundColor: 'rgba(244, 55, 137, 0.05)',
                },
                borderRadius: 2,
                py: 1.5,
              }}
            >
              Volver
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialogCashiers;
