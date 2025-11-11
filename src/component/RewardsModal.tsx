/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/cashier/RewardsModal.tsx
"use client";
import * as React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Chip, Stack, Typography, Box, IconButton, Tooltip
} from "@mui/material";
import { CheckCircle, Gift, Calendar, DollarSign } from "lucide-react";
import { useCashierRewards, useMarkRewardPaid } from "@/hooks/useCashierRewards";

type Props = {
  open: boolean;
  onClose: () => void;
  cashierId: string;
  storeId: string;
};

export default function RewardsModal({ open, onClose, cashierId, storeId }: Props) {
  const { data: rewards = [], isLoading } = useCashierRewards(cashierId, storeId);
  const { mutateAsync, isPending } = useMarkRewardPaid();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>
        🎁 Premios de Gift Card
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: "#0f0f12" }}>
        {isLoading ? (
          <Typography color="white">Cargando premios…</Typography>
        ) : rewards.length === 0 ? (
          <Typography color="white">Aún no hay premios registrados.</Typography>
        ) : (
          <Stack spacing={1.5}>
            {rewards.map((r:any) => (
              <Box
                key={r._id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "#17171c",
                  border: "1px solid #2a2a32",
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                  <Stack spacing={0.5}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Gift size={18} />
                      <Typography fontWeight={700} color="white">
                        Premio por {r.countAtAchievement.toLocaleString()} nuevos
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ color: "#b7b7c2" }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Calendar size={16} />
                        <Typography variant="body2">
                          logrado: {r.achievedAt ? new Date(r.achievedAt).toLocaleDateString() : "-"}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <DollarSign size={16} />
                        <Typography variant="body2">
                          estado:
                        </Typography>
                        <Chip
                          size="small"
                          label={r.status === "paid" ? "Pagado" : "Pendiente"}
                          color={r.status === "paid" ? "success" : "warning"}
                          sx={{ height: 22 }}
                        />
                      </Stack>
                    </Stack>
                  </Stack>

                  {r.status !== "paid" && (
                    <Tooltip title="Marcar como pagado">
                      <span>
                        <IconButton
                          onClick={async () => await mutateAsync(r._id)}
                          disabled={isPending}
                          color="success"
                        >
                          <CheckCircle />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" sx={{ bgcolor: "#fc0680" }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
