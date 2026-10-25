import { useState } from 'react'
import styles from './Store.module.css'
export default function ProductImage({ product }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={styles.image}>
      {product.image && !failed ? (
        <img
          src={product.image}
          alt={product.title}
          onError={() => setFailed(true)}
          loading="lazy"
        />
      ) : (
        <span role="img" aria-label={`Image unavailable for ${product.title}`}>
          Image unavailable
        </span>
      )}
    </div>
  )
}
