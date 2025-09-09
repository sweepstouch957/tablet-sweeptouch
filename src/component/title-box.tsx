import { Box, Typography } from "@mui/material";

type Props = {
  children?: React.ReactNode;
};

export default function TitleBox({ children = "PARTICIPATE FOR FREE" }: Props) {
  const d = 12; // profundidad del corte (px)

  return (
    <Box
      sx={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
        py: 1,
        bgcolor: "#BF171B",
        color: "#fff",
        borderRadius: "4px",
        whiteSpace: "nowrap",
        lineHeight: 1,

        // CINTA con cortes hacia adentro en ambos lados (polígono cóncavo)
        clipPath: `polygon(
          0 0,
          100% 0,
          100% calc(50% - ${d}px),
          calc(100% - ${d}px) 50%,
          100% calc(50% + ${d}px),
          100% 100%,
          0 100%,
          0 calc(50% + ${d}px),
          ${d}px 50%,
          0 calc(50% - ${d}px)
        )`,

        // por si quedaron estilos viejos en caliente
        "&::before": { content: "none" },
        "&::after": { content: "none" },
      }}
    >
      <Typography
        component="span"
        sx={{
          fontSize: { xs: "0.78rem", md: "0.9rem" },
          fontWeight: 900,
          letterSpacing: "0.02em",
          lineHeight: 1,
        }}
      >
        {children}
      </Typography>
    </Box>
  );
}
