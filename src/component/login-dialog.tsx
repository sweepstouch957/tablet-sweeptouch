// LoginDialog.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import { useAuth } from "@/context/auth-context";

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ open, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleLogin = () => {
    login(email);
    onClose();
    setEmail("");
    setPassword("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle
        sx={{
          bgcolor: "#f43789",
          color: "white",
          textAlign: "center",
          py: 2,
          fontWeight: "bold",
          fontSize: "1.5rem",
        }}
      >
        Bienvenido
      </DialogTitle>

      <DialogContent sx={{ px: 4, pt: 3, pb: 1 }}>
        <Typography
          variant="body1"
          gutterBottom
          sx={{ textAlign: "center", my: 2, color: "#555" }}
        >
          Inicia sesión para continuar
        </Typography>

        <TextField
          label="Correo electrónico"
          type="email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#f43789",
              },
            },
            "& label.Mui-focused": {
              color: "#f43789",
            },
          }}
        />

        <TextField
          label="Contraseña"
          type="password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            mb: 1,
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#f43789",
              },
            },
            "& label.Mui-focused": {
              color: "#f43789",
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 3, justifyContent: "space-between" }}>
        <Button onClick={onClose} sx={{ color: "#f43789" }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleLogin}
          sx={{
            bgcolor: "#f43789",
            "&:hover": {
              bgcolor: "#d62b74",
            },
            borderRadius: "8px",
            px: 3,
          }}
        >
          Iniciar sesión
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginDialog;
