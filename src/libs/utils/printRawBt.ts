interface PrintData {
  storeName: string;
  phone: string;
  couponCode: string;
  logoBase64?: string; // opcional: logo en base64
}

export function printWithRawBT(data: PrintData) {
  if (typeof window === 'undefined') return; // solo en cliente

  const canvas = document.createElement('canvas');
  canvas.width = 576;
  canvas.height = 350;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Fondo blanco
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Texto estilo recibo
  ctx.fillStyle = 'black';
  ctx.font = '16px monospace';
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();

  const lines = [
    '=============================',
    data.storeName.toUpperCase(),
    '=============================',
    `PHONE : ${data.phone}`,
    `COUPON: ${data.couponCode}`,
    `DATE  : ${date}`,
    `TIME  : ${time}`,
    '=============================',
    'THANK YOU FOR PARTICIPATING',
    'PLEASE KEEP THIS RECEIPT',
    '=============================',
  ];

  let y = 30;
  lines.forEach(line => {
    ctx.fillText(line, 20, y);
    y += 24;
  });

  const drawAndOpen = () => {
    const base64 = canvas.toDataURL('image/png');
    const html = `
      <html>
        <head><title>Ticket</title></head>
        <body style="margin:0;padding:0;">
          <img src="${base64}" style="width:100%;" />
        </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
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

export function printTicketWithImage(imageUrl: string, data: {
  storeName: string;
  phone: string;
  couponCode: string;
}) {
  const img = new Image();
  img.crossOrigin = "anonymous"; // Para evitar problemas CORS si la imagen viene de otro dominio
  img.src = imageUrl;

  img.onload = () => {
    // Tamaño del canvas ajustado para el contenido
    const canvas = document.createElement("canvas");
    canvas.width = 576;
    canvas.height = 350;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fondo blanco
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Texto a la izquierda
    ctx.fillStyle = "black";
    ctx.font = "16px monospace";
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    const lines = [
      '=============================',
      data.storeName.toUpperCase(),
      '=============================',
      `PHONE : ${data.phone}`,
      `COUPON: ${data.couponCode}`,
      `DATE  : ${date}`,
      `TIME  : ${time}`,
      '=============================',
      'THANK YOU FOR PARTICIPATING',
      'PLEASE KEEP THIS RECEIPT',
      '============================='
    ];

    let y = 20;
    lines.forEach(line => {
      ctx.fillText(line, 10, y);
      y += 24;
    });

    // Imagen a la derecha
    ctx.drawImage(img, 250, 40, 150, 150);  // puedes ajustar tamaño y posición

    // Convertir canvas a base64
    const base64Image = canvas.toDataURL("image/png");

    // Imprimir con RawBT
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
