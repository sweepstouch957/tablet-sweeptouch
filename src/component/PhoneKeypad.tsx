import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Send, Backspace } from '@mui/icons-material';

interface PhoneKeypadProps {
  onSubmit: (phone: string) => void;
  onKeypadClick?: () => void;
}

const PhoneKeypad: React.FC<PhoneKeypadProps> = ({
  onSubmit,
  onKeypadClick,
}) => {
  const [phone, setPhone] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  const examplePhone = '2019824102';

  useEffect(() => {
    if (!isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
        animatePhoneNumber();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const animatePhoneNumber = () => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < examplePhone.length) {
        setPhone(() =>
          formatPhoneDisplay(examplePhone.substring(0, currentIndex + 1))
        );
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setPhone('');
          setIsAnimating(false);
        }, 3000);
      }
    }, 300);
  };

  const formatPhoneDisplay = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6)
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6,
      10
    )}`;
  };

  const handleClick = (value: string) => {
    if (value === 'delete') setPhone(phone.slice(0, -1));
    else if (value === 'send') onSubmit(phone);
    else if (phone.length < 15) setPhone(phone + value);
  };

  const handleKeypadClick = () => {
    if (onKeypadClick) onKeypadClick();
  };

  // Estilos comunes de los botones
  const buttonStyle = {
    background: 'linear-gradient(135deg, #d4a853 0%, #b8932a 100%)',
    color: 'white',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    borderRadius: '6px',
    border: '1px solid #a0821f',
    //'&:hover': {
    //  background: 'linear-gradient(135deg, #e0b560 0%, #c49f37 100%)',
    //  transform: 'scale(0.98)',
    //},
    //'&:active': { transform: 'scale(0.95)' },
    minWidth: 0,
    cursor: 'default',
    minHeight: 0,
    flex: 1,
    aspectRatio: '1 / 1', // Hace que sean cuadrados
    boxShadow: 'none',
  };

  return (
    <Box
      onClick={handleKeypadClick}
      sx={{
        backgroundColor: '#c79b34',
        borderRadius: '12px',
        padding: '8px',
        width: '210px',
        height: '220px',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Typography
        fontWeight="bold"
        color="black"
        fontSize="0.7rem"
        sx={{
          marginBottom: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        ENTER YOUR PHONE NUMBER
      </Typography>

      {/* Display Field */}
      <Box
        sx={{
          backgroundColor: 'white',
          borderRadius: '4px',
          padding: '6px',
          marginBottom: '8px',
          fontSize: '0.9rem',
          minHeight: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isAnimating ? '#666' : '#000',
          fontFamily: 'monospace',
          border: '1px solid #ddd',
        }}
      >
        {phone || (isAnimating ? '' : '(201) 982-41')}
      </Box>

      {/* Keypad Grid */}

      {/* Keypad */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 45px)', // cada botón fijo en 55px
          gridAutoRows: '25px', // altura fija
          columnGap: '25px', // espacio entre botones
          rowGap: '8px',
          justifyContent: 'center', // centrado dentro del padre
          margin: '0 auto', // centrar en el box general
          width: 'max-content', // evita que se estiren
        }}
      >
        {[
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          'delete',
          '0',
          'send',
        ].map((key) => (
          <Button
            key={key}
            onClick={() => handleClick(key)}
            disableRipple
            disableFocusRipple
            disableElevation
            sx={{
              ...buttonStyle,
              width: '45px',
              height: '30px', // cuadrado compacto
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column', // icono arriba, texto abajo
              justifyContent: 'center',
              alignItems: 'center',
              padding: '4px',
            }}
          >
            {key === 'delete' ? (
              <>
                <Backspace sx={{ fontSize: '1rem' }} />
                <span style={{ fontSize: '0.55rem' }}>Delete</span>
              </>
            ) : key === 'send' ? (
              <>
                <Send sx={{ fontSize: '1rem' }} />
                <span style={{ fontSize: '0.55rem' }}>Send</span>
              </>
            ) : (
              key
            )}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default PhoneKeypad;
