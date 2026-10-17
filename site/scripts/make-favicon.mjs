#!/usr/bin/env node
/**
 * Generates the favicon set from a single source of truth, in the site's
 * editorial identity: near-black ink and warm paper, with no accent — the mark
 * is the monogram alone, so it reads at tab size.
 *
 * Run from the site/ directory:  node scripts/make-favicon.mjs
 * Outputs:
 *   public/favicon.svg          (vector, modern browsers)
 *   public/favicon.ico          (16/32/48, legacy fallback)
 *   public/apple-touch-icon.png (180×180, iOS home screen)
 *
 * The mark is drawn as paths rather than text so it never depends on a font
 * being installed — it renders identically everywhere.
 */
import { writeFile } from 'node:fs/promises'
import { Resvg } from '@resvg/resvg-js'

const INK = '#17150f'
const PAPER = '#f6f4ef'

/**
 * "DP" in paper on an ink tile — the header monogram, drawn as filled paths so
 * the letterforms never depend on an installed font.
 *
 * Alignment is exact rather than eyeballed, which is why these are filled
 * outlines and not stroked centre-lines (a stroked endpoint stops at its cap,
 * so the "P" stem ended 3px above the "D" and the pair looked disoriented):
 *
 *   cap line   y = 18   both letters
 *   baseline   y = 46   both letters
 *   stroke      6px     uniform on every stem and bar of both letters
 *   letter gap    8px   D ends x=30, P starts x=38
 *   bounding box  x 10..54, y 18..46 — exactly centred on (32, 32)
 *
 * The counters are half-discs concentric with their bowls, so the bowl stroke
 * stays 6px all the way round instead of thinning at the curves.
 */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Dikshant Patodia">
  <rect width="64" height="64" rx="10" fill="${INK}"/>
  <g fill="${PAPER}" fill-rule="evenodd">
    <path d="M10 18H16a14 14 0 0 1 0 28H10Z M16 24a8 8 0 0 1 0 16Z"/>
    <path d="M38 18H44a10 10 0 0 1 0 20V46H38Z M44 24a4 4 0 0 1 0 8Z"/>
  </g>
</svg>
`

/** Minimal ICO container holding PNG payloads (supported by every modern browser). */
function buildIco(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(images.length, 4)

  const directory = Buffer.alloc(16 * images.length)
  let offset = header.length + directory.length

  images.forEach((image, index) => {
    const entry = index * 16
    directory.writeUInt8(image.size >= 256 ? 0 : image.size, entry)
    directory.writeUInt8(image.size >= 256 ? 0 : image.size, entry + 1)
    directory.writeUInt8(0, entry + 2) // colour palette
    directory.writeUInt8(0, entry + 3) // reserved
    directory.writeUInt16LE(1, entry + 4) // colour planes
    directory.writeUInt16LE(32, entry + 6) // bits per pixel
    directory.writeUInt32LE(image.png.length, entry + 8)
    directory.writeUInt32LE(offset, entry + 12)
    offset += image.png.length
  })

  return Buffer.concat([header, directory, ...images.map((image) => image.png)])
}

function render(size) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    font: { loadSystemFonts: false },
  })
  return resvg.render().asPng()
}

const root = new URL('../public/', import.meta.url)
const sizes = [16, 32, 48]

await writeFile(new URL('favicon.svg', root), svg)
await writeFile(new URL('apple-touch-icon.png', root), render(180))

const images = sizes.map((size) => ({ size, png: render(size) }))
await writeFile(new URL('favicon.ico', root), buildIco(images))

console.log(
  `Wrote favicon.svg, favicon.ico (${sizes.join('/')}), apple-touch-icon.png (180)`,
)
