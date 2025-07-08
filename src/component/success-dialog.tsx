"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, Box, Typography, Fade } from "@mui/material";
import Image from "next/image";
import ThankYouImage from "@public/ThankYou.webp";
import Logo from "@public/LogoPink.webp";

interface ThankYouModalProps {
  open: boolean;
  onClose: () => void;
}

export const ThankYouModal: React.FC<ThankYouModalProps> = ({
  open,
  onClose,
}) => {
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (open) {
      // 🔊 Reproducir sonido
      // ⏳ Cerrar después de 5 segundos
      timer = setTimeout(() => {
        onClose();
      }, 6000);
    }

    return () => clearTimeout(timer);
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
      <DialogContent sx={{ backgroundColor: "black", p: 0 }}>
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
            src={ThankYouImage}
            alt="Thank you for participating"
            style={{ width: "70%", height: "auto" }}
          />

          <Typography color="white" fontSize="2rem" mt={2} fontWeight={800} lineHeight={1}textTransform={"uppercase"}  >
            Thank you for participating in our sweepstake!
          </Typography>
          <Typography color="white" fontSize="1.5rem" mt={1}  lineHeight={1} textTransform={"uppercase"} >
            Winner Will Be announced soon
          </Typography>


          <Box mt={1    }>
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
