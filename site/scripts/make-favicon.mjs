#!/usr/bin/env node
/**
 * Generates the favicon set from a single source of truth, in the site's
 * editorial identity: near-black ink, warm paper, and one cobalt accent.
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
const ACCENT = '#2440e0'

/**
 * A paper "D" with a cobalt period on an ink tile: the header monogram
 * ("DP" in a bordered square) reduced to what stays legible at 16 pixels.
 */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Dikshant Patodia">
  <rect width="64" height="64" rx="10" fill="${INK}"/>
  <path fill="${PAPER}" fill-rule="evenodd" d="M13 15h7a17 17 0 0 1 0 34h-7z M20 22h3a10 10 0 0 1 0 20h-3z"/>
  <rect x="43" y="41" width="8" height="8" fill="${ACCENT}"/>
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
