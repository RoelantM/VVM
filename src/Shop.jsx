import { createContext, useContext, useMemo, useState } from 'react'
import { products } from './data.js'

const Cart = createContext(null)
export const useCart = () => useContext(Cart)
const eur = (n) => n == null ? 'Prijs volgt' : n.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })

export function CartProvider({ children }) {
  // Regels: sleutel "id|maat" -> aantal
  const [lines, setLines] = useState({})
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const api = useMemo(() => {
    const items = Object.entries(lines).map(([key, q]) => {
      const [id, size = ''] = key.split('|')
      return { ...products.find((p) => p.id === id), key, size, q }
    })
    return {
      items, open, setOpen, busy, error,
      count: items.reduce((a, i) => a + i.q, 0),
      total: items.reduce((a, i) => a + i.q * (i.price || 0), 0),
      add: (id, size = '') => { const k = id + '|' + size; setLines((l) => ({ ...l, [k]: (l[k] || 0) + 1 })); setOpen(true) },
      dec: (k) => setLines((l) => { const n = { ...l }; if ((n[k] || 0) <= 1) delete n[k]; else n[k]--; return n }),
      checkout: async () => {
        setBusy(true); setError('')
        try {
          const res = await fetch('/.netlify/functions/checkout', {
            method: 'POST', headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ items: items.map((i) => ({ id: i.id, size: i.size, q: i.q })) }),
          })
          const data = await res.json()
          if (!res.ok || !data.url) throw new Error(data.error || 'Afrekenen is mislukt')
          location.href = data.url
        } catch (e) { setError(e.message); setBusy(false) }
      },
    }
  }, [lines, open, busy, error])
  return <Cart.Provider value={api}>{children}</Cart.Provider>
}

function Art({ p }) {
  if (p.ball) return <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" fill="#fff" stroke={p.trim} strokeWidth="4" /><polygon points="50,30 68,43 61,64 39,64 32,43" fill={p.trim} /></svg>
  if (p.scarf) return <svg viewBox="0 0 100 100"><rect x="38" y="8" width="24" height="84" rx="4" fill={p.color} />{[20, 40, 60, 80].map((y) => <rect key={y} x="38" y={y} width="24" height="6" fill={p.trim} />)}</svg>
  return (
    <svg viewBox="0 0 100 100"><path d="M32 12 L14 24 L22 40 L30 36 L30 88 L70 88 L70 36 L78 40 L86 24 L68 12 Q50 26 32 12Z" fill={p.color} stroke={p.trim} strokeWidth="3" strokeLinejoin="round" /></svg>
  )
}

function ProductCard({ p }) {
  const cart = useCart()
  const [size, setSize] = useState(p.sizes[0] || '')
  const buyable = p.price != null
  return (
    <article className="card product">
      <div className="art"><Art p={p} /></div>
      <h3>{p.name}</h3>
      {p.sizes.length > 0 && (
        <select value={size} onChange={(e) => setSize(e.target.value)} aria-label={'Maat ' + p.name}>
          {p.sizes.map((z) => <option key={z}>{z}</option>)}
        </select>
      )}
      <div className="row"><strong>{eur(p.price)}</strong>
        <button className="btn small" disabled={!buyable} onClick={() => cart.add(p.id, size)}>{buyable ? 'In winkelmand' : 'Binnenkort'}</button>
      </div>
    </article>
  )
}

export function ShopSection() {
  return (
    <section id="shop" className="section first">
      <div className="wrap">
        <p className="eyebrow">Webshop</p>
        <h2>Lions Store</h2>
        <p className="lead">Leden krijgen shirt, broekje en sokken van de club; de rest bestel je hier. Betalen via iDEAL of kaart (Stripe), afhalen in de kantine.  Prijzen en maten volgen binnenkort.</p>
        <div className="grid products">{products.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </div>
    </section>
  )
}

export function CartDrawer() {
  const c = useCart()
  return (
    <aside className={'drawer' + (c.open ? ' open' : '')} aria-hidden={!c.open}>
      <header><h3>Winkelmand</h3><button className="x" onClick={() => c.setOpen(false)} aria-label="Sluiten">×</button></header>
      {c.items.length === 0 ? <p className="muted">Je winkelmand is leeg.</p> : (
        <ul>
          {c.items.map((i) => (
            <li key={i.key}>
              <span>{i.name}{i.size && ' (' + i.size + ')'}</span>
              <span className="qty"><button onClick={() => c.dec(i.key)} aria-label="Minder">−</button>{i.q}<button onClick={() => c.add(i.id, i.size)} aria-label="Meer">+</button></span>
              <span>{eur(i.q * i.price)}</span>
            </li>
          ))}
        </ul>
      )}
      <footer>
        <div className="row"><span>Totaal</span><strong>{eur(c.total)}</strong></div>
        {c.error && <p className="muted" role="alert">{c.error}</p>}
        <button className="btn" disabled={c.items.length === 0 || c.busy} onClick={c.checkout}>{c.busy ? 'Even geduld…' : 'Afrekenen'}</button>
      </footer>
    </aside>
  )
}
