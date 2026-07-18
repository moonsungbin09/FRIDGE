import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

describe('recipe suggestion button styles', () => {
  it('defines explicit text color for recipe buttons so labels stay visible without hover', () => {
    const cssPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'App.css')
    const css = readFileSync(cssPath, 'utf8')

    expect(css).toContain('.recipe-select-button {')
    expect(css).toContain('color: var(--text);')
  })
})
