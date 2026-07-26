#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'

const SRC = 'apps/backend/src'
const MODULES_DIR = join(SRC, 'modules')
const RED = '\x1b[1;31m'
const YELLOW = '\x1b[33m'
const CYAN = '\x1b[36m'
const RESET = '\x1b[0m'

const modules = readdirSync(MODULES_DIR).filter((f) => statSync(join(MODULES_DIR, f)).isDirectory())

function findTs(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...findTs(full))
    else if (entry.name.endsWith('.ts')) out.push(full)
  }
  return out
}

function printViolations(label, detail, violations) {
  console.error(`\n${RED}${label}: ${violations.length} violation(s) found.${RESET}`)
  console.error(`${YELLOW}${detail}${RESET}\n`)
  for (const v of violations) {
    console.error(`  ${CYAN}${v.file}${RESET}:${YELLOW}${v.line}${RESET}: ${v.text}`)
  }
}

const importRe = /from\s+['"](\.[^'"]+)['"]/g
let errors = 0

// Files allowed to import directly from modules/ (composition roots)
const ALLOWED_CROSS_MODULE = new Set([
  join(SRC, 'schema.ts'),
  join(SRC, 'container.ts'),
  join(SRC, 'link-modules/modules-definitions.ts'),
])

// --- Check 1: Cross-module imports ---
// Any file importing from modules/X/ must be inside that same module or in the allowed set.
const crossModuleViolations = []

for (const file of findTs(SRC)) {
  if (ALLOWED_CROSS_MODULE.has(file)) continue

  // Determine which module this file belongs to (if any)
  const relToModules = relative(MODULES_DIR, file)
  const ownerModule = !relToModules.startsWith('..') ? relToModules.split('/')[0] : null

  const lines = readFileSync(file, 'utf8').split('\n')
  for (let i = 0; i < lines.length; i++) {
    for (const match of lines[i].matchAll(importRe)) {
      const resolved = resolve(dirname(file), match[1])
      const rel = relative(MODULES_DIR, resolved)
      if (rel.startsWith('..')) continue

      const targetModule = rel.split('/')[0]
      if (!modules.includes(targetModule)) continue

      // Intra-module imports are fine
      if (targetModule === ownerModule) continue

      crossModuleViolations.push({ file, line: i + 1, text: lines[i].trim() })
    }
  }
}

if (crossModuleViolations.length) {
  printViolations(
    'Cross-module import',
    `Only ${[...ALLOWED_CROSS_MODULE].join(' and ')} may import across module boundaries.`,
    crossModuleViolations,
  )
  errors += crossModuleViolations.length
}

// --- Check 2: definitions barrel only imported from within link-modules/ or schema.ts ---
const linkLeaks = []
const LINK_DIR = join(SRC, 'link-modules')
const barrelName = 'definitions/index'

for (const file of findTs(SRC)) {
  if (ALLOWED_CROSS_MODULE.has(file) || file.startsWith(LINK_DIR)) continue

  const lines = readFileSync(file, 'utf8').split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(barrelName)) {
      linkLeaks.push({ file, line: i + 1, text: lines[i].trim() })
    }
  }
}

if (linkLeaks.length) {
  printViolations(
    'Link definitions leak',
    'link-modules/modules-definitions.ts must only be imported from within link-modules/ or schema.ts.',
    linkLeaks,
  )
  errors += linkLeaks.length
}

if (errors) {
  console.error('')
  process.exit(1)
}
