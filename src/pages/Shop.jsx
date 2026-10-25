import { useOutletContext } from 'react-router'
import ProductCard from '../components/ProductCard'
import styles from '../components/Store.module.css'
export default function Shop() {
  const { catalog, onAdd, notice } = useOutletContext()
  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <p className="eyebrow">The everyday edit</p>
          <h1>
            The collection<span>.</span>
          </h1>
          <p>A mix of useful, wearable, and unexpected. Make it yours.</p>
        </div>
        <span className={styles.catalogCount}>
          {catalog.status === 'success'
            ? `${catalog.products.length} products`
            : 'The Common Goods catalog'}
        </span>
      </header>
      <div role="status" className={styles.notice}>
        {notice}
      </div>
      {catalog.status === 'loading' ? (
        <div className={styles.state} role="status">
          <span className={styles.loadingDot} /> Gathering the good things…
        </div>
      ) : catalog.status === 'error' ? (
        <section className={styles.state} role="alert">
          <h2>The collection couldn’t load.</h2>
          <p>Please check your connection and try again.</p>
          <button className="button" onClick={catalog.retry}>
            Try again
          </button>
        </section>
      ) : !catalog.products.length ? (
        <section className={styles.state}>
          <h2>No products to show yet.</h2>
          <p>The catalog is empty. Please check again later.</p>
        </section>
      ) : (
        <div className={styles.grid}>
          {catalog.products.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={onAdd} />
          ))}
        </div>
      )}
    </>
  )
}
