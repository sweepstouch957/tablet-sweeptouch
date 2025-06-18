"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getStoreBySlug } from "@/services/store.service";
import { Suspense } from "react";
import { CircularProgress, Container } from "@mui/material";
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

  console.log("Store data:", store);

  return (
    <>
      {store && <FathersDayPromo store={store} />}
      {isLoading && <CircularProgress />}
    </>
  );
}

export default function WinACarPage() {
  return (
    <>
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
    </>
  );
}
