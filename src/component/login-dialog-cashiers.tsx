'use client';

import React, { useState, useMemo } from 'react';
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
  Switch, // Importar Switch de MUI
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
  const [isEnglish, setIsEnglish] = useState(false); // Nuevo estado para el idioma
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedCashier, setSelectedCashier] = useState<any | null>(null);
  const { login, error } = useAuth();

  const {
    data,
    isLoading,
    error: fetchError,
  } = useCashiersByStore(storeId || '');

  // Objeto de traducciones
  const translations = useMemo(() => {
    return {
      es: {
        title: 'Acceso para Cajeros',
        enterCode: 'Ingresa tu código de acceso',
        accessCode: 'Código de acceso',
        forgotCode: '¿Olvidaste tu código?',
        viewRanking: 'Ver ranking',
        cancel: 'CANCELAR',
        enter: 'ENTRAR',
        cashierRanking: 'Ranking de Cajeros',
        loadingCashiers: 'Cargando cajeros...',
        errorLoading: 'Error al cargar cajeros.',
        photo: 'Foto',
        name: 'Nombre',
        email: 'Correo',
        code: 'Código de Acceso',
        selectCashier: 'Selecciona un cajero para ingresar',
        pleaseEnterCode: 'Por favor, ingresa tu código de acceso.',
        noCashiers: 'No se encontraron cajeros para esta tienda.',
      },
      en: {
        title: 'Cashier Access',
        enterCode: 'Enter your access code',
        accessCode: 'Access code',
        forgotCode: 'Forgot your code?',
        viewRanking: 'View Ranking',
        cancel: 'CANCEL',
        enter: 'ENTER',
        cashierRanking: 'Cashier Ranking',
        loadingCashiers: 'Loading cashiers...',
        errorLoading: 'Error loading cashiers.',
        photo: 'Photo',
        name: 'Name',
        email: 'Email',
        code: 'Access Code',
        selectCashier: 'Select a cashier to log in',
        pleaseEnterCode: 'Please enter your access code.',
        noCashiers: 'No cashiers found for this store.',
      },
    };
  }, []);

  const t = isEnglish ? translations.en : translations.es;

  const handleLogin = async () => {
    if (!accessCode) {
      setLocalError(t.pleaseEnterCode);
      return;
    }

    setLocalError(null);
    try {
      await login('', '', accessCode);
      onClose();
      setAccessCode('');
      setShowRanking(false);
      // Recargar la página después del login exitoso
      window.location.reload();
    } catch (error) {
      console.log(error);

      // El error ya lo maneja el contexto
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLoginSelected = async (cashier: any) => {
    if (!cashier || !cashier.accessCode) return;

    try {
      await login('', '', cashier.accessCode);
      setShowRanking(false);
      onClose();
      // Recargar la página después del login exitoso
      window.location.reload();
    } catch (err) {
      console.error('Error during automatic login:', err);
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
          position: 'relative', // Para posicionar el switch
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '1.8rem', md: '2.2rem' },
          }}
        >
          {t.title}
        </Typography>
        {/* Switch de Idioma */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 16,
            display: 'flex',
            alignItems: 'center',
            color: 'white',
            fontSize: '0.8rem',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
            ES
          </Typography>
          <Switch
            checked={isEnglish}
            onChange={() => setIsEnglish(!isEnglish)}
            color="default"
            size="small"
            sx={{
              '& .MuiSwitch-track': {
                backgroundColor: 'white !important',
              },
              '& .MuiSwitch-thumb': {
                color: '#f43789',
              },
            }}
          />
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
            EN
          </Typography>
        </Box>
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
              {t.enterCode}
            </Typography>

            <TextField
              placeholder={t.accessCode}
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
                  // Funcionalidad de "olvidaste tu código" - ahora muestra el ranking
                  setShowRanking(true);
                }}
              >
                {t.forgotCode}
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
                onClick={() => {
                  // El nuevo botón también muestra el ranking
                  setShowRanking(true);
                }}
              >
                {t.viewRanking}
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
                {t.cancel}
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
                {t.enter}
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
              {t.cashierRanking}
            </Typography>

            {isLoading ? (
              <Stack alignItems="center" mt={4}>
                <CircularProgress sx={{ color: '#fc0680' }} />
                <Typography mt={2} color="text.secondary">
                  {t.loadingCashiers}
                </Typography>
              </Stack>
            ) : fetchError ? (
              <Typography color="error" textAlign="center">
                {t.errorLoading}
              </Typography>
            ) : data && data.length > 0 ? (
              <>
                <TableContainer
                  component={Paper}
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: 2,
                    boxShadow: 3,
                    overflowY: 'auto',
                    maxHeight: '60vh', // Ajuste para asegurar el scroll en pantallas más pequeñas
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
                        <TableCell align="center">{t.photo}</TableCell>
                        <TableCell>{t.name}</TableCell>
                        <TableCell>{t.email}</TableCell>
                        <TableCell>{t.code}</TableCell>
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
                              py: 1,
                            },
                          }}
                        >
                          <TableCell align="center">
                            <Avatar
                              src={cashier.profileImage}
                              alt={cashier.firstName}
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: '#f43789',
                                mx: 'auto',
                              }}
                            >
                              {cashier.firstName[0]}
                            </Avatar>
                          </TableCell>
                          <TableCell>{cashier.firstName}</TableCell>
                          <TableCell>{cashier.email}</TableCell>
                          <TableCell>{cashier.accessCode}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  mt={2}
                >
                  {t.selectCashier}
                </Typography>
              </>
            ) : (
              <Typography textAlign="center" mt={4}>
                {t.noCashiers}
              </Typography>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => setShowRanking(false)}
                sx={{
                  color: '#f43789',
                  borderColor: '#f43789',
                  textTransform: 'uppercase',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    borderColor: '#d62b74',
                    bgcolor: 'rgba(244, 55, 137, 0.05)',
                  },
                }}
              >
                {t.cancel}
              </Button>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialogCashiers;
