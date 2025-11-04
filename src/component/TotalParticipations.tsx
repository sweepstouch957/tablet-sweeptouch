'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material';
import { useAuth } from '@/context/auth-context';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/http/client';
import ProgressBarWithGiftCard from './ProgressBarWithGiftCard';
import CelebrationAnimation from './CelebrationAnimation';

// Meta de participaciones para desbloquear la gift card
const PARTICIPATION_TARGET = 500;

// Función para obtener las participaciones de HOY (Original)
const fetchTodayParticipation = async (userId: string): Promise<number> => {
  const { data } = await api.get(`/sweepstakes/participants/today/${userId}`);
  return data.total || 0;
};

// Función para obtener las participaciones TOTALES (Para la barra de progreso)
const fetchTotalParticipation = async (userId: string): Promise<number> => {
  // NOTA: Se asume que existe un endpoint para obtener el total de participaciones.
  // Idealmente, el endpoint sería algo como: `/sweepstakes/participants/total/${userId}`
  try {
    const { data } = await api.get(`/sweepstakes/participants/total/${userId}`);
    return data.total || 0;
  } catch (error) {
    // Fallback: si el endpoint total no existe, usamos el de hoy y advertimos.
    console.warn(
      'Endpoint /sweepstakes/participants/total/ no encontrado. Usando /sweepstakes/participants/today/ como fallback para el total. El total real puede ser incorrecto.',
      error
    );
    const { data } = await api.get(`/sweepstakes/participants/today/${userId}`);
    return data.total || 0;
  }
};

const TodayParticipationCard = () => {
  const { user } = useAuth();
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasCompletedGoal, setHasCompletedGoal] = useState(false);

  // 1. Obtener las participaciones de HOY (para el texto principal)
  const {
    data: todayCount = 0,
    isLoading: isLoadingToday,
    isFetching: isFetchingToday,
  } = useQuery({
    queryKey: ['participations', 'today', user?._id],
    queryFn: () => fetchTodayParticipation(user!._id),
    enabled: !!user?._id,
    refetchInterval: 15000, // cada 15s
  });

  // 2. Obtener las participaciones TOTALES (para la barra de progreso)
  const { data: totalCount = 0 } = useQuery({
    queryKey: ['participations', 'total', user?._id],
    queryFn: () => fetchTotalParticipation(user!._id),
    enabled: !!user?._id,
    // No necesitamos refetchInterval tan frecuente para el total, pero lo dejamos por consistencia
  });

  // Lógica para mostrar la animación de felicitación (basada en el TOTAL)
  useEffect(() => {
    if (totalCount >= PARTICIPATION_TARGET && !hasCompletedGoal) {
      setShowCelebration(true);
      setHasCompletedGoal(true); // Para que la animación solo se muestre una vez por sesión
    }
  }, [totalCount, hasCompletedGoal]);

  const handleAnimationEnd = () => {
    setShowCelebration(false);
  };

  if (!user) return null;

  return (
    <>
      <Card
        sx={{
          background: 'linear-gradient(to right, #fc0680, #a90065)',
          color: 'white',
          borderRadius: 4,
          boxShadow: 4,
          mt: 2,
          p: 1, // Reducir padding para incluir la barra de progreso
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Participaciones de Hoy
          </Typography>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            {isLoadingToday || isFetchingToday ? (
              <CircularProgress size={28} sx={{ color: 'white' }} />
            ) : (
              <Typography fontSize="2.5rem" fontWeight="bold">
                {todayCount}
              </Typography>
            )}
            <Typography>Participaciones</Typography>
          </Box>

          {/* Integración de la barra de progreso (usa totalCount) */}
          <ProgressBarWithGiftCard
            currentParticipations={totalCount}
            targetParticipations={PARTICIPATION_TARGET}
            onComplete={() => {
              // La lógica de onComplete se maneja en el useEffect superior
            }}
          />
        </CardContent>
      </Card>
      {/* Animación de felicitación */}
      <CelebrationAnimation
        show={showCelebration}
        onAnimationEnd={handleAnimationEnd}
      />
    </>
  );
};

export default TodayParticipationCard;
