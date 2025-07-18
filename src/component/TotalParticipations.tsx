"use client";

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/http/client";

const fetchTodayParticipation = async (userId: string): Promise<number> => {
  const { data } = await api.get(`/sweepstakes/participants/today/${userId}`);
  return data.total || 0;
};

const TodayParticipationCard = () => {
  const { user } = useAuth();

  const {
    data: count,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["participations", "today", user?._id],
    queryFn: () => fetchTodayParticipation(user!._id),
    enabled: !!user?._id,
    refetchInterval: 15000, // cada 15s
  });

  if (!user) return null;

  return (
    <Card
      sx={{
        background: "linear-gradient(to right, #fc0680, #a90065)",
        color: "white",
        borderRadius: 4,
        boxShadow: 4,
        mt: 2,
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Participaciones de Hoy
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          {isLoading || isFetching ? (
            <CircularProgress size={28} sx={{ color: "white" }} />
          ) : (
            <Typography fontSize="2.5rem" fontWeight="bold">
              {count}
            </Typography>
          )}
          <Typography>Participaciones</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TodayParticipationCard;
