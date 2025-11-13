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

export function printTicketWithImage(
  imageUrl: string,
  data: {
    storeName: string;
    phone: string;
    couponCode: string;
    sweepstakeName: string;
  }
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

    const lines = [
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
    console.error("❌ Error loading image from URL");
  };
}

export async function printTicketWithQRCodeOnly(data: {
  storeName: string;
  phone: string;
  couponCode: string;
  sweepstakeName: string;
  name?: string;
}) {
  const qrData = {
    phone: data.phone,
    coupon: data.couponCode,
  };
  // Generar QR code como canvas
  const qrCanvas = document.createElement("canvas");
  await QRCode.toCanvas(qrCanvas, JSON.stringify(qrData), {
    errorCorrectionLevel: "H",
    margin: 1,
    scale: 4,
  });

  // Crear canvas principal
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();

  canvas.width = 576;
  canvas.height = 600;

  // 🎨 Fondo blanco
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 🎯 Centro de texto
  const centerText = (text: string, y: number, font = "24px monospace") => {
    ctx.font = font;
    const textWidth = ctx.measureText(text).width;
    ctx.fillText(text, (canvas.width - textWidth) / 2, y);
  };

  ctx.fillStyle = "black";
  let y = 40;
  centerText(data.sweepstakeName.toUpperCase(), y, "bold 26px monospace");
  y += 25;
  centerText("Your ticket QR code:", y, "20px monospace");

  // 📦 QR code
  y += 15;
  ctx.drawImage(qrCanvas, (canvas.width - 180) / 2, y, 180, 180);
  y += 200;

  ctx.font = "20px monospace";
  centerText(`CODE: ${data.couponCode}`, y);
  y += 25;
  centerText(data.storeName.toUpperCase(), y);
  y += 25;
  centerText(`PHONE: ${data.phone}`, y);
  y += 25;
  centerText(`NAME: ${data?.name}`, y);
  y += 25;
  centerText(`DATE: ${date}`, y);
  y += 25;
  centerText(`TIME: ${time}`, y);
  y += 25;
  centerText("GOOD LUCK!", y);


  const base64Image = canvas.toDataURL("image/png");

  // Primera impresión
  const iframe1 = document.createElement("iframe");
  iframe1.style.display = "none";
  iframe1.src = `rawbt:${base64Image}`;
  document.body.appendChild(iframe1);

  setTimeout(() => {
    document.body.removeChild(iframe1);

    // Segunda impresión (después de que se quite la primera)
    const iframe2 = document.createElement("iframe");
    iframe2.style.display = "none";
    iframe2.src = `rawbt:${base64Image}`;
    document.body.appendChild(iframe2);

    setTimeout(() => {
      document.body.removeChild(iframe2);
    }, 2000); // tiempo suficiente para que se dispare la impresión
  }, 2000); // tiempo entre una impresión y otra
}
