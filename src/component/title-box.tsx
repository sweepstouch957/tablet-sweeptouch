import { Box, Typography } from "@mui/material";

export default function RibbonBanner() {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#BF171B",
        color: "#fff",
        px: { xs: 2, md: 3 },
        py: { xs: "6px", md: "8px" },
        overflow: "visible", // allow tails to render outside
        // Mejorar la forma de cinta con bordes más curvos
        borderRadius: "4px",
        // OUTWARD tails (> <) via pseudo-elements - mejorados para verse más como cinta
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translate(-100%, -50%)",
          borderTop: { xs: "16px solid transparent", md: "20px solid transparent" },
          borderBottom: { xs: "16px solid transparent", md: "20px solid transparent" },
          borderRight: { xs: "16px solid #BF171B", md: "20px solid #BF171B" },
        },
        "&::after": {
          content: '""',
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translate(100%, -50%)",
          borderTop: { xs: "16px solid transparent", md: "20px solid transparent" },
          borderBottom: { xs: "16px solid transparent", md: "20px solid transparent" },
          borderLeft: { xs: "16px solid #BF171B", md: "20px solid #BF171B" },
        },
      }}
    >
      <Typography
        component="span"
        fontWeight={900}
        sx={{
          fontSize: { xs: "0.9rem", md: "1.05rem" },
          letterSpacing: "0.02em",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        PARTICIPATE FOR FREE
      </Typography>
    </Box>
  );
}
