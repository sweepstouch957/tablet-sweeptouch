/* eslint-disable @typescript-eslint/no-explicit-any */
// RightCarousel.tsx

'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useSwipeable } from 'react-swipeable';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Store } from '@/services/store.service';
import LoginDialog from './login-dialog';
import CashierDrawer from './cahierDrawer';

interface RightCarouselProps {
  store?: Store;
  images: string[];
  isLoading?: boolean;
  /** Intervalo de auto-avance cuando NO es video (ms) */
  intervalMs?: number;
}

const RightCarousel: React.FC<RightCarouselProps> = ({
  store,
  images,
  isLoading = false,
  intervalMs = 6000,
}) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Estado interno del carrusel
  const [index, setIndex] = useState(0);
  const [locked, setLocked] = useState(false); // bloquea el auto-avance si hay video reproduciéndose
  const timerRef = useRef<number | null>(null);

  // UI local
  const [openDrawer, setOpenDrawer] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Refs de videos
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const isVideoSrc = (src: string) => /\.mp4(\?.*)?$/i.test(src);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % (images.length || 1));
  };
  const prevSlide = () => {
    setIndex(
      (prev) => (prev - 1 + (images.length || 1)) % (images.length || 1)
    );
  };

  // Swipe handlers (mouse + touch)
  const handlers = useSwipeable({
    onSwipedLeft: nextSlide,
    onSwipedRight: prevSlide,
    trackMouse: true,
  });

  // Si cambian las imágenes, ajusta el índice para evitar out-of-range
  useEffect(() => {
    if (!images?.length) return;
    setIndex((i) => (i >= images.length ? 0 : i));
  }, [images]);

  // 🔒 BLOQUEO TEMPRANO: si el slide actual es video, bloquea ya (antes del paint)
  useLayoutEffect(() => {
    const src = images[index];
    setLocked(!!src && isVideoSrc(src));
  }, [index, images]);

  // Manejo del timer de auto-avance (solo cuando NO hay video y no está locked)
  const clearTimer = () => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    clearTimer();

    const current = images[index];
    const currentIsVideo = !!current && isVideoSrc(current);

    // Si hay video o está locked, NO programes auto-avance
    if (locked || currentIsVideo) return;

    timerRef.current = window.setTimeout(() => {
      nextSlide();
    }, intervalMs);

    return clearTimer;
  }, [index, locked, images, intervalMs]);

  // Pausa y resetea videos no activos; gestiona reproducción del activo
  useEffect(() => {
    // Pausar y resetear no-activos
    videoRefs.current.forEach((vid, i) => {
      if (!vid || i === index) return;
      try {
        vid.pause();
        vid.currentTime = 0;
        vid.controls = false;
      } catch {}
    });

    const src = images[index];
    const isVideo = !!src && isVideoSrc(src);
    const vid = videoRefs.current[index];
    if (!isVideo || !vid) return;

    // Atributos pro-autoplay
    vid.muted = true;
    vid.playsInline = true;

    const onPlaying = () => setLocked(true);
    const onEnded = () => {
      setLocked(false);
      // avanza inmediatamente al terminar el video
      nextSlide();
    };
    const onError = () => {
      // si falla el video, desbloquea y avanza
      setLocked(false);
      nextSlide();
    };
    const onPause = () => {
      // si el usuario pausa, desbloquea para que el carrusel avance normalmente
      setLocked(false);
    };

    vid.addEventListener('playing', onPlaying);
    vid.addEventListener('ended', onEnded);
    vid.addEventListener('error', onError);
    vid.addEventListener('pause', onPause);

    // Intento de reproducción
    const p = vid.play?.();
    if (p && typeof p.then === 'function') {
      p.catch(() => {
        // Autoplay bloqueado → muestra controles y NO bloquees el avance
        vid.controls = true;
        setLocked(false);
      });
    }

    return () => {
      vid.removeEventListener('playing', onPlaying);
      vid.removeEventListener('ended', onEnded);
      vid.removeEventListener('error', onError);
      vid.removeEventListener('pause', onPause);
    };
  }, [index, images]);

  return (
    <Box
      width={{ xs: '100%', md: '78%' }}
      position="relative"
      minHeight={{ xs: '69vh', md: '100vh' }}
      maxHeight={{ xs: '69vh', md: '100vh' }}
      overflow="hidden"
      bgcolor="black"
      {...handlers}
    >
      {isLoading ? (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          height="100%"
          width="100%"
          position="absolute"
          top={0}
          left={0}
          zIndex={10}
          bgcolor="rgba(0,0,0,0.85)"
        >
          <CircularProgress size={60} thickness={4} sx={{ color: '#fc0680' }} />
          <Typography mt={2} fontWeight={600} color="white">
            Cargando Promos...
          </Typography>
        </Box>
      ) : (
        images.map((src, i) => {
          const isActive = i === index;
          const isVideo = isVideoSrc(src);

          return (
            <Box
              key={i}
              position="absolute"
              top={0}
              left={0}
              width="100%"
              height="100%"
              sx={{
                opacity: isActive ? 1 : 0,
                visibility: isActive ? 'visible' : 'hidden',
                transition: 'opacity 1s ease-in-out, visibility 1s',
                zIndex: isActive ? 1 : 0,
                '& video, & img': { width: '100%', height: '100%' },
              }}
            >
              {isVideo ? (
                <video
                  ref={(el: HTMLVideoElement | null) => {
                    videoRefs.current[i] = el;
                  }}
                  src={src}
                  controls={false}
                  muted
                  playsInline
                  preload={isActive ? 'auto' : 'none'}
                  style={{ objectFit: isMobile ? 'contain' : 'fill' }}
                />
              ) : (
                <Image
                  src={src}
                  alt={`Slide ${i + 1}`}
                  fill
                  style={{ objectFit: isMobile ? 'contain' : 'fill' }}
                  priority={isActive}
                />
              )}
            </Box>
          );
        })
      )}

      {store?.name && !isLoading && (
        <Box position="absolute" bottom={16} right={16} zIndex={2}>
          <Box
            onClick={() => setOpenDrawer(true)}
            data-exclude-global-click="true"
            sx={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              color: 'white',
              borderRadius: '16px',
              px: 2,
              py: 0.5,
              fontSize: '0.9rem',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            {store.name}
          </Box>
        </Box>
      )}

      <CashierDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        onOpenLoginDialog={() => setShowLoginDialog(true)}
      />
      <LoginDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      />
    </Box>
  );
};

export default RightCarousel;
