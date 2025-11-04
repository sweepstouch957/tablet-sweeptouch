'use client';

import React, { useEffect, useState } from 'react';
import { Box, LinearProgress, Typography, Stack } from '@mui/material';
import Image from 'next/image';

interface ProgressBarWithGiftCardProps {
  currentParticipations: number;
  targetParticipations: number;
  onComplete: () => void;
}

const ProgressBarWithGiftCard: React.FC<ProgressBarWithGiftCardProps> = ({
  currentParticipations,
  targetParticipations,
  onComplete,
}) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Calcular el porcentaje de progreso
  const percentage = Math.min(
    100,
    (currentParticipations / targetParticipations) * 100,
  );

  useEffect(() => {
    // Animación de la barra de progreso
    const animationDuration = 1000; // 1 segundo
    const start = progress;
    const end = percentage;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(1, elapsed / animationDuration); // t va de 0 a 1
      const animatedProgress = start + (end - start) * t;
      setProgress(animatedProgress);

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        // Cuando la animación termina y el progreso es 100%
        if (percentage >= 100 && !isComplete) {
          setIsComplete(true);
          setShowPopup(true); // Mostrar el pop-up de la gift card
          onComplete();
        }
      }
    };

    requestAnimationFrame(animate);
  }, [currentParticipations, targetParticipations, percentage, isComplete, onComplete]);

  // Ocultar el pop-up después de un tiempo
  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 3000); // Mostrar por 3 segundos
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  return (
    <>
      <Stack spacing={1} sx={{ width: '100%', p: 2, backgroundColor: '#222', borderRadius: 2 }}>
        <Typography variant="body2" color="white" fontWeight="bold">
          Meta de Participaciones: {currentParticipations} / {targetParticipations}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: '100%' }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 15,
                borderRadius: 5,
                backgroundColor: '#444',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#fc0680', // Color de la barra de progreso
                  transition: 'transform 1s ease-out', // Animación CSS para la barra
                },
              }}
            />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="white">{`${Math.round(
              percentage,
            )}%`}</Typography>
          </Box>
        </Box>

        {/* Gift Card estática dentro del componente */}
        <Box
          sx={{
            position: 'relative',
            width: 100,
            height: 60,
            margin: '10px auto',
            opacity: isComplete ? 1 : 0.5,
            transform: isComplete ? 'scale(1.2) rotate(5deg)' : 'scale(1)',
            transition: 'all 0.5s ease-in-out',
            cursor: 'pointer',
          }}
        >
          <Image
            src="/gift-card.png" // La imagen debe estar en la carpeta public
            alt="Gift Card"
            layout="fill"
            objectFit="contain"
          />
        </Box>
        {isComplete && (
          <Typography textAlign="center" color="#fc0680" fontWeight="bold">
            ¡Recompensa Desbloqueada!
          </Typography>
        )}
      </Stack>

      {/* Animación de la Gift Card en el centro de la pantalla (Pop-up) */}
      {showPopup && (
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(0)',
            zIndex: 10000,
            animation: 'giftCardJump 0.5s ease-out forwards',
            '@keyframes giftCardJump': {
              '0%': { transform: 'translate(-50%, -50%) scale(0)' },
              '50%': { transform: 'translate(-50%, -50%) scale(1.5)' },
              '100%': { transform: 'translate(-50%, -50%) scale(1)' },
            },
          }}
        >
          <Box
            sx={{
              width: 200,
              height: 120,
              position: 'relative',
              boxShadow: '0 0 20px rgba(252, 6, 128, 0.8)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Image
              src="/gift-card.png"
              alt="Gift Card Pop-up"
              layout="fill"
              objectFit="cover"
            />
          </Box>
          <Typography
            variant="h6"
            textAlign="center"
            mt={1}
            sx={{ color: '#fc0680', fontWeight: 'bold', textShadow: '1px 1px 2px #000' }}
          >
            ¡500 Participaciones!
          </Typography>
        </Box>
      )}
    </>
  );
};

export default ProgressBarWithGiftCard;
