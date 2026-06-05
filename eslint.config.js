import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // react-three-fiber drives the render loop by mutating refs/camera inside
    // useFrame and seeds instanced geometry with Math.random in useMemo. Those
    // are idiomatic for r3f but trip the React Compiler purity/immutability rules.
    files: ['src/components/three/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/purity': 'off',
      'react-hooks/immutability': 'off',
    },
  },
])
