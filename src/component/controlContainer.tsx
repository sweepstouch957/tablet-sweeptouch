"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Button,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BuildIcon from "@mui/icons-material/Build";
import ReplayIcon from "@mui/icons-material/Replay";

const API_URL = "https://sheetdb.io/api/v1/2s3i4cw7ppvtr";

interface Entry {
  nombre_del_tecnico: string;
  nombre_supermercado: string;
  direccion: string;
  hora_llegada: string;
  hora_salida: string;
  tipo_accion: string;
  Descripcion: string;
}

const actionColors: Record<string, string> = {
  Instalación: "#d4edbc",
  Reprogramación: "#ffc8aa",
  Desinstalación: "#ffcfc9",
  "Soporte Rutinario": "#fc066f",
  Configuración: "#e6e6e6",
};

const CardBox = ({ children }: { children: React.ReactNode }) => (
  <Paper
    elevation={3}
    sx={{
      p: 2,
      borderRadius: 4,
      backgroundColor: "#fff",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      width: "100%",
    }}
  >
    {children}
  </Paper>
);

const ControlSoporte = () => {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    axios
      .get(API_URL)
      .then((res) => setEntry(res.data[0]))
      .catch(() => setEntry(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const today = new Date().toLocaleDateString();

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      {/* Encabezado */}
      <Box
        sx={{
          background: "#fc066f",
          borderRadius: 2,
          py: 1.5,
          px: 2,
          textAlign: "center",
          mb: 3,
        }}
      >
        <Typography variant="subtitle2" color="#fff" fontWeight="bold">
          Control de Soporte Técnico
        </Typography>
        <Typography variant="h5" fontWeight="bold" color="white">
          Fecha de Hoy: {today}
        </Typography>
      </Box>

      {/* Botón de recarga */}
      <Box textAlign="center" mb={2}>
        <Button
          variant="contained"
          startIcon={<ReplayIcon />}
          onClick={fetchData}
          sx={{ backgroundColor: "#fc066f", textTransform: "none" }}
        >
          Actualizar
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      ) : entry ? (
        <Stack spacing={3}>
          {/* Supermercado y horarios */}
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {/* Supermercado */}
            <CardBox>
              <Typography fontWeight="bold" color="text.secondary" mb={1}>
                Supermercado
              </Typography>
              <Typography fontSize="1.3rem" fontWeight="bold" color="#004aad">
                {entry.nombre_supermercado}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <LocationOnIcon
                  sx={{ fontSize: 20, color: "#fc066f", mr: 1 }}
                />
                <Typography variant="body1" color="text.secondary">
                  {entry.direccion}
                </Typography>
              </Box>
            </CardBox>

            {/* Horarios */}
            <CardBox>
              <Typography fontWeight="bold" color="text.secondary" mb={1}>
                Horarios
              </Typography>
              <Box
                sx={{
                  background: "#e7fce7",
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  mb: 1,
                }}
              >
                <Typography variant="body2" color="green" fontWeight="bold">
                  Hora de Llegada: {entry.hora_llegada}
                </Typography>
              </Box>
              <Box
                sx={{
                  background: "#ffeaea",
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                }}
              >
                <Typography variant="body2" color="red" fontWeight="bold">
                  Hora de Salida: {entry.hora_salida}
                </Typography>
              </Box>
            </CardBox>
          </Stack>

          {/* Trabajo realizado */}
          <CardBox>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <BuildIcon sx={{ color: "#fc066f" }} />
              <Typography variant="h6" fontWeight="bold">
                Trabajo Realizado
              </Typography>
            </Box>

            <Box
              sx={{
                display: "inline-block",
                px: 2,
                py: 0.5,
                borderRadius: 2,
                backgroundColor: actionColors[entry.tipo_accion] || "#4caf50",
                color: "#fff",
                fontWeight: "bold",
                mb: 1,
              }}
            >
              {entry.tipo_accion}
            </Box>

            <Typography fontWeight="bold" mb={0.5}>
              Descripción
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {entry.Descripcion}
            </Typography>

            <Box display="flex" alignItems="center" mt={2}>
              <PersonIcon sx={{ mr: 1 }} />
              <Typography variant="body1">
                Técnico: <strong>{entry.nombre_del_tecnico}</strong>
              </Typography>
            </Box>  
          </CardBox>
        </Stack>
      ) : (
        <Typography color="error" textAlign="center">
          No hay información disponible.
        </Typography>
      )}
    </Container>
  );
};

export default ControlSoporte;
