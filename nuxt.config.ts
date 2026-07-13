// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: [
    'ag-grid-community/styles/ag-grid.css',
    'ag-grid-community/styles/ag-theme-quartz.css',
  ],
  vite: {
    optimizeDeps: {
      include: ['ag-grid-vue3', 'ag-grid-enterprise'],
    },
  },
})
