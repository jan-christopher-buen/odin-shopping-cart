import { Link } from 'react-router'
import styles from '../components/Store.module.css'
export default function NotFound() {
  return (
    <section className={styles.state}>
      <p className="eyebrow">404 / A little off the path</p>
      <h1>This page isn’t on the shelf.</h1>
      <p>Find your way back to the good things.</p>
      <Link className="button" to="/">
        Back to home →
      </Link>
    </section>
  )
}
