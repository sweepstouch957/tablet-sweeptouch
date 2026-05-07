import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Send, Backspace } from '@mui/icons-material';

type KeypadVariant = 'default' | 'pink' | 'red';

interface PhoneKeypadProps {
  onSubmit: (phone: string) => void;
  onKeypadClick?: () => void;
  variant?: KeypadVariant;
}

const variantThemes: Record<KeypadVariant, {
  bg: string;
  buttonBg: string;
  buttonBorder: string;
  headerColor: string;
  width: string;
  height: string;
}> = {
  default: {
    bg: '#c79b34',
    buttonBg: 'linear-gradient(135deg, #d4a853 0%, #b8932a 100%)',
    buttonBorder: '#a0821f',
    headerColor: 'black',
    width: '210px',
    height: '220px',
  },
  pink: {
    bg: 'linear-gradient(160deg, #c2185b 0%, #e91e8c 60%, #f06292 100%)',
    buttonBg: 'linear-gradient(135deg, #e91e8c 0%, #ad1457 100%)',
    buttonBorder: 'rgba(255,255,255,0.25)',
    headerColor: '#fff',
    width: '240px',
    height: '260px',
  },
  red: {
    bg: 'linear-gradient(160deg, #b71c1c 0%, #e53935 60%, #ef5350 100%)',
    buttonBg: 'linear-gradient(135deg, #e53935 0%, #b71c1c 100%)',
    buttonBorder: 'rgba(255,255,255,0.25)',
    headerColor: '#fff',
    width: '260px',
    height: '280px',
  },
};

const PhoneKeypad: React.FC<PhoneKeypadProps> = ({
  onSubmit,
  onKeypadClick,
  variant = 'default',
}) => {
  const theme = variantThemes[variant];
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
    background: theme.buttonBg,
    color: 'white',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    borderRadius: '6px',
    border: `1px solid ${theme.buttonBorder}`,
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
        background: theme.bg,
        borderRadius: '12px',
        padding: variant === 'default' ? '8px' : '12px',
        width: theme.width,
        height: theme.height,
        textAlign: 'center',
        boxShadow: variant === 'default'
          ? '0 2px 4px rgba(0,0,0,0.3)'
          : '0 8px 32px rgba(0,0,0,0.35)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Typography
        fontWeight="bold"
        color={theme.headerColor}
        fontSize={variant === 'default' ? '0.7rem' : '0.8rem'}
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

      {/* Keypad */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: variant === 'default' ? 'repeat(3, 45px)' : 'repeat(3, 1fr)',
          gridAutoRows: variant === 'default' ? '25px' : 'auto',
          columnGap: variant === 'default' ? '25px' : '8px',
          rowGap: variant === 'default' ? '8px' : '8px',
          justifyContent: 'center',
          margin: '0 auto',
          width: variant === 'default' ? 'max-content' : '100%',
          flex: variant === 'default' ? undefined : 1,
        }}
      >
        {[
          '1', '2', '3',
          '4', '5', '6',
          '7', '8', '9',
          'delete', '0', 'send',
        ].map((key) => (
          <Button
            key={key}
            onClick={() => handleClick(key)}
            disableRipple
            disableFocusRipple
            disableElevation
            sx={{
              ...buttonStyle,
              width: variant === 'default' ? '45px' : '100%',
              height: variant === 'default' ? '30px' : '44px',
              fontSize: variant === 'default' ? '0.8rem' : '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '4px',
              borderRadius: variant === 'default' ? '6px' : '8px',
              boxShadow: variant !== 'default' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
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
