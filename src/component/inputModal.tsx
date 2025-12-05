/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from 'react';
import { validatePhone, formatPhone } from '@/libs/utils/formatPhone';
import { useMutation } from '@tanstack/react-query';
import { createSweepstake } from '@/services/sweepstake.service';
import { ThankYouModal } from './success-dialog';
import {
  printTicketWithImage,
  printTicketWithQRCodeOnly,
} from '@/libs/utils/rawBt';

interface PhoneInputModalProps {
  open: boolean;
  onClose: () => void;
  sweepstakeId: string;
  storeId?: string;
  storeName?: string;
  createdBy?: string;
  method: 'cashier' | 'tablet';
  sweepstakeName: string;
  type?: string;
  hasQR?: boolean;
  onSuccessRegister: () => void;
  userId?: string;
}

const keypad = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'Delete',
  '0',
  'Send',
];

const STORAGE_KEY = 'phoneInputModal_phone';

export const PhoneInputModal: React.FC<PhoneInputModalProps> = ({
  open,
  onClose,
  sweepstakeId,
  storeId = '',
  storeName = '',
  createdBy = '',
  method,
  onSuccessRegister,
  sweepstakeName,
  type = '',
  hasQR,
  userId,
}) => {
  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');

  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [showThanks, setShowThanks] = useState(false);

  // Restaurar el número guardado cuando se abre el modal
  useEffect(() => {
    if (open) {
      if (typeof window !== 'undefined') {
        const savedPhone = localStorage.getItem(STORAGE_KEY);
        if (savedPhone) {
          setPhone(savedPhone);
        } else {
          setPhone('');
        }
      }
      setCustomerName('');
      setError('');
      setAcceptedTerms(true);
    }
  }, [open]);

  // Guardar el número en localStorage cada vez que cambia
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (phone) {
        localStorage.setItem(STORAGE_KEY, phone);
      }
    }
  }, [phone]);

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ customerName }: { customerName: string }) => {
      const resp = await createSweepstake({
        sweepstakeId,
        storeId,
        customerPhone: phone.replace(/\D/g, ''),
        customerName,
        method,
        createdBy: userId ?? createdBy,
      });
      return resp;
    },

    onSuccess: (resp) => {
      setShowThanks(true);

      if (type !== 'generic') {
        if (hasQR) {
          printTicketWithQRCodeOnly({
            storeName: storeName,
            phone: phone.replace(/\D/g, ''),
            couponCode: resp.coupon || 'XXXXXX',
            sweepstakeName,
            name: customerName || '',
          });
        } else {
          printTicketWithImage(
            'https://res.cloudinary.com/dg9gzic4s/image/upload/v1751982268/chiquitoy_ioyhpp.jpg',
            {
              storeName: storeName,
              phone: phone,
              couponCode: resp.coupon || 'XXXXXX',
              sweepstakeName,
            }
          );
        }
      }

      // Si quieres, aquí solo avisamos al padre de que se registró bien
      onSuccessRegister();

      // 👇 OJO: ya NO limpiamos ni cerramos aquí
      // Nada de onClose(), ni setPhone(''), ni setShowThanks(false) aquí
    },


    onError: (error: any) => {
      setError(error || 'An error occurred while registering.');
      setTimeout(() => {
        setError('');
      }, 5000);
    },
  });

  const handleKeyPress = (key: string) => {
    if (key === 'Delete') {
      setPhone(formatPhone(phone.slice(0, -1)));
    } else if (key === 'Send') {
      if (!acceptedTerms) {
        setError('You must accept the terms to participate.');
        return;
      }
      if (validatePhone(phone)) {
        setError('');
        mutateWithName('');
      } else {
        setError('Please enter a valid phone number');
      }
    } else {
      if (phone.replace(/\D/g, '').length < 10)
        setPhone(formatPhone(phone + key));
    }
  };

  const mutateWithName = (name: string) => {
    mutate({
      customerName: name,
    });
  };

  // Manejar el cierre del modal SOLO a través del botón X
  const handleCloseModal = () => {
    // Solo cerramos el modal, sin borrar el número ni el localStorage
    setError('');
    onClose();
  };

  // Prevenir cierre al hacer clic en cualquier parte del modal
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={(event, reason) => {
          console.log(event, '', reason);
        }}
        BackdropProps={{
          onClick: (e) => {
            // Prevenir completamente cualquier cierre al hacer clic en el fondo
            e.preventDefault();
            e.stopPropagation();
          },
          sx: {
            // Asegurar que el backdrop no cierre el modal
            cursor: 'default',
          },
        }}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown={true}
        sx={{
          '& .MuiPaper-root': {
            minHeight: '560px',
            background: 'transparent',
            overflow: 'hidden',
          },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        <Box
          onClick={handleModalClick}
          sx={{
            bgcolor: '#c79b34',
            p: 3,
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <Box
            onClick={handleModalClick}
            sx={{
              bgcolor: '#c79b34',
              borderRadius: '16px',
              boxShadow: 6,
            }}
          >
            <DialogTitle
              onClick={handleModalClick}
              sx={{
                color: 'white',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                pb: 1,
                position: 'relative',
              }}
            >
              ENTER YOUR PHONE NUMBER
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseModal();
                }}
                sx={{
                  position: 'absolute',
                  right: 24,
                  top: 24,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent onClick={handleModalClick}>
              <Stack spacing={2} alignItems="center" onClick={handleModalClick}>
                <TextField
                  value={phone}
                  variant="outlined"
                  onClick={handleModalClick}
                  sx={{
                    input: {
                      textAlign: 'center',
                      fontSize: '1.8rem',
                      color: 'black',
                      backgroundColor: 'white',
                      borderRadius: 2,
                    },
                  }}
                  inputProps={{ maxLength: 14, inputMode: 'numeric' }}
                  fullWidth
                />

                <Box
                  onClick={handleModalClick}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 1.5,
                    width: '100%',
                  }}
                >
                  {keypad.map((key) => (
                    <Button
                      key={key}
                      variant="contained"
                      disabled={key === 'Send' && isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleKeyPress(key);
                      }}
                      sx={{
                        backgroundColor:
                          key === 'Send'
                            ? '#4CAF50'
                            : key === 'Delete'
                              ? '#E53935'
                              : 'linear-gradient(#a46c0f, #d49b34)',
                        background:
                          key === 'Send'
                            ? '#4CAF50'
                            : key === 'Delete'
                              ? '#E53935'
                              : 'linear-gradient(#a46c0f, #d49b34)',
                        color: 'white',
                        fontSize: '1.4rem',
                        width: '100%',
                        height: '65px',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        boxShadow: 3,
                        '&:hover': {
                          backgroundColor:
                            key === 'Send'
                              ? '#45a049'
                              : key === 'Delete'
                                ? '#d32f2f'
                                : undefined,
                          opacity: key === 'Send' || key === 'Delete' ? 1 : 0.9,
                        },
                      }}
                    >
                      {key}
                    </Button>
                  ))}
                </Box>

                {error && (
                  <Typography
                    onClick={handleModalClick}
                    color="white"
                    fontSize="1rem"
                    sx={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                  >
                    {error}
                  </Typography>
                )}
              </Stack>
            </DialogContent>
          </Box>

          <FormControlLabel
            onClick={handleModalClick}
            sx={{
              mt: 1,
            }}
            control={
              <Checkbox
                checked={acceptedTerms}
                onChange={(e) => {
                  e.stopPropagation();
                  setAcceptedTerms(e.target.checked);
                }}
                onClick={(e) => e.stopPropagation()}
                sx={{
                  color: '#fff',
                  '&.Mui-checked': {
                    color: '#fff',
                  },
                }}
              />
            }
            label={
              <Typography
                onClick={handleModalClick}
                color="white"
                fontSize={'0.8rem'}
                sx={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
              >
                By providing your phone number, you are consenting to receive
                messages about sales/coupons/promotors/etc. Text HELP for info.
                Text STOP to opt out. MSG&Data rates may apply.
              </Typography>
            }
          />
        </Box>
      </Dialog>
      <ThankYouModal
        open={showThanks}
        onClose={() => {
          // Cerrar el modal de "Thanks"
          setShowThanks(false);

          // 🔹 Aquí SÍ limpiamos porque hubo éxito
          setPhone('');
          setCustomerName('');
          setError('');

          // Limpiar el localStorage definitivamente
          if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
          }

          // Y cerramos el modal donde se ingresa el número
          onClose();
        }}
        isGeneric={type === 'generic'}
      />

    </>
  );
};
