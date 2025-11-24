"use client";

import { useEffect, useRef } from "react";

import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Fade,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";
import ThankYouImage from "@public/ThankYou.png";
import WelcomeOur from "@public/WelcomeOur.png";

import Logo from "@public/LogoPink.webp";

interface ThankYouModalProps {
  open: boolean;
  onClose: () => void;
  isGeneric?: boolean; // Optional prop for generic modal
}

export const ThankYouModal: React.FC<ThankYouModalProps> = ({
  open,
  onClose,
  isGeneric = false, // Default to false if not provided
}) => {
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      // reiniciamos el timer cada vez que se abre
      if (autoCloseRef.current) {
        clearTimeout(autoCloseRef.current);
      }
      autoCloseRef.current = setTimeout(() => {
        onClose(); // cierra el modal automáticamente
      }, 3000); // 3 segundos
    }

    // limpieza al desmontar o cuando cambie "open"
    return () => {
      if (autoCloseRef.current) {
        clearTimeout(autoCloseRef.current);
      }
    };
  }, [open, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={500}
    >
      <DialogContent
        sx={{ backgroundColor: "#00000080", p: 0, position: "relative" }}
      >
        {/* Botón cerrar */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1,
            color: "white",
            backgroundColor: "#f43789",
            "&:hover": {
              backgroundColor: "#e32574",
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box
          sx={{
            width: "100%",
            textAlign: "center",
            bgcolor: "black",
            p: 2,
            animation: "fadeIn 0.5s ease-in-out",
          }}
        >
          <Image
            src={!isGeneric ? ThankYouImage : WelcomeOur}
            alt="Thank you for participating"
            style={{ width: "70%", height: "auto" }}
            priority
          />

          {!isGeneric ? (
            <>
              {" "}
              <Typography
                color="white"
                fontSize="2rem"
                mt={2}
                fontWeight={800}
                lineHeight={1}
                textTransform={"uppercase"}
              >
                Thank you for participating in our sweepstake!
              </Typography>
              <Typography
                color="white"
                fontSize="1.5rem"
                mt={1}
                lineHeight={1}
                textTransform={"uppercase"}
              >
                Winner Will Be announced soon
              </Typography>
            </>
          ) : (
            <Typography
              color="white"
              fontSize="2rem"
              mt={2}
              fontWeight={800}
              lineHeight={1}
              textTransform={"uppercase"}
            >
              TO OUR PROMOTIONS
            </Typography>
          )}

          <Box mt={2}>
            <Image
              src={Logo}
              alt="Sweepstouch logo"
              width={250}
              height={70}
              style={{ objectFit: "contain" }}
            />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
