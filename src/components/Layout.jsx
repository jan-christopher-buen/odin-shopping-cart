import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import useProducts from '../hooks/useProducts'
import { addItem, itemCount, quantity } from '../lib/cart'
import styles from './Store.module.css'
export default function Layout() {
  const [cart, setCart] = useState([])
  const [notice, setNotice] = useState('')
  const catalog = useProducts()
  const { pathname } = useLocation()
  useEffect(() => {
    const name =
      { '/': 'Home', '/shop': 'Shop', '/cart': 'Cart' }[pathname] ||
      'Page not found'
    document.title = `${name} | Common Goods`
    document.querySelector('main')?.focus()
    window.scrollTo(0, 0)
  }, [pathname])
  function onAdd(product, amount) {
    setCart((previous) => addItem(previous, product, amount))
    setNotice(
      `${product.title} added to your cart. Quantities are limited to 99 per product.`,
    )
  }
  function onQuantity(id, amount) {
    setCart((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, quantity: quantity(amount, item.quantity) }
          : item,
      ),
    )
  }
  function onRemove(id) {
    setCart((previous) => previous.filter((item) => item.id !== id))
    setNotice('Item removed from your cart.')
    // Move to a stable landmark when the focused remove button disappears.
    document.querySelector('main')?.focus()
  }
  return (
    <div className={styles.app}>
      <a href="#main" className={styles.skip}>
        Skip to content
      </a>
      <div className={styles.announcement}>
        A storefront for discovery. A demo built for learning.
      </div>
      <header className={styles.header}>
        <Link to="/" className={styles.brand} aria-label="Common Goods home">
          <span className={styles.brandIcon} aria-hidden="true">
            ✳
          </span>{' '}
          common goods<span className={styles.brandPeriod}>.</span>
        </Link>
        <nav aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/cart">
            Cart{' '}
            <span
              className={styles.badge}
              aria-label={`${itemCount(cart)} items`}
            >
              {itemCount(cart)}
            </span>
          </NavLink>
        </nav>
      </header>
      <main id="main" tabIndex={-1} className={styles.main}>
        <Outlet
          context={{ cart, catalog, onAdd, onQuantity, onRemove, notice }}
        />
      </main>
      <footer className={styles.footer}>
        <Link to="/" className={styles.footerBrand}>
          common goods.
        </Link>
        <p>
          A practice in thoughtful shopping.
          <br />
          Built for The Odin Project. No real purchases.
        </p>
        <span>DEMO STORE / USD</span>
      </footer>
    </div>
  )
}
