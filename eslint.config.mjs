import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import eslintPluginNext from '@next/eslint-plugin-next'
import eslintPluginTs from '@typescript-eslint/eslint-plugin'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  {
    plugins: {
      '@next/next': eslintPluginNext,
      '@typescript-eslint': eslintPluginTs,
    },
    rules: {
      '@typescript-eslint/no-shadow': 'error',
    },
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
]

export default eslintConfig
