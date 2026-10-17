#!/usr/bin/env node
/**
 * Generates the default Open Graph / social preview image (1200×630) for the
 * home page. Blog posts get their own cards generated during prerender.
 *
 * Run from the site/ directory:  node scripts/make-og.mjs
 * Output: public/og.png
 */
import { writeFile } from 'node:fs/promises'
import { renderOgPng } from './og-core.mjs'

const png = renderOgPng({
  eyebrow: 'DIKSHANT PATODIA — LEAD FRONTEND ENGINEER',
  title: 'Good interfaces are engineered, not assembled.',
  meta: '8+ years · micro frontends · 1000+ automated tests',
  subline: 'Architecture · Performance · Design systems · Testing',
  url: 'www.dikshantpatodia.in',
})

await writeFile(new URL('../public/og.png', import.meta.url), png)
console.log(`Wrote public/og.png (${png.length} bytes)`)
