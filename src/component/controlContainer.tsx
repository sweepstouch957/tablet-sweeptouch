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
import StoreIcon from "@mui/icons-material/Store";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BuildIcon from "@mui/icons-material/Build";
import ReplayIcon from "@mui/icons-material/Replay";

const API_URL = "https://sheetdb.io/api/v1/olym1o09ig0di";

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
  "Soporte Rutinario": "#bfe1f6",
  Configuración: "#e6e6e6",
};


const CardBox = ({ children }: { children: React.ReactNode }) => (
  <Paper
    elevation={4}
    sx={{
      p: 2,
      borderRadius: 4,
      background: "#fff",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      minWidth:"320px",
      borderColor:"#aaaaaa"
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

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Typography
        variant="h6"
        fontWeight="bold"
        color="#fc0680"
        mb={1}
        textAlign="center"
      >
        Control de Soporte Técnico
      </Typography>

      <Box display="flex" justifyContent="center" mb={2} flexDirection={"column"}>
        <Button
          variant="contained"
          startIcon={<ReplayIcon />}
          sx={{ backgroundColor: "#fc0680", textTransform: "none" }}
          onClick={fetchData}
          size="small"
        >
          Actualizar
        </Button>
        <Typography variant="body2" color="text.secondary" textAlign="center">
         Fecha de Hoy {new Date().toLocaleDateString()}
        </Typography>
      </Box>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="200px"
        >
          <CircularProgress color="secondary" />
        </Box>
      ) : entry ? (
        <Stack spacing={3}>
          {/* Supermercado */}
          <Stack direction={{ xs: "column", md: "row" }} justifyContent={"space-between"} gap={2}>
            <Box width={"100%"}>
                <CardBox>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <StoreIcon color="primary" />
                <Typography fontWeight={700} variant="h6">Supermercado</Typography>
              </Box>
              <Typography variant="h5" color="#0066cc" fontWeight={700}>
                {entry.nombre_supermercado}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <LocationOnIcon color="action" />
                <Typography variant="h6" color="text.secondary" >
                  {entry.direccion}
                </Typography>
              </Box>
            </CardBox>
            </Box>
            {/* Horarios */}
            <CardBox >
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <AccessTimeIcon color="success" />
                <Typography variant="h5" fontWeight={700}>Horarios</Typography>
              </Box>
              <Stack spacing={1}>
                <Box
                  sx={{
                    backgroundColor: "#eaffea",
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                  }}
                >
                  <Typography fontWeight={600} color="green" variant="h6">
                    Hora de Llegada: {entry.hora_llegada}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "#ffeaea",
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                  }}
                >
                  <Typography fontWeight={600} color="red"  variant="h6">
                    Hora de Salida: {entry.hora_salida}
                  </Typography>
                </Box>
              </Stack>
            </CardBox>
          </Stack>

          {/* Trabajo Realizado */}
          <CardBox>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <BuildIcon sx={{ color: "#fc0680" }} />
              <Typography variant="h4" fontWeight={700}>Trabajo Realizado</Typography>
            </Box>
            <Box pl={4}>
              <Box
                sx={{
                  display: "inline-block",
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  backgroundColor: actionColors[entry.tipo_accion] || "#4caf50",

                  color: "#000000",
                  fontWeight: "bold",
                  mb: 1,
                }}
              >
                {entry.tipo_accion}
              </Box>
              <Box>
                <Typography fontWeight={600} mb={0.5} variant="h4">
                  Descripción
                </Typography>
                <Typography color="text.secondary" variant="h5">
                  {entry.Descripcion}
                </Typography>
              </Box>
              <Box mt={2} display="flex" alignItems="center" gap={1}>
                <PersonIcon color="action" />
                <Typography fontSize="2rem" >
                  Técnico: {entry.nombre_del_tecnico}
                </Typography>
              </Box>
            </Box>
          </CardBox>
        </Stack>
      ) : (
        <Typography color="error">No hay información disponible.</Typography>
      )}
    </Container>
  );
};

export default ControlSoporte;
