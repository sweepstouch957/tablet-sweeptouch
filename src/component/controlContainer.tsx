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
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";

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



const CardBox = ({ children }: { children: React.ReactNode }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 3,
      backgroundColor: "#f8f9fa",
      border: "1px solid #e9ecef",
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

  const today = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit", 
    year: "numeric"
  });

  return (
    <Container maxWidth="sm" sx={{ py: 2, px: 2 }}>
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #fc066f 0%, #e91e63 100%)",
          borderRadius: 3,
          py: 2,
          px: 3,
          textAlign: "center",
          mb: 3,
          boxShadow: "0 4px 20px rgba(252, 6, 111, 0.3)",
        }}
      >
        <Typography 
          variant="subtitle1" 
          color="#fff" 
          fontWeight="600"
          sx={{ opacity: 0.9, mb: 0.5 }}
        >
          Control de Soporte Técnico
        </Typography>
        <Typography 
          variant="h5" 
          fontWeight="700" 
          color="white"
          sx={{ letterSpacing: '0.5px' }}
        >
          Fecha de Hoy: {today}
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress sx={{ color: "#fc066f" }} />
        </Box>
      ) : entry ? (
        <Stack spacing={3}>
          {/* Supermarket Section */}
          <CardBox>
            <Typography 
              variant="subtitle2" 
              color="#6c757d" 
              fontWeight="600" 
              mb={2}
              sx={{ textTransform: "uppercase", letterSpacing: "0.5px" }}
            >
              Supermercado
            </Typography>
            <Typography 
              variant="h6" 
              fontWeight="700" 
              color="#004aad"
              sx={{ mb: 2, fontSize: "1.4rem" }}
            >
              {entry.nombre_supermercado || "CITY SUPERMARKET"}
            </Typography>
            <Box display="flex" alignItems="flex-start" gap={1}>
              <LocationOnIcon
                sx={{ fontSize: 18, color: "#fc066f", mt: 0.2 }}
              />
              <Typography 
                variant="body2" 
                color="#6c757d"
                sx={{ lineHeight: 1.4 }}
              >
                {entry.direccion || "525 Irvington ave Newark, NJ 07106"}
              </Typography>
            </Box>
          </CardBox>

          {/* Schedule Section */}
          <CardBox>
            <Typography 
              variant="subtitle2" 
              color="#6c757d" 
              fontWeight="600" 
              mb={2}
              sx={{ textTransform: "uppercase", letterSpacing: "0.5px" }}
            >
              Horarios
            </Typography>
            <Stack spacing={2}>
              <Box
                sx={{
                  background: "#4caf50",
                  borderRadius: 2,
                  px: 3,
                  py: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" color="white" fontWeight="600">
                  Hora de Llegada
                </Typography>
                <Typography variant="h6" color="white" fontWeight="700">
                  {entry.hora_llegada || "4:24 PM"}
                </Typography>
              </Box>
              <Box
                sx={{
                  background: "#f44336",
                  borderRadius: 2,
                  px: 3,
                  py: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" color="white" fontWeight="600">
                  Hora de Salida
                </Typography>
                <Typography variant="h6" color="white" fontWeight="700">
                  {entry.hora_salida || "4:24 PM"}
                </Typography>
              </Box>
            </Stack>
          </CardBox>

          {/* Work Section */}
          <CardBox>
            <Typography 
              variant="subtitle2" 
              color="#6c757d" 
              fontWeight="600" 
              mb={2}
              sx={{ textTransform: "uppercase", letterSpacing: "0.5px" }}
            >
              Trabajo Realizado
            </Typography>

            <Box
              sx={{
                display: "inline-block",
                px: 3,
                py: 1,
                borderRadius: 2,
                backgroundColor: "#fc066f",
                color: "#fff",
                fontWeight: "700",
                mb: 3,
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {entry.tipo_accion || "Soporte Rutinario"}
            </Box>

            <Typography 
              variant="subtitle2" 
              fontWeight="600" 
              mb={1}
              color="#212529"
            >
              Descripción
            </Typography>
            <Typography 
              variant="body1" 
              color="#6c757d"
              sx={{ mb: 3, lineHeight: 1.5 }}
            >
              {entry.Descripcion || "Instalacion impresoras"}
            </Typography>

            <Typography 
              variant="body1" 
              color="#212529"
              sx={{ fontWeight: "500" }}
            >
              Técnico: <strong>{entry.nombre_del_tecnico || "Jose Ramirez"}</strong>
            </Typography>
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
