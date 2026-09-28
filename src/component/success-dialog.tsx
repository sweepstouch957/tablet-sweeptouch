"use client";

import { useEffect, useRef } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Dialog, DialogContent, Fade, IconButton } from "@mui/material";

interface ThankYouModalProps {
  open: boolean;
  onClose: () => void;
  isGeneric?: boolean;
  imageSrc?: string;
}

export const ThankYouModal: React.FC<ThankYouModalProps> = ({
  open,
  onClose,
  imageSrc = "/thank-you-popup.svg",
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
        paper: {
          sx: {
            width: "min(585px, calc(100vw - 32px))",
            m: 2,
            overflow: "visible",
            bgcolor: "transparent",
            boxShadow: "none",
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
            top: 8,
            right: 8,
            color: "white",
            bgcolor: "#f43789",
            "&:hover": { bgcolor: "#e32574" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogContent>
    </Dialog>
  );
};
