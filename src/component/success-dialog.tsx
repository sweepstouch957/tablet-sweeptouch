"use client";

import { useEffect, useRef } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Dialog, DialogContent, Fade, IconButton } from "@mui/material";

interface ThankYouModalProps {
  open: boolean;
  onClose: () => void;
  isGeneric?: boolean;
}

export const ThankYouModal: React.FC<ThankYouModalProps> = ({
  open,
  onClose,
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
          src="/thank-you-popup.svg"
          alt="Thank you for participating"
          sx={{ display: "block", width: "100%", height: "auto" }}
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
