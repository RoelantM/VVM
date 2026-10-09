// Stripe Checkout (iDEAL/kaart). Prijzen komen uitsluitend uit content/products.json, nooit van de browser.
import catalog from '../../content/products.json' with { type: 'json' }

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Alleen POST' }, 405)
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return json({ error: 'Betalen is nog niet geactiveerd (STRIPE_SECRET_KEY ontbreekt).' }, 503)

  let items
  try { ({ items } = await req.json()) } catch { return json({ error: 'Ongeldige aanvraag' }, 400) }
  if (!Array.isArray(items) || items.length === 0 || items.length > 30) return json({ error: 'Lege of ongeldige winkelmand' }, 400)

  const form = new URLSearchParams()
  form.set('mode', 'payment')
  form.set('locale', 'nl')
  form.set('billing_address_collection', 'auto')
  form.set('phone_number_collection[enabled]', 'true')
  form.set('custom_fields[0][key]', 'bedrukking')
  form.set('custom_fields[0][type]', 'text')
  form.set('custom_fields[0][optional]', 'true')
  form.set('custom_fields[0][label][type]', 'custom')
  form.set('custom_fields[0][label][custom]', 'Bedrukking (naam/initialen, optioneel)')
  form.set('payment_intent_data[description]', 'VVM clubkleding (afhalen in de kantine)')

  let n = 0
  for (const it of items) {
    const p = catalog.items.find((x) => x.id === it.id && x.active !== false)
    const q = Number(it.q)
    const sizes = (p?.sizes || '').split(',').map((s) => s.trim()).filter(Boolean)
    if (!p || p.price == null || !Number.isInteger(q) || q < 1 || q > 20) return json({ error: 'Ongeldig product in winkelmand' }, 400)
    if (sizes.length && !sizes.includes(it.size)) return json({ error: 'Ongeldige maat voor ' + p.name }, 400)
    form.set(`line_items[${n}][quantity]`, String(q))
    form.set(`line_items[${n}][price_data][currency]`, 'eur')
    form.set(`line_items[${n}][price_data][unit_amount]`, String(Math.round(p.price * 100)))
    form.set(`line_items[${n}][price_data][product_data][name]`, p.name + (it.size ? ` (${it.size})` : ''))
    n++
  }

  const origin = process.env.URL || new URL(req.url).origin
  form.set('success_url', `${origin}/?betaling=gelukt`)
  form.set('cancel_url', `${origin}/?betaling=geannuleerd#shop`)

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/x-www-form-urlencoded' },
    body: form,
  })
  const data = await res.json()
  if (!res.ok) return json({ error: 'Stripe: ' + (data.error?.message || res.status) }, 502)
  return json({ url: data.url })
}
