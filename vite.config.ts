import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sass from 'sass'

//import Memory from '../TypeScript';


export default defineConfig({
  plugins: [react()],
    base: "/north/",
  css: {
    preprocessorOptions: {
      scss: {
        implementation: sass,
      },
    },
  },
});

