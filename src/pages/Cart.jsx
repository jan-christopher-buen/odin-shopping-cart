import { Link, useOutletContext } from 'react-router'
import Quantity from '../components/Quantity'
import ProductImage from '../components/ProductImage'
import { cartTotal, itemCount, money } from '../lib/cart'
import styles from '../components/Store.module.css'
export default function Cart() {
  const { cart, onQuantity, onRemove, notice } = useOutletContext()
  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <p className="eyebrow">Your good finds</p>
          <h1>
            The cart<span>.</span>
          </h1>
          <p>A little of what caught your eye.</p>
        </div>
        <Link className={styles.textLink} to="/shop">
          Continue exploring ↗
        </Link>
      </header>
      <p className="srOnly" role="status">
        {notice}
      </p>
      {!cart.length ? (
        <section className={styles.state}>
          <span className={styles.emptyIcon} aria-hidden="true">
            ↗
          </span>
          <h2>Good things await.</h2>
          <p>Your cart is empty. Let’s find something you like.</p>
          <Link className="button" to="/shop">
            Explore the collection →
          </Link>
        </section>
      ) : (
        <div className={styles.cartLayout}>
          <div>
            {cart.map((item) => (
              <article
                className={styles.cartRow}
                key={item.id}
                aria-label={item.title}
              >
                <ProductImage product={item} />
                <div className={styles.cartDetails}>
                  <p className={styles.category}>{item.category}</p>
                  <h2>{item.title}</h2>
                  <p>{money(item.priceCents)} each</p>
                  <button
                    className={styles.remove}
                    aria-label={`Remove ${item.title}`}
                    onClick={() => onRemove(item.id)}
                  >
                    Remove
                  </button>
                </div>
                <div className={styles.cartNumbers}>
                  <Quantity
                    value={item.quantity}
                    onChange={(value) => onQuantity(item.id, value)}
                    name={item.title}
                  />
                  <p>
                    Subtotal{' '}
                    <strong>{money(item.priceCents * item.quantity)}</strong>
                  </p>
                </div>
              </article>
            ))}
          </div>
          <aside className={styles.summary}>
            <p className="eyebrow">All together</p>
            <h2>Your summary</h2>
            <div>
              <span>Total items</span>
              <strong>{itemCount(cart)}</strong>
            </div>
            <div className={styles.total}>
              <span>Order total</span>
              <strong>{money(cartTotal(cart))}</strong>
            </div>
            <p>
              All prices in USD. This is a demo store; no orders or payments are
              processed.
            </p>
            <Link className={styles.textLink} to="/shop">
              Keep exploring →
            </Link>
          </aside>
        </div>
      )}
    </>
  )
}
