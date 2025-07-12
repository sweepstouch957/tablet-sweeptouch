"use client";

import { Box, Button, Stack, Typography } from "@mui/material";
import OopsSVG from "./OpSvg";

const NoInternet = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="#ff0099"
      color="white"
      height="100vh"
      textAlign="center"
      px={2}
      gap={"16px"}
    >
      <Stack direction={"row"} gap={2} mt={2}>
        <Typography variant="h2" fontWeight="bold">
          Oops...
        </Typography>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            {" "}
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M3.96973 5.03039L18.9697 20.0304L20.0304 18.9697L5.03039 3.96973L3.96973 5.03039ZM2.92454 9.67478C3.71079 8.88852 4.57369 8.2256 5.48917 7.68602L6.58987 8.78672C5.86769 9.17925 5.17917 9.65606 4.53875 10.2172L11.9999 17.5283L13.6826 15.8795L14.7433 16.9402L11.9999 19.6284L2.38879 10.2105L2.92454 9.67478ZM19.4611 10.2172L15.8255 13.7797L16.8862 14.8404L21.611 10.2105L21.0753 9.67478C17.6588 6.25827 12.7953 5.17059 8.45752 6.41173L9.69662 7.65083C13.0757 6.95288 16.7117 7.80832 19.4611 10.2172Z"
              fill="#080341"
            ></path>{" "}
          </g>
        </svg>
      </Stack>

      <Box position="relative" maxWidth="650px" mt={3}>
        <OopsSVG
          style={{
            width: "100%",
            height: "auto",
          }}
        />
      </Box>
      <Typography variant="h4" fontWeight="bold">
        ¡Oops! Sin Conexión
      </Typography>
      <Typography variant="body2">
        Parece que perdiste el acesso a internet
      </Typography>

      <Button
        onClick={() => window.location.reload()}
        sx={{
          backgroundColor: "white",
          color: "#ff0080", // Rosado
          "&:hover": {
            backgroundColor: "#fce4ec", // Ligero rosado al hover
          },
          fontWeight: "bold",
        }}
      >
        Reload
      </Button>
    </Box>
  );
};

export default NoInternet;
