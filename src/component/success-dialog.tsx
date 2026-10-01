"use client";

import { useEffect, useRef } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Dialog, DialogContent, Fade, IconButton } from "@mui/material";

interface ThankYouModalProps {
  open: boolean;
  onClose: () => void;
  isGeneric?: boolean;
  imageSrc?: string;
  pinkCard?: boolean;
}

export const ThankYouModal: React.FC<ThankYouModalProps> = ({
  open,
  onClose,
  imageSrc = "/thank-you-popup.svg",
  pinkCard = false,
}) => {
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (open) {
      if (autoCloseRef.current) {
        clearTimeout(autoCloseRef.current);
      }

      autoCloseRef.current = setTimeout(() => {
        onCloseRef.current();
      }, 3000);
    }

    return () => {
      if (autoCloseRef.current) {
        clearTimeout(autoCloseRef.current);
      }
    };
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={500}
      slotProps={{
        backdrop: { sx: pinkCard ? { bgcolor: "rgba(0,0,0,.65)", backdropFilter: "blur(6px)" } : {} },
        paper: {
          sx: {
            width: pinkCard ? "min(900px, calc(100vw - 48px), calc((100dvh - 48px) * 1.5))" : "min(585px, calc(100vw - 32px))",
            m: 2,
            overflow: pinkCard ? "hidden" : "visible",
            borderRadius: pinkCard ? "32px" : undefined,
            bgcolor: pinkCard ? "#ff087b" : "transparent",
            boxShadow: pinkCard ? "0 24px 80px rgba(0,0,0,.4)" : "none",
          },
        },
      }}
    >
      <DialogContent sx={{ p: 0, position: "relative", overflow: "visible" }}>
        <Box
          component="img"
          src={imageSrc}
          alt="Thank you for participating"
          sx={{ display: "block", width: "100%", height: "auto", maxHeight: "calc(100dvh - 64px)", objectFit: "contain" }}
        />

        <IconButton
          onClick={onClose}
          aria-label="Close"
          sx={{
            position: "absolute",
            top: pinkCard ? 16 : 8,
            right: pinkCard ? 16 : 8,
            width: pinkCard ? 48 : undefined,
            height: pinkCard ? 48 : undefined,
            color: pinkCard ? "#ed087b" : "white",
            bgcolor: pinkCard ? "white" : "#f43789",
            "&:hover": { bgcolor: pinkCard ? "#ffe5f1" : "#e32574" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogContent>
    </Dialog>
  );
};
