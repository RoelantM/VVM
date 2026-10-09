import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev-only: bedient /.netlify/functions/programma lokaal met dezelfde code als de Netlify Function
const programmaDev = () => ({
  name: 'programma-dev',
  configureServer(server) {
    server.middlewares.use('/.netlify/functions/programma', async (req, res) => {
      try {
        const { fetchProgram } = await import('./netlify/lib/programma.mjs')
        const sp = new URL(req.url, 'http://x').searchParams
        const team = sp.get('team') || undefined
        const kind = ['uitslagen', 'afgelastingen'].includes(sp.get('kind')) ? sp.get('kind') : 'programma'
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify({ matches: await fetchProgram({ team, kind }), source: 'clubsite' }))
      } catch (e) { res.statusCode = 502; res.end('{}') }
    })
  },
})

export default defineConfig({ plugins: [react(), programmaDev()] })
