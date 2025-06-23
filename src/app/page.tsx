"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getStoreBySlug } from "@/services/store.service";
import { Suspense } from "react";
import { Box, CircularProgress, Container, Typography } from "@mui/material";
import FathersDayPromo from "@/component/tablet";

function WinACarFormContainer() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") || "";

  const { data: store, isLoading } = useQuery({
    queryKey: ["store", slug],
    queryFn: () => getStoreBySlug(slug),
    enabled: !!slug,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (!store) {
    return (
      <Box
        bgcolor={"#f43789"}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        color="#fff"
        textAlign={"center"}
      >
        <Typography variant="h1">MODO Mantenimiento</Typography>
      </Box>
    );
  }

  return <FathersDayPromo store={store} />;
}

export default function WinACarPage() {
  return (
    <Suspense
      fallback={
        <Container
          maxWidth="sm"
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Container>
      }
    >
      <WinACarFormContainer />
    </Suspense>
  );
}
