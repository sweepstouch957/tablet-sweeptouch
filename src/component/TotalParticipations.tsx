// src/components/cashier/TotalParticipations.tsx
"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Stack,
  Button,
  Modal,
  IconButton,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import KeyIcon from "@mui/icons-material/Key";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/http/client";

const fetchTodayParticipation = async (userId: string) => {
  const { data } = await api.get(`/sweepstakes/participants/today/${userId}`);
  return data.total || 0;
};

type Props = { storeId?: string };

export default function TodayParticipationCard({ storeId: _storeId }: Props) {
  const { user } = useAuth();
  const [openCode, setOpenCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: todayCount = 0, isLoading: loadingToday } = useQuery({
    queryKey: ["participations", "today", user?._id],
    queryFn: () => fetchTodayParticipation(user!._id),
    enabled: !!user?._id,
    refetchInterval: 15000,
  });

  if (!user) return null;

  const handleCopy = () => {
    if (user.accessCode) {
      navigator.clipboard.writeText(user.accessCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Participation count card */}
      <Card
        sx={{
          background: "linear-gradient(135deg, #fc0680, #a90065 60%)",
          color: "white",
          borderRadius: 4,
          boxShadow: 6,
          mt: 2,
          width: "100%",
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="body2" fontWeight={700} sx={{ opacity: 0.85, mb: 0.5 }}>
            Participaciones de Hoy
          </Typography>

          <Box display="flex" alignItems="center" gap={1.5} mt={0.5}>
            {loadingToday ? (
              <CircularProgress size={32} sx={{ color: "white" }} />
            ) : (
              <Typography fontSize="3rem" fontWeight="900" lineHeight={1}>
                {todayCount}
              </Typography>
            )}
            <Typography fontSize="1rem" fontWeight={500} sx={{ opacity: 0.85 }}>
              participaciones
            </Typography>
          </Box>

          {/* Access code button */}
          <Button
            startIcon={<KeyIcon />}
            onClick={() => setOpenCode(true)}
            size="small"
            variant="outlined"
            sx={{
              mt: 2,
              borderColor: "rgba(255,255,255,0.6)",
              color: "white",
              borderRadius: 2,
              textTransform: "none",
              "&:hover": {
                borderColor: "white",
                background: "rgba(255,255,255,0.12)",
              },
            }}
          >
            Ver mi código de acceso
          </Button>
        </CardContent>
      </Card>

      {/* Access code modal */}
      <Modal
        open={openCode}
        onClose={() => setOpenCode(false)}
        aria-labelledby="access-code-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#1a1a1a",
            color: "white",
            boxShadow: 24,
            borderRadius: 3,
            p: 4,
            width: { xs: "90%", sm: 380 },
            textAlign: "center",
          }}
        >
          {/* Close button */}
          <IconButton
            onClick={() => setOpenCode(false)}
            sx={{ position: "absolute", top: 8, right: 8, color: "gray" }}
          >
            <CloseIcon />
          </IconButton>

          <KeyIcon sx={{ fontSize: 48, color: "#fc0680", mb: 1 }} />

          <Typography
            id="access-code-modal-title"
            variant="h6"
            fontWeight="bold"
            mb={0.5}
          >
            Tu código de acceso
          </Typography>

          <Typography variant="body2" color="gray" mb={3}>
            {user.firstName} {user.lastName}
          </Typography>

          {user.accessCode ? (
            <>
              <Box
                sx={{
                  background: "linear-gradient(135deg, #fc0680 0%, #a90065 100%)",
                  borderRadius: 2,
                  px: 3,
                  py: 2,
                  mb: 2,
                  letterSpacing: "0.35em",
                  fontSize: "1.9rem",
                  fontWeight: "900",
                  fontFamily: "monospace",
                }}
              >
                {user.accessCode}
              </Box>

              <Stack direction="row" justifyContent="center">
                <Button
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopy}
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: copied ? "#4caf50" : "#fc0680",
                    color: copied ? "#4caf50" : "#fc0680",
                    textTransform: "none",
                    borderRadius: 2,
                    "&:hover": {
                      borderColor: copied ? "#4caf50" : "#e0046f",
                      background: "rgba(252,6,128,0.08)",
                    },
                  }}
                >
                  {copied ? "¡Copiado!" : "Copiar código"}
                </Button>
              </Stack>
            </>
          ) : (
            <Typography color="gray" fontSize="0.9rem">
              Código no disponible
            </Typography>
          )}
        </Box>
      </Modal>
    </>
  );
}
