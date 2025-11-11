// src/components/cashier/TotalParticipations.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Stack,
  Chip,
  Button,
} from "@mui/material";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/http/client";
import { useCashierRewardProgress } from "@/hooks/useCashierRewards";
import RewardsModal from "./RewardsModal";
import ProgressBarWithGiftCard from "./ProgressBarWithGiftCard";
import CelebrationAnimation from "./CelebrationAnimation";

const PARTICIPATION_TARGET = 500;

const fetchTodayParticipation = async (userId: string) => {
  const { data } = await api.get(`/sweepstakes/participants/today/${userId}`);
  return data.total || 0;
};

type Props = { storeId?: string };

export default function TodayParticipationCard({ storeId }: Props) {
  const { user } = useAuth();
  const [showCelebration, setShowCelebration] = useState(false);
  const [openRewards, setOpenRewards] = useState(false);

  // trackear premios previos para detectar “nuevo premio”
  const prevEarnedRef = useRef<number>(0);

  const { data: todayCount = 0, isLoading: loadingToday } = useQuery({
    queryKey: ["participations", "today", user?._id],
    queryFn: () => fetchTodayParticipation(user!._id),
    enabled: !!user?._id,
    refetchInterval: 15000,
  });

  // progreso real desde la línea base (service /rewards)
  const { data: progress } = useCashierRewardProgress(user?._id, storeId);

  // Celebración: cuando el porcentaje se resetea (0%) y subieron los earnedRewards
  useEffect(() => {
    if (!progress) return;
    const { percent = 0, earnedRewards = 0 } = progress;

    const prevEarned = prevEarnedRef.current;
    const earnedIncreased = earnedRewards > prevEarned;

    if (percent === 0 && earnedIncreased) {
      setShowCelebration(true);
      const t = setTimeout(() => setShowCelebration(false), 3500);
      return () => clearTimeout(t);
    }

    // actualizar referencia para siguiente comparación
    prevEarnedRef.current = earnedRewards;
  }, [progress]);

  if (!user) return null;

  const current = progress?.current ?? 0;
  const percent = progress?.percent ?? 0;
  const earned = progress?.earnedRewards ?? 0;

  return (
    <>
      <Card
        sx={{
          background: "linear-gradient(135deg, #fc0680, #a90065 60%)",
          color: "white",
          borderRadius: 4,
          boxShadow: 6,
          mt: 2,
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="body1" fontWeight={800}>
              Participaciones de Hoy
            </Typography>
            <Chip
              size="small"
              label="Gift Card"
              sx={{ bgcolor: "#2a1522", color: "white" }}
            />
          </Stack>

          <Box display="flex" alignItems="center" gap={2}>
            {loadingToday ? (
              <CircularProgress size={28} sx={{ color: "white" }} />
            ) : (
              <Typography fontSize="2.6rem" fontWeight="900">
                {todayCount}
              </Typography>
            )}
            <Typography>Participaciones</Typography>
          </Box>

          <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
            Progreso hacia Gift Card
          </Typography>

          <ProgressBarWithGiftCard
            currentParticipations={current}
            targetParticipations={PARTICIPATION_TARGET}
            // <- ya soporta override explícito del porcentaje
            percentOverride={percent}
            onComplete={() => {}}
          />

          <Stack direction="row" spacing={2} mt={1.5} sx={{ opacity: 0.9 }}>
            <Typography variant="caption">
              {current} / 500 · {percent}%
            </Typography>
          </Stack>

          {/* Resumen compacto + acceso a modal de premios */}
          <Stack direction="row" spacing={1.5} mt={2}>
            <Chip
              label={`Ganados: ${earned}`}
              sx={{ bgcolor: "#1b0f18", color: "white" }}
            />
            <Button
              onClick={() => setOpenRewards(true)}
              size="small"
              variant="outlined"
              sx={{
                borderColor: "#ff7db8",
                color: "#ff7db8",
                "&:hover": {
                  borderColor: "#ff97c6",
                  background: "rgba(255,125,184,.08)",
                },
              }}
            >
              Ver premios
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <CelebrationAnimation
        show={showCelebration}
        onAnimationEnd={() => setShowCelebration(false)}
      />

      {user?._id && storeId && (
        <RewardsModal
          open={openRewards}
          onClose={() => setOpenRewards(false)}
          cashierId={user._id}
          storeId={storeId}
        />
      )}
    </>
  );
}
