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
        // OUTWARD tails (> <) via pseudo-elements
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translate(-100%, -50%)",
          borderTop: { xs: "14px solid transparent", md: "18px solid transparent" },
          borderBottom: { xs: "14px solid transparent", md: "18px solid transparent" },
          borderRight: { xs: "14px solid #BF171B", md: "18px solid #BF171B" },
        },
        "&::after": {
          content: '""',
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translate(100%, -50%)",
          borderTop: { xs: "14px solid transparent", md: "18px solid transparent" },
          borderBottom: { xs: "14px solid transparent", md: "18px solid transparent" },
          borderLeft: { xs: "14px solid #BF171B", md: "18px solid #BF171B" },
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
