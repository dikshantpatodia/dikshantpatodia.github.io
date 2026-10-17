#!/usr/bin/env node
/**
 * Shared Open Graph card renderer (1200×630 PNG) used for the site's default
 * social preview and for every blog post's preview.
 *
 * Rendered at build time with resvg and system fonts, so it needs no bundled
 * font files and adds nothing to the client bundle.
 */
import { Resvg } from '@resvg/resvg-js'

const W = 1200
const H = 630

const ink = '#17150f'
const soft = '#423e35'
const muted = '#6f695d'
const line = '#e2ddd0'
const paper = '#f6f4ef'
const accent = '#2440e0'

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** Greedy word wrap at a character budget derived from the type size. */
function wrapTitle(text, size) {
  const maxChars = Math.max(12, Math.floor(1002 / (size * 0.5)))
  const words = String(text).split(/\s+/)
  const lines = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > maxChars && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }
  if (current) lines.push(current)
  return lines
}

export function buildOgSvg({ eyebrow, title, meta, subline, url }) {
  const titleLines = wrapTitle(title, 66)
  const size = titleLines.length > 3 ? 48 : titleLines.length > 2 ? 54 : 66
  const lineHeight = Math.round(size * 1.18)
  const firstBaseline = 300 - ((titleLines.length - 1) * lineHeight) / 2

  const barTop = firstBaseline - size * 0.78
  const barHeight = (titleLines.length - 1) * lineHeight + size * 1.02

  const titleSvg = titleLines
    .map(
      (text, index) =>
        `<text x="118" y="${Math.round(firstBaseline + index * lineHeight)}" font-family="Georgia, 'Times New Roman', serif" font-size="${size}" fill="${ink}">${escapeXml(text)}</text>`,
    )
    .join('\n  ')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${paper}"/>
  <text x="80" y="88" font-family="'Courier New', monospace" font-size="19" letter-spacing="4" fill="${accent}">${escapeXml(eyebrow)}</text>
  <line x1="80" y1="112" x2="1120" y2="112" stroke="${line}"/>
  <rect x="80" y="${Math.round(barTop)}" width="6" height="${Math.round(barHeight)}" fill="${accent}"/>
  ${titleSvg}
  <line x1="80" y1="470" x2="1120" y2="470" stroke="${line}"/>
  <text x="80" y="524" font-family="'Courier New', monospace" font-size="21" fill="${soft}">${escapeXml(meta)}</text>
  <text x="80" y="560" font-family="'Courier New', monospace" font-size="21" fill="${muted}">${escapeXml(subline)}</text>
  <text x="1120" y="560" text-anchor="end" font-family="'Courier New', monospace" font-size="21" fill="${accent}">${escapeXml(url)}</text>
</svg>`
}

export function renderOgPng(options) {
  const svg = buildOgSvg(options)
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: W },
    font: { loadSystemFonts: true },
  })
  return resvg.render().asPng()
}

export const OG = { W, H }
