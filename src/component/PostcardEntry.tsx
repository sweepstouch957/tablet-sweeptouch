"use client";

// Ruta en papel del postcard: el cliente llega con el flyer impreso, la cajera
// escanea el QR de la tienda y carga acá teléfono, zip y cuánto lleva de cada
// oferta. Se crea la lista (cliente nuevo atribuido al postcard) y se valida en
// el mismo paso: la cajera cobra 1 punto por producto.

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { api } from "@/http/client";
import { validateShoppingList } from "@/services/weeklyAdService";
import { BRAND, MAGENTA, SURFACE, STATE } from "@/libs/brand";

type CatalogItem = {
  _id: string;
  name: string;
  price: string;
  originalPrice?: string;
  savings?: string;
  unit?: string;
  category?: string;
  imageUrl?: string;
};

interface Props {
  storeSlug: string;
  cashierId?: string;
  onNeedsLogin?: () => void;
  onDone: () => void;
  onReset: () => void;
}

export default function PostcardEntry({ storeSlug, cashierId, onNeedsLogin, onDone, onReset }: Props) {
  const [phone, setPhone] = useState("");
  const [zip, setZip] = useState("");
  const [consent, setConsent] = useState(false);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ products: number; cashierPoints: number; isNew: boolean } | null>(null);

  // Los productos impresos en el postcard (panel → pestaña Postcard).
  const { data, isLoading } = useQuery({
    queryKey: ["postcard-products", storeSlug],
    queryFn: async () =>
      (await api.get(`/tracking/shopping-list/postcard/${storeSlug}`)).data as { items: CatalogItem[] },
    staleTime: 60_000,
  });
  const products = data?.items || [];

  // Sólo qué y cuánto: nombre y precio los pone el backend desde el postcard.
  const items = useMemo(
    () => products.filter((p) => qty[p._id] > 0).map((p) => ({ _id: p._id, quantity: qty[p._id] })),
    [products, qty]
  );

  const phone10 = phone.replace(/\D/g, "").slice(-10);
  const ok = phone10.length === 10 && /^\d{5}$/.test(zip) && consent && items.length > 0;

  if (!cashierId) {
    return (
      <Stack alignItems="center" sx={{ py: 6, gap: 2, textAlign: "center" }}>
        <Typography variant="h6" fontWeight={800}>Postcard de la tienda</Typography>
        <Typography color={SURFACE.textMuted}>Inicia sesión como cajera para registrar al cliente y cobrar tus puntos.</Typography>
        <Button variant="contained" disableElevation onClick={onNeedsLogin} sx={{ bgcolor: BRAND.magenta, "&:hover": { bgcolor: MAGENTA[75] }, fontWeight: 800 }}>
          Iniciar sesión
        </Button>
        <Button onClick={onReset}>Volver</Button>
      </Stack>
    );
  }

  if (done) {
    return (
      <Stack alignItems="center" sx={{ py: 6, gap: 1.5, textAlign: "center" }}>
        <CheckCircleRoundedIcon sx={{ fontSize: 64, color: STATE.ok }} />
        <Typography variant="h6" fontWeight={800}>
          {done.isNew ? "Cliente nuevo registrado" : "Compra registrada"}
        </Typography>
        <Typography color={SURFACE.textMuted}>
          {done.products} productos · +{done.cashierPoints} puntos para ti
        </Typography>
        <Typography color={SURFACE.textMuted}>Aplica los precios del flyer en el POS.</Typography>
        <Button variant="contained" disableElevation onClick={onDone} sx={{ mt: 1, bgcolor: BRAND.magenta, "&:hover": { bgcolor: MAGENTA[75] }, fontWeight: 800 }}>
          Listo
        </Button>
      </Stack>
    );
  }

  async function submit() {
    if (!ok || sending) return;
    setSending(true);
    setError("");
    try {
      const { data: created } = await api.post("/tracking/shopping-list/postcard", {
        storeSlug,
        phone: phone10,
        zipCode: zip,
        consent: true,
        items,
        cashierId,
      });
      const v = await validateShoppingList(
        created.qrCode,
        (created.items as { name: string }[]).map((i) => i.name),
        cashierId
      );
      setDone({ products: items.length, cashierPoints: v.cashierPointsAwarded || 0, isNew: !!created.isNewCustomer });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setError(e.response?.data?.error || e.message || "No se pudo registrar");
    } finally {
      setSending(false);
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Postcard: datos del cliente</Typography>
      <Stack direction="row" gap={2}>
        <TextField label="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" fullWidth />
        <TextField label="Zip code" value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))} inputMode="numeric" sx={{ width: 160 }} />
      </Stack>
      <FormControlLabel
        sx={{ mt: 1 }}
        control={<Checkbox checked={consent} onChange={(e) => setConsent(e.target.checked)} />}
        label="El cliente acepta recibir mensajes de texto de la tienda"
      />

      <Typography fontWeight={800} sx={{ mt: 2, mb: 1 }}>¿Cuánto lleva de cada oferta?</Typography>
      {isLoading ? (
        <CircularProgress size={28} />
      ) : products.length === 0 ? (
        <Typography color={SURFACE.textMuted}>Esta tienda todavía no tiene productos cargados en su postcard.</Typography>
      ) : (
        <Stack gap={1} sx={{ maxHeight: 360, overflowY: "auto" }}>
          {products.map((p) => (
            <Stack key={p._id} direction="row" alignItems="center" gap={1.5} sx={{ borderBottom: `1px solid ${SURFACE.line}`, pb: 1 }}>
              {p.imageUrl && <img src={p.imageUrl} alt="" width={44} height={44} style={{ objectFit: "contain" }} />}
              <Box flex={1}>
                <Typography fontWeight={700}>{p.name}</Typography>
                <Typography variant="body2" color={SURFACE.textMuted}>{p.price}</Typography>
              </Box>
              <IconButton onClick={() => setQty((q) => ({ ...q, [p._id]: Math.max(0, (q[p._id] || 0) - 1) }))}>−</IconButton>
              <Typography sx={{ width: 24, textAlign: "center", fontWeight: 800 }}>{qty[p._id] || 0}</Typography>
              <IconButton onClick={() => setQty((q) => ({ ...q, [p._id]: (q[p._id] || 0) + 1 }))}>+</IconButton>
            </Stack>
          ))}
        </Stack>
      )}

      {error && <Typography color={STATE.error} sx={{ mt: 1 }}>{error}</Typography>}
      <Stack direction="row" gap={2} sx={{ mt: 2 }}>
        <Button onClick={onReset}>Cancelar</Button>
        <Button
          variant="contained"
          disableElevation
          disabled={!ok || sending}
          onClick={submit}
          sx={{ flex: 1, bgcolor: BRAND.magenta, "&:hover": { bgcolor: MAGENTA[75] }, fontWeight: 800 }}
        >
          {sending ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : `Registrar (${items.length} productos)`}
        </Button>
      </Stack>
    </Box>
  );
}
