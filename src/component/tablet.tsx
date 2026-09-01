// FathersDayPromo.tsx
"use client";

import { useState } from "react";
import { Box } from "@mui/material";
import { Store } from "@/services/store.service";

import LeftPanel from "./left-pannel";
import RightCarousel from "./right-pannel";
import PrivacyDialog from "./pannel";
import LoginDialogCashiers from "./login-dialog-cashiers";
import { formatPhone } from "@/libs/utils/formatPhone";
import { useActiveSweepstake } from "@/hooks/useActiveSwepake";
import { usePromos } from "@/hooks/usePromos";
import LeftPanelGeneric from "./left-pannel.generic";
import KioskLayoutPink from "./KioskLayoutPink";
import KioskLayoutRed from "./KioskLayoutRed";
import KioskLayout2026 from "./KioskLayout2026";

/** Tiendas en el piloto del kiosco 2026. */
export const KIOSK_2026_PILOT = new Set(["merchant-r-street-lar-azul-55-barueri-sp"]);

interface FathersDayPromoProps {
  store?: Store;
  variant?: "pink" | "red";
}

//"https://res.cloudinary.com/dg9gzic4s/image/upload/v1763078551/4_euh82t.png",

const imagesDummy = [
  "https://res.cloudinary.com/dg9gzic4s/image/upload/v1763078132/2_oadnkv.png",
  "https://res.cloudinary.com/dg9gzic4s/image/upload/v1763078132/3_dhbtm0.png",
  "https://res.cloudinary.com/dg9gzic4s/image/upload/v1763078131/1_o4rplu.png",
];

const FathersDayPromo: React.FC<FathersDayPromoProps> = ({ store, variant }) => {
  // El consentimiento NO vive acá. Vive en inputModal.tsx, que es donde está la
  // casilla real y el bloqueo del botón Enviar. Antes había acá un estado con
  // default `true` que se pasaba a los paneles y nadie leía; peor: el setter NO
  // se pasaba, y los paneles lo llamaban al registrar, así que cada alta exitosa
  // tiraba un TypeError.
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useActiveSweepstake(store?._id);
  const { data: promosData, isLoading: isLoadingPromos } = usePromos("tablet", store?._id);

  // Normalizamos optinType solo si hay data
  const rawOptin = data?.optinType;
  const normalizedOptin =
    typeof rawOptin === "string" ? rawOptin.trim().toLowerCase() : undefined;

  // Solo será genérico si optinType === "generic" o no hay data en absoluto
  const isGeneric = !data ? true : normalizedOptin === "generic";

  const images =
    promosData && promosData.length > 0
      ? promosData.map((promo) => promo.imageMobile)
      : imagesDummy;

  const prize = data?.prize?.[0] || undefined;

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const formattedValue = formatPhone(value);
    setPhoneNumber(formattedValue);
  };

  const handleGlobalClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const isExcludedArea = target.closest('[data-exclude-global-click="true"]');
    if (!isExcludedArea && modalOpen) {
      setModalOpen(false);
    }
  };

  // Piloto del kiosco 2026: por ahora una sola tienda, para probarlo en sala sin
  // tocar el resto de la flota. Sumar tiendas es agregar un slug; cuando el
  // piloto termine, esto se borra y KioskLayout2026 pasa a ser el default.
  if (store?.slug && KIOSK_2026_PILOT.has(store.slug)) {
    return <KioskLayout2026 store={store} />;
  }

  if (variant === "pink") return <KioskLayoutPink store={store} />;
  if (variant === "red") return <KioskLayoutRed store={store} />;

  return (
    <Box
      display="flex"
      flexDirection={{ xs: "column", md: "row" }}
      minHeight="100vh"
      overflow="hidden"
      onClick={handleGlobalClick}
      sx={{ cursor: "pointer" }}
    >
      {/* Esperamos a que se cargue el sweepstake antes de mostrar el panel */}
      {isLoading ? null : isGeneric ? (
        <LeftPanelGeneric
          store={store}
          setPrivacyOpen={setPrivacyOpen}
          handlePhoneChange={handlePhoneChange}
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          onLogin={() => setLoginOpen(true)}
          prize={prize}
          sweeptakeId={data?._id || ""}
          optinType={data?.optinType}
          sweepstakeName={data?.name}
          imageYear={data?.imageYear || ""}
          hasQR={data?.hasQr || false}
        />
      ) : (
        <LeftPanel
          store={store}
          setPrivacyOpen={setPrivacyOpen}
          handlePhoneChange={handlePhoneChange}
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          onLogin={() => setLoginOpen(true)}
          prize={prize}
          sweeptakeId={data?._id || ""}
          optinType={data?.optinType}
          sweepstakeName={data?.name}
          hasQR={data?.hasQr || false}
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
        />
      )}

      <RightCarousel
        store={store}
        images={images}
        isLoading={isLoadingPromos}
        intervalMs={6000}
      />

      <PrivacyDialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <LoginDialogCashiers
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        storeId={store?._id}
      />
    </Box>
  );
};

export default FathersDayPromo;


