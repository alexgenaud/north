import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sass from 'sass'

//import Memory from '../TypeScript';


export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        implementation: sass,
      },
    },
  },
});

