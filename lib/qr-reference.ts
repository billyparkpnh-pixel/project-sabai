import sharp from "sharp";
import jsQR from "jsqr";
/** Locate the original QR; copy its source pixels, never redraw its modules. */
export async function extractQrReference(source: Buffer) {
  const image = sharp(source, { limitInputPixels: 20_000_000 }).rotate();
  const normalized = await image.png().toBuffer();
  const { data, info } = await sharp(normalized)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const code = jsQR(new Uint8ClampedArray(data), info.width, info.height, {
    inversionAttempts: "attemptBoth",
  });
  if (!code)
    throw Error(
      "No readable QR found. Upload the original full-resolution poster or a clear QR image.",
    );
  const corners = [
    code.location.topLeftCorner,
    code.location.topRightCorner,
    code.location.bottomLeftCorner,
    code.location.bottomRightCorner,
  ];
  const minX = Math.min(...corners.map((p) => p.x)),
    maxX = Math.max(...corners.map((p) => p.x));
  const minY = Math.min(...corners.map((p) => p.y)),
    maxY = Math.max(...corners.map((p) => p.y));
  const left = Math.max(0, Math.floor(minX)),
    top = Math.max(0, Math.floor(minY));
  const width = Math.min(info.width - left, Math.ceil(maxX) - left),
    height = Math.min(info.height - top, Math.ceil(maxY) - top);
  const quietZone =
    Math.ceil((Math.max(width, height) / (17 + 4 * code.version)) * 4) + 2;
  const crop = await sharp(normalized)
    .extract({ left, top, width, height })
    .extend({
      top: quietZone,
      bottom: quietZone,
      left: quietZone,
      right: quietZone,
      background: "#ffffff",
    })
    .png()
    .toBuffer();
  const decoded = await sharp(crop)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const check = jsQR(
    new Uint8ClampedArray(decoded.data),
    decoded.info.width,
    decoded.info.height,
  );
  if (!check || check.data !== code.data)
    throw Error(
      "QR crop verification failed; original image was left unchanged.",
    );
  const kind = /^000201/.test(code.data)
    ? "EMV-style reference (merchant not verified)"
    : /^https?:\/\//i.test(code.data)
      ? "Web link (not verified as a payment QR)"
      : "Unverified QR content";
  return { crop, kind, width: decoded.info.width, height: decoded.info.height };
}
