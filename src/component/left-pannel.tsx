import React from 'react';
import Image from 'next/image';
import Logo from '@public/logo.webp';
import { Box, Stack, Typography } from '@mui/material';
import { Store } from '@/services/store.service';
import { useAuth } from '@/context/auth-context';

import BgImage from '@public/BgBlack.webp';
import NewYearImage from '@public/2026.webp';
import VipImage from '@public/VipImage.webp';

import RibbonBanner from './title-box';
import { PhoneInputModal } from './inputModal';
import CallToActionButton from './button';
import PhoneKeypad from './PhoneKeypad';


interface LeftPanelProps {
  store?: Store;
  termsAccepted: boolean;
  setTermsAccepted: (value: boolean) => void;
  setPrivacyOpen: (value: boolean) => void;
  onLogin: () => void;
  handlePhoneChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  prize?: { name: string; image: string };
  sweeptakeId?: string;
  optinType?: string;
  imageYear?: string;
  sweepstakeName?: string;
  hasQR?: boolean;
  modalOpen: boolean;
  setModalOpen: (value: boolean) => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  store,
  setTermsAccepted,
  sweeptakeId = '',
  prize = { name: 'NISSAN VERSA 2025', image: '' },
  optinType,
  sweepstakeName,
  imageYear = NewYearImage.src,
  hasQR,
  modalOpen,
  setModalOpen,
}) => {
  const [brand, ...restParts] = prize.name.split(' ');
  const model = restParts.join(' ');
  const { user } = useAuth();

  return (
    <>
      <Box
        color="white"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="flex-start"
        width={{ xs: '100%', md: '22%' }}
        minHeight={{ xs: '100vh', md: '70vh' }}
        maxHeight="100vh"
        sx={{
          position: 'relative',
          backgroundImage: `url(${BgImage.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          cursor: 'default',
          '@media (orientation: portrait)': {
            width: '100%',
            maxWidth: '100%',
            minHeight: 'auto',
            maxHeight: 'none',
          },
        }}
        pl={{ xs: 1.5, md: 2 }}
        pr={0}
        py={0.75}
        gap={0}
      >
        {/* ===================== HEADER (solo portrait) ===================== */}
        <Box
          sx={{
            display: 'none',
            '@media (orientation: portrait)': {
              display: 'block',
              width: '100%',
              backgroundImage: `url(${BgImage.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            },
          }}
        >
          {/* Cinta centrada */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <RibbonBanner />
          </Box>

          {/* 3 columnas iguales: [IZQ centrado] [CENTRO centrado] [DER] */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              alignItems: 'center',
              gap: 1,
              px: 1.25,
              py: 0.75,
            }}
          >
            {/* === IZQUIERDA: Nissan/Modelo + logo tienda + Contact Us (todo centrado) === */}
            <Box
              sx={{
                justifySelf: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                textAlign: 'center',
              }}
            >
              <Typography
                fontWeight={900}
                sx={{
                  fontSize: 'clamp(0.95rem, 4.2vw, 1.2rem)',
                  lineHeight: 1,
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                }}
              >
                {(brand || '').toUpperCase()}
              </Typography>
              <Typography
                fontWeight={700}
                sx={{
                  fontSize: 'clamp(0.85rem, 3.6vw, 1.05rem)',
                  lineHeight: 1,
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                }}
              >
                {(model || '').toUpperCase()}
              </Typography>

              {store?.image && (
                <Box sx={{ maxWidth: 'clamp(120px, 26vw, 170px)' }}>
                  <Image
                    src={store.image}
                    alt={store?.name || 'Store Logo'}
                    width={260}
                    height={120}
                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                  />
                </Box>
              )}

              {/* Contact Us debajo del logo de tienda */}
              <Typography
                sx={{
                  fontSize: 'clamp(10px, 2.6vw, 12px)',
                  opacity: 0.9,
                  mt: 0.25,
                  whiteSpace: 'nowrap',
                }}
              >
                Contact Us: (201) 982-4102
              </Typography>
            </Box>

            {/* === CENTRO: New Year EXACTAMENTE centrado === */}
            <Box
              sx={{
                justifySelf: 'center',
                maxWidth: 'clamp(140px, 28vw, 220px)',
              }}
            >
              <Image
                src={optinType === 'generic' ? VipImage.src : imageYear}
                alt="New Year"
                width={360}
                height={160}
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </Box>

            {/* === DERECHA: auto reducido, alineado a la derecha === */}
            <Box sx={{ justifySelf: 'end', maxWidth: 'clamp(120px, 22vw, 180px)' }}>
              <Image
                src={prize.image || Logo.src}
                alt="Vehicle"
                width={420}
                height={220}
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </Box>
          </Box>

          {/* CTA centrado bajo el header (solo portrait) */}
          <Box sx={{ display: 'flex', justifyContent: 'center', pb: 0.75 }}>
            <CallToActionButton onClick={() => setModalOpen(true)} />
          </Box>
        </Box>

        {/* ===================== LAYOUT ORIGINAL (landscape) ===================== */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: '1.2fr 1fr' },
            gridTemplateRows: { xs: 'auto auto', md: 'auto auto' },
            alignItems: 'end',
            columnGap: 0,
            rowGap: 0,
            width: '100%',
            '@media (orientation: portrait)': { display: 'none' },
          }}
        >
          {/* Carro grande */}
          <Box
            sx={{
              gridColumn: '1 / span 2',
              justifySelf: 'stretch',
              alignSelf: 'start',
              mr: { xs: -1.5, md: -2 },
            }}
          >
            <Image
              src={prize.image || Logo.src}
              alt="Prize Image"
              width={900}
              height={500}
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                objectPosition: 'right center',
                transform: 'scale(0.94)',
                transformOrigin: 'right center',
                display: 'block',
              }}
            />
          </Box>

          {/* NISSAN / VERSA 2025 */}
          <Box sx={{ gridColumn: '1 / span 1', alignSelf: 'start' }}>
            <Typography
              fontWeight={900}
              sx={{
                fontSize: {
                  xs: 'clamp(1.0rem, 6.2vw, 1.6rem)',
                  md: 'clamp(1.2rem, 3.2vw, 2.2rem)',
                },
                lineHeight: 0.95,
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              {(brand || '').toUpperCase()}
            </Typography>
            <Typography
              fontWeight={700}
              sx={{
                fontSize: {
                  xs: 'clamp(0.9rem, 5vw, 1.3rem)',
                  md: 'clamp(1.0rem, 2.6vw, 1.6rem)',
                },
                lineHeight: 0.95,
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              {(model || '').toUpperCase()}
            </Typography>
          </Box>

          {/* 2026 NEW YEAR */}
          <Box
            sx={{
              gridColumn: { xs: '2 / span 1', md: '2 / span 1' },
              justifySelf: 'end',
              alignSelf: 'end',
              maxWidth: { xs: 150, md: 210 },
              mt: { xs: -0.5, md: -1 },
            }}
          >
            <Image
              src={optinType === 'generic' ? VipImage.src : imageYear}
              alt="New Year Image"
              width={400}
              height={200}
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                transform: 'scale(0.94)',
              }}
            />
          </Box>
        </Box>

        {/* CTA (landscape) → igual que siempre */}
        <Box
          my={0.5}
          sx={{
            display: 'block',
            '@media (orientation: portrait)': { display: 'none' }, // en portrait el CTA está bajo el header
          }}
        >
          <CallToActionButton onClick={() => setModalOpen(true)} />
        </Box>

        {/* =============== BOTONERA FIJA, CENTRADA (solo portrait) =============== */}
        <Box
          sx={{
            // Horizontal: se muestra normal (posición estática en su lugar)
            position: 'static',
            display: 'block',

            // Portrait: ocultar completamente
            '@media (orientation: portrait)': {
              display: 'none',
            },
          }}
        >
          <PhoneKeypad
            onSubmit={(phone) => console.log('Número ingresado:', phone)}
            onKeypadClick={() => setModalOpen(true)}
          />
        </Box>

        {/* Footer: OCULTO en portrait para evitar duplicado de logo/Contact Us */}
        <Stack
          alignItems="center"
          spacing={0.3}
          mt="auto"
          pb={1}
          sx={{
            '@media (orientation: portrait)': {
              display: 'none',
            },
          }}
        >
          {store?.image && (
            <Image
              src={store.image}
              alt="Store Logo"
              width={110}
              height={60}
              style={{ objectFit: 'contain' }}
            />
          )}
          <Typography fontSize="0.7rem" textAlign="center" color="white">
            Contact Us: (201) 982-4102
          </Typography>
        </Stack>
      </Box>

      {/* Modal */}
      <PhoneInputModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        sweepstakeId={sweeptakeId}
        storeId={store?.id}
        storeName={store?.name}
        type={optinType}
        createdBy={user?._id || store?.id}
        sweepstakeName={sweepstakeName || ''}
        method={user ? 'cashier' : 'tablet'}
        onSuccessRegister={() => setTermsAccepted(true)}
        hasQR={hasQR}
      />
    </>
  );
};

export default LeftPanel;