import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // En local (npm run dev) : servi sous /warattah/ pour coller à l'URL de dev habituelle.
  // En build (déploiement) : à la racine, car warattah.com est un nom de domaine
  // personnalisé et non un sous-chemin github.io/warattah/.
  base: command === 'serve' ? '/warattah/' : '/',
  plugins: [react()],
}))
