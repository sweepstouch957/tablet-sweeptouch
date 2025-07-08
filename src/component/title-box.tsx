import { Box, Typography } from "@mui/material";

export default function RibbonBanner() {
  return (
    <Box
      sx={{
        px: 3,
        py: "4px",
        backgroundColor: "#BF171B",
        color: "#fff",
        clipPath: `
          polygon(
            0% 0%,                     /* esquina superior izquierda */
            calc(100% - 12px) 0%,      /* corte antes de la derecha */
            100% 50%,                  /* corte en medio derecha */
            calc(100% - 12px) 100%,    /* corte abajo derecha */
            0% 100%,                   /* esquina inferior izquierda */
            12px 50%                   /* corte en medio izquierda */
          )
        `,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "90%",
        mx: "auto",
        mt: { xs: 1, md: 2 },
        mb: { xs: 1, md: 2 },
        height: "32px",
      }}
    >
      <Typography
        component="span"
        fontWeight="900"
        fontSize={{ xs: "0.8rem", md: "1rem" }}
        sx={{
          whiteSpace: "nowrap",
          lineHeight: 1,
        }}
      >
        PARTICIPATE FOR FREE
      </Typography>
    </Box>
  );
}
