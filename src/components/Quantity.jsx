import { useId, useState } from 'react'
import { MAX_QUANTITY, quantity } from '../lib/cart'
import styles from './Store.module.css'
export default function Quantity({ value, onChange, name }) {
  const id = useId()
  const [draft, setDraft] = useState(null)
  function commit() {
    onChange(quantity(draft ?? value, value))
    setDraft(null)
  }
  function step(amount) {
    onChange(
      Math.max(
        1,
        Math.min(MAX_QUANTITY, quantity(draft ?? value, value) + amount),
      ),
    )
    setDraft(null)
  }
  return (
    <div className={styles.quantity}>
      <label htmlFor={id}>
        Quantity <span className="srOnly">for {name}</span>
      </label>
      <div className={styles.stepper}>
        <button
          type="button"
          aria-label={`Decrease quantity for ${name}`}
          disabled={quantity(draft ?? value, value) <= 1}
          onClick={() => step(-1)}
        >
          −
        </button>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={draft ?? value}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commit()
            }
          }}
          aria-describedby={`${id}-hint`}
        />
        <button
          type="button"
          aria-label={`Increase quantity for ${name}`}
          disabled={quantity(draft ?? value, value) >= MAX_QUANTITY}
          onClick={() => step(1)}
        >
          +
        </button>
      </div>
      <span id={`${id}-hint`} className="srOnly">
        Enter a whole number from 1 to 99. Invalid entries return to the
        previous quantity; values above 99 become 99.
      </span>
    </div>
  )
}
