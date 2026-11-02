import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { extractQrReference } from "../lib/qr-reference";
test("poster crop keeps source QR pixels and identical decoded content", async () => {
  const value = "https://example.com/test-only-no-payment";
  const qr = await QRCode.toBuffer(value, { width: 240, margin: 4 });
  const poster = await sharp({
    create: { width: 940, height: 790, channels: 3, background: "#f7f5ef" },
  })
    .composite([{ input: qr, left: 630, top: 430 }])
    .png()
    .toBuffer();
  const original = Buffer.from(poster);
  const result = await extractQrReference(poster);
  assert.deepEqual(poster, original);
  assert.match(result.kind, /Web link/);
  assert.ok(result.width < 350 && result.height < 350);
  const { data, info } = await sharp(result.crop)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  assert.equal(
    jsQR(new Uint8ClampedArray(data), info.width, info.height)?.data,
    value,
  );
  // Extraction is not a regenerated QR: only original RGB colors plus white padding remain.
  const pixels = await sharp(poster).removeAlpha().raw().toBuffer();
  const sourceColors = new Set<string>();
  for (let i = 0; i < pixels.length; i += 3)
    sourceColors.add(pixels.subarray(i, i + 3).toString("hex"));
  sourceColors.add("ffffff");
  for (let i = 0; i < data.length; i += 4)
    assert.ok(sourceColors.has(data.subarray(i, i + 3).toString("hex")));
});
test("rejects a poster with no readable QR instead of creating a substitute", async () => {
  const blank = await sharp({
    create: { width: 500, height: 500, channels: 3, background: "#fff" },
  })
    .png()
    .toBuffer();
  await assert.rejects(() => extractQrReference(blank), /No readable QR/);
});
