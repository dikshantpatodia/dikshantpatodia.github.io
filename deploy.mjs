#!/usr/bin/env node
/**
 * deploy.mjs
 *
 * Builds the Vite site (in site/) and publishes the static output to the
 * repository root so GitHub Pages (serving the master branch at path /) can
 * host it behind the custom domain www.dikshantpatodia.in.
 *
 * The new build overwrites the previous index.html and assets, while legacy
 * files that must keep working are preserved at root:
 *   _old/     (archived /projects and /file-uploader)
 *   CNAME     (www.dikshantpatodia.in)
 *   .nojekyll (required for GitHub Pages to serve _old/*)
 *   .htaccess
 *
 * Superseded build directories from earlier setups are removed first so stale
 * hashed assets never accumulate:  _next/, _not-found/, assets/, blog/.
 * Removing blog/ first also drops the pages and social cards of deleted posts.
 * Root `css/style.css` is NOT removed: it belongs to the archived
 * _old/projects pages, which link to it as ../../css/style.css.
 *
 * Usage:  node deploy.mjs   (run from the repo root)
 *
 * This script only touches the working tree — it does NOT commit or push.
 */

import { execFile } from 'node:child_process'
import { rm } from 'node:fs/promises'

const ROOT = new URL('.', import.meta.url).pathname
const SITE = new URL('./site/', import.meta.url).pathname
const DIST = new URL('./site/dist/', import.meta.url).pathname

function run(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const proc = execFile(cmd, args, { cwd, stdio: 'inherit' })
    proc.on('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} exited ${code}`)),
    )
  })
}

async function main() {
  console.log('>> building the Vite site ...')
  await run('npm', ['run', 'build'], SITE)

  // Remove superseded build output from earlier frameworks/setups.
  for (const dir of ['_next', '_not-found', 'assets', 'blog']) {
    await rm(`${ROOT}${dir}`, { recursive: true, force: true })
  }

  console.log('>> publishing site/dist/* to the repo root ...')
  // `cp -rf dist/. root/` copies the contents of dist/ into root (overwrites).
  await run('cp', ['-rf', `${DIST}.`, ROOT], SITE)

  // Remove any stray dev/build artifacts that must never be served.
  const JUNK = [
    '__next.__PAGE__.txt',
    '__next._full.txt',
    '__next._tree.txt',
    'index.txt',
    '_not-found.html',
    '_not-found.txt',
  ]
  for (const file of JUNK) {
    await rm(`${ROOT}${file}`, { force: true })
  }

  console.log('>> done. The repo root now serves the static Vite build.')
  console.log('   Review it locally, then:  git add -A && git commit && git push')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
