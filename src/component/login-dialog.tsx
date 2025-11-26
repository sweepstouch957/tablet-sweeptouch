/* eslint-disable @typescript-eslint/no-unused-vars */
// LoginDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from '@mui/material';
import { useAuth } from '@/context/auth-context';

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ open, onClose }) => {
  const [accessCode, setAccessCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { login, error } = useAuth();

  const handleLogin = async () => {
    if (!accessCode) {
      setLocalError('Please enter your access code.');
      return;
    }

    setLocalError(null);
    try {
      await login('', '', accessCode); // Asegúrate que tu `login` soporte este tercer argumento
      onClose();
      setAccessCode('');
      window.location.reload(); // 👈 fuerza refresco
    } catch (_) {
      // El error ya lo maneja el contexto
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
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
        {'Cashier Access'}
      </DialogTitle>

      <DialogContent sx={{ px: 4, pt: 3, pb: 1 }}>
        <Typography
          variant="body1"
          gutterBottom
          sx={{ textAlign: 'center', my: 2, color: '#555' }}
        >
          {'Enter your access code'}
        </Typography>

        <TextField
          label="Access code"
          variant="outlined"
          fullWidth
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          sx={{
            mb: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
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
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {localError || error}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 3, justifyContent: 'space-between' }}>
        <Button onClick={onClose} sx={{ color: '#f43789' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleLogin}
          sx={{
            bgcolor: '#f43789',
            '&:hover': {
              bgcolor: '#d62b74',
            },
            borderRadius: '8px',
            px: 3,
          }}
        >
          Enter
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginDialog;
