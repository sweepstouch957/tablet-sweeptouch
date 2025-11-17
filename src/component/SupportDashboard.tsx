/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useMemo, useState } from "react";
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

/** ===== Tipos ===== */
export type ApiRecord = Record<string, any>;

export type FieldMap = {
  tecnico: string;
  supermercado: string;
  direccion: string;
  horaLlegada: string;
  horaSalida: string;
  tipoAccion: string;
  descripcion: string;
};

export type Labels = {
  headerTitle: string;
  todayPrefix: string;
  supermercado: string;
  horarios: string;
  llegada: string;
  salida: string;
  trabajoRealizado: string;
  descripcion: string;
  tecnico: string;
  recargar: string;
};


export type ThemeConfig = {
  headerGradient?: string;
  brandPrimary?: string;
  titleColor?: string;
  okColor?: string;
  dangerColor?: string;
  surface?: string;
  surfaceBorder?: string;
  pageBg?: string;
};

export interface SupportDashboardProps {
  apiUrl: string;
  arrayIndex?: number;
  transformResponse?: (res: any) => ApiRecord | null;
  fieldMap?: Partial<FieldMap>;
  labels?: Partial<Labels>;
  theme?: ThemeConfig;
  dateLocale?: string;
  showReload?: boolean;
  placeholders?: {
    supermercado?: string;
    direccion?: string;
    hora?: string;
    tipoAccion?: string;
    descripcion?: string;
    tecnico?: string;
  };
}

/** ===== Defaults (estables) ===== */
const DEFAULTS = {
  apiUrl: "https://sheetdb.io/api/v1/2s3i4cw7ppvtr",
  arrayIndex: 0,
  dateLocale: "es-ES",
  showReload: true,
  fieldMap: {
    tecnico: "nombre_del_encargado",
    supermercado: "nombre_supermercado",
    direccion: "direccion",
    horaLlegada: "hora_llegada",
    horaSalida: "hora_salida",
    tipoAccion: "tipo_accion",
    descripcion: "Descripcion",
  } as FieldMap,
  labels: {
    headerTitle: "Control de Soporte Técnico",
    todayPrefix: "Fecha de Hoy:",
    supermercado: "Supermercado",
    horarios: "Horarios",
    llegada: "Hora de Llegada",
    salida: "Hora de Salida",
    trabajoRealizado: "Trabajo Realizado",
    descripcion: "Descripción",
    tecnico: "Técnico",
    recargar: "Recargar",
  } as Labels,
  theme: {
    headerGradient: "linear-gradient(135deg, #fc066f 0%, #e91e63 100%)",
    brandPrimary: "#fc066f",
    titleColor: "#004aad",
    okColor: "#4caf50",
    dangerColor: "#f44336",
    surface: "#f8f9fa",
    surfaceBorder: "#e9ecef",
    pageBg: "#efefef",
  } as ThemeConfig,
  placeholders: {
    supermercado: "CITY SUPERMARKET",
    direccion: "525 Irvington ave Newark, NJ 07106",
    hora: "4:24 PM",
    tipoAccion: "Soporte Rutinario",
    descripcion: "Instalación de impresoras",
    tecnico: "Jose Ramirez",
  },
};

/** Merge superficial (suficiente para nuestro caso) */
function merge<T extends object>(base: T, over?: Partial<T>): T {
  return { ...base, ...(over ?? {}) } as T;
}

/** ===== Card ===== */
const CardBox: React.FC<{
  children: React.ReactNode;
  themeCfg: ThemeConfig;
}> = ({ children, themeCfg }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: 3,
      backgroundColor: themeCfg.surface ?? "#f8f9fa",
      border: `1px solid ${themeCfg.surfaceBorder ?? "#e9ecef"}`,
      width: "100%",
      height: "100%",
    }}
  >
    {children}
  </Paper>
);

/** ===== Componente ===== */
const SupportDashboard: React.FC<SupportDashboardProps> = (props) => {
  // Deep-merge de objetos anidados (fieldMap, labels, theme, placeholders)
  const apiUrl = props.apiUrl || DEFAULTS.apiUrl;
  const arrayIndex = props.arrayIndex ?? DEFAULTS.arrayIndex;
  const dateLocale = props.dateLocale ?? DEFAULTS.dateLocale;
  const showReload = props.showReload ?? DEFAULTS.showReload;

  const fieldMap = merge(DEFAULTS.fieldMap, props.fieldMap);
  const labels = merge(DEFAULTS.labels, props.labels);
  const themeCfg = merge(DEFAULTS.theme, props.theme);
  const placeholders = merge(DEFAULTS.placeholders, props.placeholders);

  const { transformResponse } = props;

  const [record, setRecord] = useState<ApiRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    axios
      .get(apiUrl)
      .then((res) => {
        if (transformResponse) {
          setRecord(transformResponse(res) ?? null);
        } else {
          const raw = res?.data;
          if (Array.isArray(raw)) setRecord(raw[arrayIndex] ?? null);
          else if (raw && typeof raw === "object") setRecord(raw);
          else setRecord(null);
        }
      })
      .catch(() => setRecord(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString(dateLocale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    [dateLocale]
  );

  const get = (k: string) => (record?.[k] as string | undefined) ?? undefined;

  const nombreSuper = get(fieldMap.supermercado) ?? placeholders.supermercado;
  const direccion = get(fieldMap.direccion) ?? placeholders.direccion;
  const horaLlegada = get(fieldMap.horaLlegada) ?? placeholders.hora;
  const horaSalida = get(fieldMap.horaSalida) ?? placeholders.hora;
  const tipoAccion = get(fieldMap.tipoAccion) ?? placeholders.tipoAccion;
  const descripcion = get(fieldMap.descripcion) ?? placeholders.descripcion;
  const tecnico = get(fieldMap.tecnico) ?? placeholders.tecnico;

  return (
    <Container maxWidth="lg" sx={{ py: 1, px: 3, background: themeCfg.pageBg }}>
      {/* Header */}
      <Box
        sx={{
          background: themeCfg.headerGradient,
          borderRadius: 3,
          p: 1,
          textAlign: "center",
          boxShadow: `0 4px 20px ${themeCfg.brandPrimary}4D`,
          mb: 2,
        }}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          gap={2}
          width="100%"
        >
          <CalendarTodayIcon sx={{ fontSize: 40, color: "white" }} />
          <Typography
            variant="h6"
            color="#fff"
            fontWeight="700"
            sx={{ opacity: 0.9 }}
            lineHeight={1}
          >
            {labels.headerTitle}
          </Typography>
          {showReload && (
            <Box>
              <Button
                sx={{
                  mt: 1,
                  backgroundColor: "#fff",
                  color: themeCfg.brandPrimary,
                  "&:hover": { backgroundColor: "#f8f9fa" },
                  fontWeight: "600",
                  textTransform: "none",
                  fontSize: "0.9rem",
                  maxWidth: 200,
                  margin: "0 auto",
                }}
                onClick={fetchData}
              >
                {labels.recargar}
              </Button>
            </Box>
          )}
        </Box>
        <Stack>
          <Typography
            variant="h6"
            fontWeight="800"
            color="white"
            sx={{ letterSpacing: "1px", fontSize: "1.7rem" }}
          >
            {labels.todayPrefix} {today}
          </Typography>
        </Stack>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress sx={{ color: themeCfg.brandPrimary }} />
        </Box>
      ) : record ? (
        <Box>
          <Stack
            spacing={4}
            direction={{ xs: "column", md: "row" }}
            sx={{ mb: 1 }}
          >
            {/* Supermercado */}
            <CardBox themeCfg={themeCfg}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <BusinessIcon
                  sx={{ fontSize: 40, color: themeCfg.brandPrimary }}
                />
                <Typography
                  variant="h6"
                  color="#6c757d"
                  fontWeight="700"
                  sx={{ textTransform: "uppercase", letterSpacing: "1px" }}
                >
                  {labels.supermercado}
                </Typography>
              </Box>
              <Typography
                variant="h3"
                fontWeight="800"
                color={themeCfg.titleColor}
                sx={{ fontSize: "2rem" }}
                mb="4px"
              >
                {nombreSuper}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <LocationOnIcon
                  sx={{ fontSize: 32, color: themeCfg.brandPrimary, mt: 0.5 }}
                />
                <Typography
                  variant="h6"
                  color="#6c757d"
                  sx={{ lineHeight: 1.4, fontSize: "1.3rem" }}
                >
                  {direccion}
                </Typography>
              </Box>
            </CardBox>

            {/* Horarios */}
            <CardBox themeCfg={themeCfg}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <ScheduleIcon
                  sx={{ fontSize: 40, color: themeCfg.brandPrimary }}
                />
                <Typography
                  variant="h6"
                  color="#6c757d"
                  fontWeight="700"
                  sx={{ textTransform: "uppercase", letterSpacing: "1px" }}
                >
                  {labels.horarios}
                </Typography>
              </Box>
              <Stack spacing={1}>
                <Box
                  sx={{
                    background: themeCfg.okColor,
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
                      {labels.llegada}
                    </Typography>
                  </Box>
                  <Typography
                    variant="h4"
                    color="white"
                    fontWeight="800"
                    sx={{ fontSize: { xs: "1.8rem", md: "2.2rem" } }}
                  >
                    {horaLlegada}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    background: themeCfg.dangerColor,
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
                      {labels.salida}
                    </Typography>
                  </Box>
                  <Typography
                    variant="h4"
                    color="white"
                    fontWeight="800"
                    sx={{ fontSize: { xs: "1.8rem", md: "2.2rem" } }}
                  >
                    {horaSalida}
                  </Typography>
                </Box>
              </Stack>
            </CardBox>
          </Stack>

          {/* Trabajo Realizado */}
          <CardBox themeCfg={themeCfg}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <WorkIcon sx={{ fontSize: 40, color: themeCfg.brandPrimary }} />
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
                {labels.trabajoRealizado}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 2,
                p: 1,
                borderRadius: 3,
                backgroundColor: themeCfg.brandPrimary,
                color: "#fff",
                fontWeight: "800",
                mb: 1,
                fontSize: "1rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              <WorkIcon sx={{ fontSize: 28 }} />
              {tipoAccion}
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <DescriptionIcon
                sx={{ fontSize: 32, color: themeCfg.brandPrimary }}
              />
              <Typography
                variant="h5"
                fontWeight="700"
                color="#212529"
                sx={{ fontSize: "1.6rem" }}
              >
                {labels.descripcion}
              </Typography>
            </Box>
            <Typography
              variant="h6"
              color="#6c757d"
              sx={{ lineHeight: 1.5, fontSize: "1.8rem", pl: 5 }}
            >
              {descripcion}
            </Typography>

            <Box display="flex" alignItems="center" gap={1}>
              <PersonIcon sx={{ fontSize: 32, color: themeCfg.brandPrimary }} />
              <Typography
                variant="h5"
                color="#212529"
                sx={{ fontWeight: "600", fontSize: "1.6rem" }}
              >
                {labels.tecnico}:{" "}
                <strong style={{ color: themeCfg.titleColor }}>
                  {tecnico}
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

export default SupportDashboard;
