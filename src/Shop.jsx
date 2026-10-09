import { createContext, useContext, useMemo, useState } from 'react'
import { products } from './data.js'

const Cart = createContext(null)
export const useCart = () => useContext(Cart)
const eur = (n) => n == null ? 'Prijs volgt' : n.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })

export function CartProvider({ children }) {
  const [lines, setLines] = useState({})
  const [open, setOpen] = useState(false)
  const api = useMemo(() => {
    const items = Object.entries(lines).map(([id, q]) => ({ ...products.find((p) => p.id === id), q }))
    return {
      lines, items, open, setOpen,
      count: items.reduce((a, i) => a + i.q, 0),
      total: items.reduce((a, i) => a + i.q * (i.price || 0), 0),
      add: (id) => { setLines((l) => ({ ...l, [id]: (l[id] || 0) + 1 })); setOpen(true) },
      dec: (id) => setLines((l) => { const n = { ...l }; if ((n[id] || 0) <= 1) delete n[id]; else n[id]--; return n }),
    }
  }, [lines, open])
  return <Cart.Provider value={api}>{children}</Cart.Provider>
}

function Art({ p }) {
  if (p.ball) return <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" fill="#fff" stroke={p.trim} strokeWidth="4" /><polygon points="50,30 68,43 61,64 39,64 32,43" fill={p.trim} /></svg>
  if (p.scarf) return <svg viewBox="0 0 100 100"><rect x="38" y="8" width="24" height="84" rx="4" fill={p.color} />{[20, 40, 60, 80].map((y) => <rect key={y} x="38" y={y} width="24" height="6" fill={p.trim} />)}</svg>
  return (
    <svg viewBox="0 0 100 100"><path d="M32 12 L14 24 L22 40 L30 36 L30 88 L70 88 L70 36 L78 40 L86 24 L68 12 Q50 26 32 12Z" fill={p.color} stroke={p.trim} strokeWidth="3" strokeLinejoin="round" /></svg>
  )
}

export function ShopSection() {
  const cart = useCart()
  return (
    <section id="shop" className="section">
      <div className="wrap">
        <p className="eyebrow">Webshop</p>
        <h2>Lions Store</h2>
        <p className="lead">Draag de kleuren van Monnickendam. Leden krijgen shirt, broekje en sokken van de club; de rest bestel je hier, bedrukken kan met naam of initialen. (Productfoto's en prijzen volgen; nu nog de bestaande webshop gebruiken: vvmkleding.netlify.app.)</p>
        <div className="grid products">
          {products.map((p) => (
            <article key={p.id} className="card product">
              <div className="art"><Art p={p} /></div>
              <h3>{p.name}</h3>
              <div className="row"><strong>{eur(p.price)}</strong><button className="btn small" onClick={() => cart.add(p.id)}>In winkelmand</button></div>
            </article>
          ))}
        </div>
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
            <li key={i.id}>
              <span>{i.name}</span>
              <span className="qty"><button onClick={() => c.dec(i.id)} aria-label="Minder">−</button>{i.q}<button onClick={() => c.add(i.id)} aria-label="Meer">+</button></span>
              <span>{i.price == null ? '—' : eur(i.q * i.price)}</span>
            </li>
          ))}
        </ul>
      )}
      <footer>
        <div className="row"><span>Totaal</span><strong>{eur(c.total)}</strong></div>
        <button className="btn" disabled>Afrekenen – betaalkoppeling volgt</button>
      </footer>
    </aside>
  )
}
