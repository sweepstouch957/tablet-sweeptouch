'use client';

import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { Box, Typography } from '@mui/material';

interface CelebrationAnimationProps {
  show: boolean;
  onAnimationEnd: () => void;
}

const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({
  show,
  onAnimationEnd,
}) => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (show) {
      // Set width and height for confetti to cover the screen
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);

      // Simulate animation duration (e.g., 5 seconds)
      const timer = setTimeout(() => {
        onAnimationEnd();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, onAnimationEnd]);

  if (!show) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        pointerEvents: 'none', // Allow clicks to pass through
      }}
    >
      <Confetti
        width={width}
        height={height}
        recycle={false} // Run once
        numberOfPieces={500}
        gravity={0.1}
        initialVelocityX={{ min: -5, max: 5 }}
        initialVelocityY={{ min: 10, max: 20 }}
        colors={['#fc0680', '#e0046f', '#ffffff', '#ffeb3b']}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          p: 4,
          borderRadius: 2,
          animation: 'fadeIn 1s ease-out',
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'translate(-50%, -50%) scale(0.8)' },
            '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
          },
        }}
      >
        <Typography variant="h3" fontWeight="bold" sx={{ color: '#fc0680' }}>
          ¡Felicidades!
        </Typography>
        <Typography variant="h5" mt={1}>
          ¡Meta de participaciones completada!
        </Typography>
      </Box>
    </Box>
  );
};

export default CelebrationAnimation;
