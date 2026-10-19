# CLAUDE.md – VV Monnickendam website

Lees eerst `docs/CONTEXT.md` (volledige context, besluiten, open punten).

## Werkregels
- Communiceer in het **Nederlands**.
- **Verzin niets**; wat ontbreekt blijft duidelijk placeholder.
- **Geen verwijzingen naar de oude clubsite** (links, afbeeldingen, PDF's) — behalve de databron in `netlify/lib/programma.mjs`.
- Alles blijft **bewerkbaar via het CMS** (`public/admin/config.yml` + `content/`). Nieuwe inhoudstypes → ook CMS-collectie.
- Werk op branch `claude/vvm-website-redesign-kb4gx2`; commit duidelijk en push. **Geen pull request** tenzij gevraagd.
- Test voor opleveren: `npm run build` + headless browser (Playwright); controleer console-errors en laat screenshots zien.
- AVG: geen spelersfoto's/-namen van de oude teampagina's overnemen.
- Licht thema (wit/groen, `#009040`, links/knoppen `#007a35`).
- Wees eerlijk over wat niet getest is (bv. Stripe met echte sleutel, Netlify Identity).

## Commando's
`npm install` · `npm run dev` (http://localhost:5173) · `npm run cms` (lokale CMS-backend) · `npm run build`
