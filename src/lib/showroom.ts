/** Compositing do recorte (fundo removido) sobre um fundo padrão de showroom neutro. */

const OUT_W = 1600;
const OUT_H = 1200;

function drawShowroomBackdrop(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Parede neutra com vinheta suave
  const wall = ctx.createLinearGradient(0, 0, 0, h);
  wall.addColorStop(0, "#2b2b2e");
  wall.addColorStop(0.62, "#1f1f22");
  wall.addColorStop(1, "#141416");
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, w, h);

  // Piso polido
  const floorY = h * 0.68;
  const floor = ctx.createLinearGradient(0, floorY, 0, h);
  floor.addColorStop(0, "#3a3a3f");
  floor.addColorStop(1, "#0f0f11");
  ctx.fillStyle = floor;
  ctx.fillRect(0, floorY, w, h - floorY);

  // Spot de luz central
  const spot = ctx.createRadialGradient(w / 2, floorY, 40, w / 2, floorY, w * 0.62);
  spot.addColorStop(0, "rgba(255,255,255,0.16)");
  spot.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = spot;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Recebe o PNG recortado (base64) e devolve um JPEG Blob com fundo de showroom.
 */
export async function compositeShowroom(pngBase64: string): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Não foi possível ler o recorte"));
    el.src = `data:image/png;base64,${pngBase64}`;
  });

  const canvas = document.createElement("canvas");
  canvas.width = OUT_W;
  canvas.height = OUT_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível");

  drawShowroomBackdrop(ctx, OUT_W, OUT_H);

  // Encaixa o carro mantendo proporção, apoiado no piso
  const maxW = OUT_W * 0.86;
  const maxH = OUT_H * 0.66;
  const scale = Math.min(maxW / img.width, maxH / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = (OUT_W - dw) / 2;
  const dy = OUT_H * 0.72 - dh;

  // Sombra de contato
  ctx.save();
  const shadow = ctx.createRadialGradient(OUT_W / 2, dy + dh, 10, OUT_W / 2, dy + dh, dw * 0.55);
  shadow.addColorStop(0, "rgba(0,0,0,0.55)");
  shadow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.ellipse(OUT_W / 2, dy + dh, dw * 0.5, dh * 0.075, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.drawImage(img, dx, dy, dw, dh);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar imagem"))),
      "image/jpeg",
      0.92,
    );
  });
}

/** Lê um File como base64 puro (sem o prefixo data:). */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}
