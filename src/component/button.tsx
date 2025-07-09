import {
  Button,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Image from "next/image";
import TapIcon from "@public/Click.webp"; // Asegurate que esta ruta esté bien

export default function CallToActionButton({
  onClick,
}: {
  onClick: () => void;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        position: "relative",
        mb:{xs:0,md:2}
      }}
    >
      <Button
        variant="contained"
        onClick={onClick}
        sx={{
          bgcolor: "#BF171B",
          color: "#ffffff",
          borderRadius: "32px",
          px: 2,
          py: 1.5,
          width:"100%",
          textTransform: "uppercase",
          position: "relative",
          zIndex: 1,
          "&:hover": {
            bgcolor: "#bf171a",
          },
        }}
      >
        <Typography fontSize="1rem" fontWeight="bold">
          Participate and Win!
        </Typography>
      </Button>

      <Box
        sx={{
          animation: isMobile
            ? "shakeX 2s ease-in-out infinite"
            : "shakeY 1.5s ease-in-out infinite",
            position:"absolute",
            zIndex:1,
            right:1,
            top:1
        }}
      >
        <Image
          src={TapIcon}
          alt="Click icon"
          width={30}
          height={30}
          style={{ objectFit: "contain" }}
        />
      </Box>

      <style jsx global>{`
        @keyframes shakeX {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(60px);
          }
        }

        @keyframes shakeY {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(140px);
          }
        }
      `}</style>
    </Box>
  );
}
