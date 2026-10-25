import { useState } from 'react'
import Quantity from './Quantity'
import ProductImage from './ProductImage'
import { money } from '../lib/cart'
import styles from './Store.module.css'
export default function ProductCard({ product, onAdd }) {
  const [amount, setAmount] = useState(1)
  return (
    <article className={styles.card}>
      <ProductImage product={product} />
      <div className={styles.cardBody}>
        <p className={styles.category}>{product.category}</p>
        <h2>{product.title}</h2>
        <p className={styles.price}>{money(product.priceCents)}</p>
        <Quantity value={amount} onChange={setAmount} name={product.title} />
        <button className="button" onClick={() => onAdd(product, amount)}>
          Add to cart<span className="srOnly">: {product.title}</span>
          <span aria-hidden="true"> ↗</span>
        </button>
      </div>
    </article>
  )
}
