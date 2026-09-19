import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const imageFolders = {
  map: new Set(['woodfloor', 'floor1', 'arcadia1', 'arcadia2', 'Solo2', 'solo3', 'casa Teste']),
  sprites: new Set(['idle hades', 'hades walking direita', 'hades walking esquerda', 'idle hunter', 'hunter walking direita', 'hunter walking esquerda', 'hunter run']),
  items: new Set(['health potion', 'mutated core', 'lampiao-Hades']),
  ui: new Set(['hades_Avatar', 'Hades_Fullbody', 'deadborn-menu', 'deadborn-logo-oficial', 'logo-seletor', 'cinerea-logo', 'diario']),
  intro: new Set(['Eye1', 'Eye2', 'Eye3', 'Eye4']),
  npcs: new Set(['anfitrião(corvo)']),
}

function assetFileName(asset) {
  const extension = asset.name?.slice(asset.name.lastIndexOf('.')) ?? ''
  const baseName = asset.name?.slice(0, asset.name.length - extension.length)
  const folder = Object.entries(imageFolders).find(([, names]) => names.has(baseName))?.[0]

  return folder
    ? `assets/images/${folder}/[name]-[hash][extname]`
    : 'assets/[name]-[hash][extname]'
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        assetFileNames: assetFileName,
      },
    },
  },
})
