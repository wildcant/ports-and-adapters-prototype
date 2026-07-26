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

// --- Check 1: No cross-module imports within src/modules/ ---
const crossModuleViolations = []

for (const mod of modules) {
  for (const file of findTs(join(MODULES_DIR, mod))) {
    const lines = readFileSync(file, 'utf8').split('\n')
    for (let i = 0; i < lines.length; i++) {
      for (const match of lines[i].matchAll(importRe)) {
        const resolved = resolve(dirname(file), match[1])
        const rel = relative(MODULES_DIR, resolved)
        if (rel.startsWith('..')) continue

        const target = rel.split('/')[0]
        if (target !== mod && modules.includes(target)) {
          crossModuleViolations.push({ file, line: i + 1, text: lines[i].trim() })
        }
      }
    }
  }
}

if (crossModuleViolations.length) {
  printViolations(
    'Cross-module import',
    'Modules must not import from each other. Use core types/ports instead.',
    crossModuleViolations,
  )
  errors += crossModuleViolations.length
}

// --- Check 2: definitions barrel only imported from within link-modules/ ---
const linkLeaks = []
const barrelName = 'definitions/index'

for (const file of findTs(SRC)) {
  if (file.startsWith(join(SRC, 'link-modules/'))) continue

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
    'link-modules/definitions/index.ts must only be imported from within link-modules/.',
    linkLeaks,
  )
  errors += linkLeaks.length
}

if (errors) {
  console.error('')
  process.exit(1)
}
