/* eslint-disable @typescript-eslint/no-unused-vars */
// LoginDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import { useAuth } from '@/context/auth-context';
import { getCashiersByStore, Cashier } from '@/services/cashier.service';

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  storeId: string;
}

const LoginDialog: React.FC<LoginDialogProps> = ({
  open,
  onClose,
  storeId,
}) => {
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { login, error } = useAuth();

  useEffect(() => {
    if (open && storeId) {
      loadCashiers();
    }
  }, [open, storeId]);

  const loadCashiers = async () => {
    setLoading(true);
    setLocalError(null);
    try {
      const data = await getCashiersByStore(storeId);
      setCashiers(data);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      setLocalError(
        axiosError.response?.data?.error || 'Error al cargar cajeros'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (cashiers.length === 0) {
      setLocalError('No hay cajeros disponibles.');
      return;
    }

    setLocalError(null);

    // Seleccionar un access code aleatorio
    const randomCashier = cashiers[Math.floor(Math.random() * cashiers.length)];
    const accessCode = randomCashier.accessCode;

    try {
      await login('', '', accessCode);
      onClose();
      window.location.reload();
    } catch (_) {
      // El error ya lo maneja el contexto
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          bgcolor: '#f43789',
          color: 'white',
          textAlign: 'center',
          py: 2,
          fontWeight: 'bold',
          fontSize: '1.5rem',
        }}
      >
        Cajeros Disponibles
      </DialogTitle>

      <DialogContent sx={{ px: 4, pt: 3, pb: 1 }}>
        <Typography
          variant="body1"
          gutterBottom
          sx={{ textAlign: 'center', my: 2, color: '#555' }}
        >
          Selecciona iniciar sesión para continuar
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress sx={{ color: '#f43789' }} />
          </Box>
        ) : localError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {localError}
          </Alert>
        ) : cashiers.length === 0 ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No hay cajeros disponibles
          </Alert>
        ) : (
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {cashiers.map((cashier) => (
              <ListItem
                key={cashier._id}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  mb: 1,
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                  },
                }}
              >
                <ListItemText
                  primary={`${cashier.firstName} ${cashier.lastName}`}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {cashier.email}
                      </Typography>
                      <br />
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        {cashier.phoneNumber}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}

        {error && (
          <Typography
            variant="body2"
            color="error"
            sx={{ mt: 2, textAlign: 'center' }}
          >
            {error}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 3, justifyContent: 'space-between' }}>
        <Button onClick={onClose} sx={{ color: '#f43789' }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleLogin}
          disabled={loading || cashiers.length === 0}
          sx={{
            bgcolor: '#f43789',
            '&:hover': {
              bgcolor: '#d62b74',
            },
            '&:disabled': {
              bgcolor: '#ccc',
            },
            borderRadius: '8px',
            px: 3,
          }}
        >
          Iniciar Sesión
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginDialog;
