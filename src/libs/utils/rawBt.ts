import QRCode from "qrcode";
interface PrintData {
  storeName: string;
  phone: string;
  couponCode: string;
  logoBase64?: string; // opcional: logo en base64
}

export function printWithRawBT(data: PrintData) {
  if (typeof window === "undefined") return; // solo en cliente

  const canvas = document.createElement("canvas");
  canvas.width = 576;
  canvas.height = 350;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Fondo blanco
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Texto estilo recibo
  ctx.fillStyle = "black";
  ctx.font = "16px monospace";
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();

  const lines = [
    "=============================",
    data.storeName.toUpperCase(),
    "=============================",
    `PHONE : ${data.phone}`,
    `COUPON: ${data.couponCode}`,
    `DATE  : ${date}`,
    `TIME  : ${time}`,
    "=============================",
    "THANK YOU FOR PARTICIPATING",
    "PLEASE KEEP THIS RECEIPT",
    "=============================",
  ];

  let y = 30;
  lines.forEach((line) => {
    ctx.fillText(line, 20, y);
    y += 24;
  });

  const drawAndOpen = () => {
    const base64 = canvas.toDataURL("image/png");
    const html = `
      <html>
        <head><title>Ticket</title></head>
        <body style="margin:0;padding:0;">
          <img src="${base64}" style="width:100%;" />
        </body>
      </html>
    `;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  if (data.logoBase64) {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 400, 40, 120, 120); // Logo opcional
      drawAndOpen();
    };
    img.src = data.logoBase64;
  } else {
    drawAndOpen();
  }
}

export function printImageWithRawBT(imageUrl: string) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = imageUrl;

  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    const base64Image = canvas.toDataURL("image/png");

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = `rawbt:${base64Image}`;
    document.body.appendChild(iframe);

    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000);
  };

  img.onerror = () => {
    console.error("Error loading image");
  };
}

/* Ticket editable desde el panel (sorteo.ticketTemplate). Mismo texto que el
   DEFAULT_TICKET_TEMPLATE del panel admin: si se cambia uno, cambiar el otro. */
export const DEFAULT_TICKET_TEMPLATE = [
  "==============================",
  "{store}",
  "==============================",
  "PHONE : {phone}",
  "COUPON: {coupon}",
  "DATE  : {date}",
  "TIME  : {time}",
  "==============================",
  "{sweepstake}",
  "==============================",
  "GOOD LUCK",
].join("\n");

export interface TicketOpts {
  /** Vacío = las líneas de siempre. */
  template?: string;
  /** Copias por registro (algunos eventos piden 2). */
  copies?: number;
}

export function fillTicketTemplate(
  template: string,
  data: { storeName: string; phone: string; couponCode: string; sweepstakeName: string },
  now = new Date()
): string[] {
  const vars: Record<string, string> = {
    store: data.storeName.toUpperCase(),
    phone: data.phone,
    coupon: data.couponCode,
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
    sweepstake: data.sweepstakeName.toUpperCase(),
  };
  return template
    .split(/\r?\n/)
    .map((line) => line.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m));
}

/* RawBT toma un iframe por trabajo; varios en el mismo tick se pisan, así que
   las copias salen espaciadas. */
function sendToRawBT(base64Image: string, copies = 1) {
  const n = Math.min(Math.max(Math.floor(copies) || 1, 1), 5);
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = `rawbt:${base64Image}`;
      document.body.appendChild(iframe);
      setTimeout(() => iframe.remove(), 2000);
    }, i * 2500);
  }
}

export function printTicketWithImage(
  imageUrl: string,
  data: {
    storeName: string;
    phone: string;
    couponCode: string;
    sweepstakeName: string;
  },
  opts: TicketOpts = {}
) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = imageUrl;

  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    const match = data.storeName.match(/^(.*?)(\d.*)$/);
    const store = match?.[1]?.trim() || data.storeName;
    const address = match?.[2]?.trim() || "";

    const lines = opts.template?.trim() ? fillTicketTemplate(opts.template, data, now) : [
      "==============================",
      store.toUpperCase(),
      address,
      "==============================",
      `PHONE : ${data.phone}`,
      `COUPON: ${data.couponCode}`,
      `DATE  : ${date}`,
      `TIME  : ${time}`,
      "==============================",
      data.sweepstakeName.toUpperCase(),
      "==============================",
      "GOOD LUCK",
    ];

    const lineHeight = 28;
    const padding = 20;
    const textBlockHeight = lines.length * lineHeight;

    const imageHeight = 150;
    const imageSpacing = 20;

    // Altura total dinámica: texto + espacio + imagen
    canvas.width = 704;
    canvas.height = padding * 2 + textBlockHeight + imageSpacing + imageHeight;

    // Fondo blanco
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Texto
    ctx.fillStyle = "black";
    ctx.font = "32px monospace";

    let y = padding;
    lines.forEach((line) => {
      ctx.fillText(line, 30, y); // margen a la izquierda
      y += lineHeight;
    });

    // Imagen centrada abajo
    const imageX = (canvas.width - 180) / 2; // imagen de 180px
    ctx.drawImage(img, imageX, y + imageSpacing, 180, imageHeight);

    // Imprimir
    sendToRawBT(canvas.toDataURL("image/png"), opts.copies);
  };

  img.onerror = () => {
    console.error("❌ Error loading image from URL");
  };
}

export async function printTicketWithQRCodeOnly(data: {
  storeName: string;
  phone: string;
  couponCode: string;
  sweepstakeName: string;
  name?: string;
}, opts: TicketOpts = {}) {
  // ponytail: el QR lleva sólo el teléfono por ahora; si el escáner necesita
  // cupón u otro dato, volver a un JSON aquí.
  const qrCanvas = document.createElement("canvas");
  await QRCode.toCanvas(qrCanvas, data.phone, {
    errorCorrectionLevel: "H",
    margin: 1,
    scale: 4,
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();

  // Texto primero (plantilla del panel o el de siempre) y el QR al final.
  const lines = opts.template?.trim()
    ? fillTicketTemplate(opts.template, data, now)
    : [
        data.sweepstakeName.toUpperCase(),
        `CODE: ${data.couponCode}`,
        data.storeName.toUpperCase(),
        `PHONE: ${data.phone}`,
        ...(data.name ? [`NAME: ${data.name}`] : []),
        `DATE: ${date}`,
        `TIME: ${time}`,
        "GOOD LUCK!",
      ];

  const lineHeight = 25;
  const qrSize = 200;
  canvas.width = 576;
  canvas.height = 40 + lines.length * lineHeight + 20 + qrSize + 30;

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "black";
  ctx.font = "20px monospace";
  let y = 40;
  lines.forEach((line) => {
    const textWidth = ctx.measureText(line).width;
    ctx.fillText(line, (canvas.width - textWidth) / 2, y);
    y += lineHeight;
  });

  ctx.drawImage(qrCanvas, (canvas.width - qrSize) / 2, y, qrSize, qrSize);

  sendToRawBT(canvas.toDataURL("image/png"), opts.copies);
}
