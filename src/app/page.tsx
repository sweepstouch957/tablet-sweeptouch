"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getStoreBySlug } from "@/services/store.service";
import { Suspense } from "react";
import {
  Box,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import FathersDayPromo from "@/component/tablet";
import Tuerca from "@public/tuerca.webp";
import Logo from "@public/logo.webp";
import Image from "next/image";

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
        gap={2}
      >
        <Image
          src={Tuerca}
          alt="Tuerca"
          width={400}
          style={{
            objectFit: "contain",
          }}
          height={398}
        />
        <Typography variant="h3" mb={1}>
          MAINTENANCE
          <br />
          MODE
        </Typography>
        <Stack>
          <Typography mb={-0.8}>Powered by </Typography>
          <Image
            src={Logo.src}
            alt="Sweepstouch logo"
            width={240}
            height={40}
            style={{ objectFit: "contain" }}
          />
        </Stack>
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
