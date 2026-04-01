/**
 * Prepares the OpenAPI spec for Kubb:
 * - parses operationIds (parceiro.escopo.subescopo:acao)
 * - sets tags for grouping
 * - rewrites operationIds to desired function names
 *
 * Run before `kubb generate`.
 * Output: openapi/spec.json
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

function loadEnv(): void {
  const envPath = resolve(process.cwd(), '.env')
  if (!existsSync(envPath)) return

  const content = readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue

    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!process.env[key]) process.env[key] = value
  }
}

loadEnv()

const SPEC_URL =
  process.env.OPENAPI_SPEC_URL ??
  process.env.NEXT_PUBLIC_OPENAPI_SPEC_URL ??
  ''
const FALLBACK_SPEC_PATH = resolve(process.cwd(), 'openapi/spec.json')
const OUTPUT_PATH = resolve(process.cwd(), 'openapi/spec.json')

type OpenAPISpec = {
  openapi?: string
  info?: unknown
  paths?: Record<
    string,
    Record<
      string,
      { operationId?: string; tags?: string[]; [key: string]: unknown }
    >
  >
  [key: string]: unknown
}

function toKebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '')
}

function camelCase(str: string): string {
  return str
    .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
    .replace(/^./, s => s.toLowerCase())
}

function pascalCase(str: string): string {
  const c = camelCase(str)
  return c.charAt(0).toUpperCase() + c.slice(1)
}

function normalizeAccents(str: string): string {
  return str.normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

function parseOperationId(
  operationId: string
): { scope: string; action: string } | null {
  const raw = operationId.trim()
  if (!raw) return null

  if (raw.includes(':')) {
    const idx = raw.indexOf(':')
    const before = raw.slice(0, idx)
    const action = raw.slice(idx + 1).trim()
    const parts = before.split('.').filter(Boolean)
    if (parts[0]?.toLowerCase() === 'parceiro') parts.shift()
    const scope = parts.join('.')
    return scope ? { scope, action } : null
  }

  const parts = raw.split('.').filter(Boolean)
  if (parts.length < 2) return null
  if (parts[0]?.toLowerCase() === 'parceiro') parts.shift()
  if (parts.length < 1) return null

  const action = parts.pop() ?? ''
  const scope = parts.join('.')
  return { scope, action }
}

function scopeToTag(scope: string): string {
  const segments = scope.split('.').filter(Boolean)
  if (segments.length === 0) return scope
  const kebabSegments = segments.map(s => toKebabCase(normalizeAccents(s)))
  return kebabSegments.join('/')
}

function scopeToSuffix(scope: string): string {
  const segments = scope.split('.').filter(Boolean)
  if (segments.length === 0) return ''

  const normalized = segments.map(s => normalizeAccents(s))
  if (normalized.length === 1) return pascalCase(normalized[0] ?? '')

  return normalized
    .slice(1)
    .map(s => pascalCase(s))
    .join('')
}

function buildNewOperationId(scope: string, action: string): string {
  const suffix = scopeToSuffix(scope)
  const actionCamel = camelCase(action)
  return actionCamel + suffix
}

function transformSpec(spec: OpenAPISpec): OpenAPISpec {
  const paths = spec.paths
  if (!paths || typeof paths !== 'object') return spec

  const nextPaths = { ...paths }

  for (const pathKey of Object.keys(nextPaths)) {
    const pathItem = nextPaths[pathKey]
    if (!pathItem || typeof pathItem !== 'object') continue

    for (const method of Object.keys(pathItem)) {
      const op = pathItem[method]
      if (!op || typeof op !== 'object' || !('operationId' in op)) continue

      const operationId = op.operationId
      if (typeof operationId !== 'string') continue

      const parsed = parseOperationId(operationId)
      if (!parsed) continue

      const { scope, action } = parsed
      const tag = scopeToTag(scope)
      const newOperationId = buildNewOperationId(scope, action)

      ;(op as Record<string, unknown>).tags = [tag]
      ;(op as Record<string, unknown>).operationId = newOperationId
    }
  }

  return { ...spec, paths: nextPaths }
}

async function loadSpec(): Promise<OpenAPISpec> {
  if (SPEC_URL.startsWith('https://') || SPEC_URL.startsWith('http://')) {
    const candidateUrls = [SPEC_URL]
    if (SPEC_URL.endsWith('/docs')) candidateUrls.push(`${SPEC_URL}-json`)
    if (SPEC_URL.endsWith('/docs/')) candidateUrls.push(`${SPEC_URL}json`)

    let lastError: Error | null = null

    for (const url of candidateUrls) {
      const res = await fetch(url)
      if (!res.ok) {
        lastError = new Error(`Failed to fetch spec: ${res.status} ${url}`)
        continue
      }

      const text = await res.text()
      try {
        return JSON.parse(text) as OpenAPISpec
      } catch {
        const preview = text.slice(0, 180).replace(/\s+/g, ' ').trim()
        lastError = new Error(
          `Invalid JSON from ${url}. ` +
            `Set OPENAPI_SPEC_URL to your Swagger JSON endpoint (ex: /docs-json). ` +
            `Response preview: ${preview}`
        )
      }
    }

    if (lastError) throw lastError
  }

  const fallbackPath = SPEC_URL
    ? resolve(process.cwd(), SPEC_URL)
    : FALLBACK_SPEC_PATH

  if (!existsSync(fallbackPath)) {
    const dir = dirname(fallbackPath)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

    const minimalSpec: OpenAPISpec = { openapi: '3.0.0', paths: {} }
    writeFileSync(fallbackPath, JSON.stringify(minimalSpec, null, 2), 'utf-8')
    return minimalSpec
  }

  const content = readFileSync(fallbackPath, 'utf-8')
  return JSON.parse(content) as OpenAPISpec
}

async function main(): Promise<void> {
  const spec = await loadSpec()
  const transformed = transformSpec(spec)
  const normalizedSpec: OpenAPISpec = {
    ...transformed,
    info:
      transformed.info ??
      ({
        title: 'Generated OpenAPI Spec',
        version: '1.0.0'
      } as const)
  }
  const outDir = dirname(OUTPUT_PATH)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const newContent = JSON.stringify(normalizedSpec, null, 2)
  const hasNewContent =
    !existsSync(OUTPUT_PATH) ||
    readFileSync(OUTPUT_PATH, 'utf-8') !== newContent

  if (hasNewContent) writeFileSync(OUTPUT_PATH, newContent, 'utf-8')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
