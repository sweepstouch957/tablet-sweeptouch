/* eslint-disable @typescript-eslint/no-explicit-any */
// RightCarousel.tsx
import React from "react";
import Image from "next/image";
import { Box } from "@mui/material";
import { Store } from "@/services/store.service";

interface RightCarouselProps {
  store?: Store;
  images: string[];
  index: number;
  handlers: any;
}

const RightCarousel: React.FC<RightCarouselProps> = ({
  store,
  images,
  index,
  handlers,
}) => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  return (
    <Box
      width={{ xs: "100%", md: "75%" }}
      position="relative"
      minHeight={{ xs: "69vh", md: "100vh" }}
      maxHeight={{ xs: "69vh", md: "100vh" }}
      overflow="hidden"
      {...handlers}
    >
      {images.map((src, i) => (
        <Box
          key={i}
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          sx={{
            opacity: i === index ? 1 : 0,
            visibility: i === index ? "visible" : "hidden",
            transition: "opacity 1s ease-in-out, visibility 1s",
            zIndex: i === index ? 1 : 0,
          }}
        >
          <Image
            src={src}
            alt={`Slide ${i + 1}`}
            fill
            style={{ objectFit: isMobile ? "contain" : "fill" }}
          />
        </Box>
      ))}

      {store?.name && (
        <Box position="absolute" bottom={16} right={16} zIndex={2}>
          <Box
            sx={{
              backgroundColor: "rgba(0,0,0,0.8)",
              color: "white",
              borderRadius: "16px",
              px: 2,
              py: 0.5,
              fontSize: "0.9rem",
              fontWeight: "bold",
              whiteSpace: "nowrap",
            }}
          >
            {store.name}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default RightCarousel;
