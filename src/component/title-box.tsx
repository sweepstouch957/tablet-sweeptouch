import { Box, Typography } from "@mui/material";

export default function RibbonBanner() {
  return (
    <Box
      sx={{
        py: "2px",
        backgroundColor: "#BF171B",
        color: "#fff",
        clipPath: "polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        zIndex: 1,
      }}
    >
      <Typography
        component="span"
        fontWeight="800"
        fontSize={"0.9rem"}
        sx={{
          position: "relative",
        }}
      >
        PARTICIPATE FOR FREE!
      </Typography>
    </Box>
  );
}
