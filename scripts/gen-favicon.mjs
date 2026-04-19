/**
 * Gera public/favicon.ico a partir de um PNG (vários tamanhos num .ico).
 * Uso: node scripts/gen-favicon.mjs <entrada.png> <saida.ico>
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import pngToIco from "png-to-ico";
import sharp from "sharp";

const src = process.argv[2];
const out = process.argv[3];
if (!src || !out) {
  console.error("Uso: node scripts/gen-favicon.mjs <entrada.png> <saida.ico>");
  process.exit(1);
}

const sizes = [16, 32, 48];
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rdc-ico-"));
const paths = [];

try {
  for (const sz of sizes) {
    const p = path.join(tmp, `${sz}.png`);
    await sharp(src)
      .resize(sz, sz, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 1 },
      })
      .png()
      .toFile(p);
    paths.push(p);
  }

  const buf = await pngToIco(paths);
  fs.writeFileSync(out, buf);
  console.log("OK:", out);
} finally {
  for (const p of paths) {
    try {
      fs.unlinkSync(p);
    } catch {
      /* ignore */
    }
  }
  try {
    fs.rmdirSync(tmp);
  } catch {
    /* ignore */
  }
}
