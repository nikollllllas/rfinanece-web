// @ts-nocheck
/**
 * Kubb - OpenAPI
 *
 * Nao editar arquivos gerados em lib/api/.
 * Ajustes de naming/saida devem ser feitos apenas aqui.
 */
import { defineConfig } from '@kubb/core'
import { pluginClient } from '@kubb/plugin-client'
import { clientGenerator } from '@kubb/plugin-client/generators'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginReactQuery } from '@kubb/plugin-react-query'
import { pluginTs } from '@kubb/plugin-ts'

const openApiPath = './openapi/spec.json'

function toKebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-+/, '')
    .replace(/-+/g, '-')
}

function normalizeAccents(str: string): string {
  return str.normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

function stripParceiroFromName(name: string): string {
  return name.replace(/parceiro/gi, '').trim()
}

function toPascalCase(str: string): string {
  const s = str.trim()
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function hookName(name: string): string {
  return `use${toPascalCase(name)}`
}

const IGNORED_PATH_SEGMENTS = /^(parceiro|use-parceiro)$/i

function stripIgnoredPathSegments(pathOrBaseName: string): string {
  return pathOrBaseName
    .split('/')
    .filter(seg => !IGNORED_PATH_SEGMENTS.test(seg.trim()))
    .join('/')
    .replace(/^\/+|\/+$/g, '')
}

function groupToFolderName(group: string): string {
  const withoutParceiro = group.replace(/^parceiro[./]?/i, '')
  return withoutParceiro
    .split('/')
    .map(segment =>
      normalizeAccents(toKebabCase(segment.trim().replace(/\s+/g, '-')))
    )
    .filter(seg => Boolean(seg) && !IGNORED_PATH_SEGMENTS.test(seg))
    .join('/')
}

function withStripParceiroInPath<T>(plugin: T): T {
  const p = plugin as {
    resolvePath?: (baseName: string, mode?: string, options?: object) => string
  }
  const original = p.resolvePath
  if (!original) return plugin

  ;(
    plugin as {
      resolvePath: (baseName: string, mode?: string, options?: object) => string
    }
  ).resolvePath = function (baseName: string, mode?: string, options?: object) {
    return original.call(
      this,
      stripIgnoredPathSegments(baseName),
      mode,
      options
    )
  }

  return plugin
}

export default defineConfig({
  input: {
    path: openApiPath
  },
  output: {
    path: './lib/api',
    clean: true,
    barrelType: false,
    format: 'biome',
    lint: 'biome'
  },
  plugins: [
    pluginOas({
      collisionDetection: true,
      validate: true
    }),
    withStripParceiroInPath(
      pluginTs({
        output: {
          path: 'schemas',
          barrelType: false
        },
        group: {
          type: 'tag',
          name: ({ group }) => groupToFolderName(group)
        },
        transformers: {
          name: (name, type) => {
            const stripped = stripParceiroFromName(name)
            if (type === 'file') return normalizeAccents(toKebabCase(stripped))
            return stripped
          }
        }
      })
    ),
    withStripParceiroInPath(
      pluginClient({
        output: {
          path: '.',
          barrelType: false
        },
        generators: [clientGenerator],
        importPath: '@kubb/plugin-client/clients/axios',
        group: {
          type: 'tag',
          name: ({ group }) => groupToFolderName(group)
        },
        client: 'axios',
        dataReturnType: 'data',
        pathParamsType: 'inline',
        transformers: {
          name: (name, type) => {
            const stripped = stripParceiroFromName(name)
            if (type === 'file') return normalizeAccents(toKebabCase(stripped))
            const camel = stripped
              ? stripped.charAt(0).toLowerCase() + stripped.slice(1)
              : stripped
            return camel
          }
        }
      })
    ),
    withStripParceiroInPath(
      pluginReactQuery({
        output: {
          path: '.',
          barrelType: false
        },
        group: {
          type: 'tag',
          name: ({ group }) => `${groupToFolderName(group)}/hooks`
        },
        query: {
          methods: ['get']
        },
        mutation: {
          methods: ['post', 'put', 'patch', 'delete']
        },
        transformers: {
          name: (name, type) => {
            const stripped = stripParceiroFromName(name)
            const camel = stripped
              ? stripped.charAt(0).toLowerCase() + stripped.slice(1)
              : stripped

            if (type === 'function')
              return name.startsWith('use') ? name : hookName(camel)

            if (type === 'file') {
              const hookOrName = name.startsWith('use')
                ? stripped
                : hookName(camel)
              return normalizeAccents(toKebabCase(hookOrName))
            }

            return stripped
          }
        }
      })
    )
  ]
})
