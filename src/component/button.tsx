import {
  Button,
  Typography,
  Box,
  //useTheme,
  //useMediaQuery,
} from "@mui/material";
//import Image from "next/image";

export default function CallToActionButton({
  onClick,
}: {
  onClick: () => void;
}) {
  //const theme = useTheme();
  //const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        position: "relative",
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
          width: "100%",
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

    </Box>
  );
}
