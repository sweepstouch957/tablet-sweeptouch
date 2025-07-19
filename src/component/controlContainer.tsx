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
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ScheduleIcon from "@mui/icons-material/Schedule";
import BusinessIcon from "@mui/icons-material/Business";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LogoutIcon from "@mui/icons-material/Logout";
import WorkIcon from "@mui/icons-material/Work";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

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
      p: 2,
      borderRadius: 3,
      backgroundColor: "#f8f9fa",
      border: "1px solid #e9ecef",
      width: "100%",
      height: "100%",
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
    year: "numeric",
  });

  return (
    <Container maxWidth="lg" sx={{ py: 1, px: 3 }}>
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #fc066f 0%, #e91e63 100%)",
          borderRadius: 3,
          p: 1,
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(252, 6, 111, 0.3)",
          mb: 2,
        }}
      >
        <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
          <CalendarTodayIcon sx={{ fontSize: 40, color: "white" }} />
          <Typography
            variant="h6"
            color="#fff"
            fontWeight="700"
            sx={{ opacity: 0.9 }}
            lineHeight={1}
          >
            Control de Soporte Técnico
          </Typography>
        </Box>
        <Stack>
          <Typography
            variant="h6"
            fontWeight="800"
            color="white"
            sx={{ letterSpacing: "1px", fontSize: "1rem" }}
          >
            Fecha de Hoy: {today}
          </Typography>
          <Button
            sx={{
              mt: 1,
              backgroundColor: "#fff",
              color: "#fc066f",
              "&:hover": {
                backgroundColor: "#f8f9fa",
              },
              fontWeight: "600",
              textTransform: "none",
              fontSize: "0.9rem",
              maxWidth: 200,
              margin: "0 auto",
            }}
          >
            Recargar Datos
          </Button>
        </Stack>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress sx={{ color: "#fc066f", size: 80 }} />
        </Box>
      ) : entry ? (
        <Box>
          {/* Two Column Layout for Supermarket and Schedule */}
          <Stack
            spacing={4}
            direction={{ xs: "column", md: "row" }}
            sx={{ mb: 1 }}
          >
            {/* Supermarket Section */}
            <CardBox>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <BusinessIcon sx={{ fontSize: 40, color: "#fc066f" }} />
                <Typography
                  variant="h6"
                  color="#6c757d"
                  fontWeight="700"
                  sx={{ textTransform: "uppercase", letterSpacing: "1px" }}
                >
                  Supermercado
                </Typography>
              </Box>
              <Typography
                variant="h3"
                fontWeight="800"
                color="#004aad"
                sx={{ fontSize: "2rem" }}
                mb={"4px"}
              >
                {entry.nombre_supermercado || "CITY SUPERMARKET"}
              </Typography>
              <Box display="flex" alignItems="flex-start" gap={2}>
                <LocationOnIcon
                  sx={{ fontSize: 32, color: "#fc066f", mt: 0.5 }}
                />
                <Typography
                  variant="h6"
                  color="#6c757d"
                  sx={{ lineHeight: 1.4, fontSize: "1.3rem" }}
                >
                  {entry.direccion || "525 Irvington ave Newark, NJ 07106"}
                </Typography>
              </Box>
            </CardBox>

            {/* Schedule Section */}
            <CardBox>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <ScheduleIcon sx={{ fontSize: 40, color: "#fc066f" }} />
                <Typography
                  variant="h6"
                  color="#6c757d"
                  fontWeight="700"
                  sx={{ textTransform: "uppercase", letterSpacing: "1px" }}
                >
                  Horarios
                </Typography>
              </Box>
              <Stack spacing={1}>
                <Box
                  sx={{
                    background: "#4caf50",
                    borderRadius: 3,
                    p: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <AccessTimeIcon sx={{ fontSize: 32, color: "white" }} />
                    <Typography
                      variant="h6"
                      color="white"
                      fontWeight="700"
                      sx={{ fontSize: "1.4rem" }}
                    >
                      Hora de Llegada
                    </Typography>
                  </Box>
                  <Typography
                    variant="h4"
                    color="white"
                    fontWeight="800"
                    sx={{ fontSize: { xs: "1.8rem", md: "2.2rem" } }}
                  >
                    {entry.hora_llegada || "4:24 PM"}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    background: "#f44336",
                    borderRadius: 3,
                    p: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <LogoutIcon sx={{ fontSize: 32, color: "white" }} />
                    <Typography
                      variant="h6"
                      color="white"
                      fontWeight="700"
                      sx={{ fontSize: "1.4rem" }}
                    >
                      Hora de Salida
                    </Typography>
                  </Box>
                  <Typography
                    variant="h4"
                    color="white"
                    fontWeight="800"
                    sx={{ fontSize: { xs: "1.8rem", md: "2.2rem" } }}
                  >
                    {entry.hora_salida || "4:24 PM"}
                  </Typography>
                </Box>
              </Stack>
            </CardBox>
          </Stack>

          {/* Work Section - Full Width at Bottom */}
          <CardBox>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <WorkIcon sx={{ fontSize: 40, color: "#fc066f" }} />
              <Typography
                variant="h4"
                color="#6c757d"
                fontWeight="700"
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontSize: "1.8rem",
                }}
              >
                Trabajo Realizado
              </Typography>
            </Box>

            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 2,
                p: 1,
                borderRadius: 3,
                backgroundColor: "#fc066f",
                color: "#fff",
                fontWeight: "800",
                mb: 1,
                fontSize: "1rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              <WorkIcon sx={{ fontSize: 28 }} />
              {entry.tipo_accion || "Soporte Rutinario"}
            </Box>

            <Box display="flex" alignItems="center" gap={1} >
              <DescriptionIcon sx={{ fontSize: 32, color: "#fc066f" }} />
              <Typography
                variant="h5"
                fontWeight="700"
                color="#212529"
                sx={{ fontSize: "1.6rem" }}
              >
                Descripción
              </Typography>
            </Box>
            <Typography
              variant="h6"
              color="#6c757d"
              sx={{ lineHeight: 1.5, fontSize: "1.8rem", pl: 5 }}
            >
              {entry.Descripcion || "Instalacion impresoras"}
            </Typography>

            <Box display="flex" alignItems="center" gap={1}>
              <PersonIcon sx={{ fontSize: 32, color: "#fc066f" }} />
              <Typography
                variant="h5"
                color="#212529"
                sx={{ fontWeight: "600", fontSize: "1.6rem" }}
              >
                Técnico:{" "}
                <strong style={{ color: "#004aad" }}>
                  {entry.nombre_del_tecnico || "Jose Ramirez"}
                </strong>
              </Typography>
            </Box>
          </CardBox>
        </Box>
      ) : (
        <Typography
          color="error"
          textAlign="center"
          variant="h4"
          sx={{ py: 8 }}
        >
          No hay información disponible.
        </Typography>
      )}
    </Container>
  );
};

export default ControlSoporte;
