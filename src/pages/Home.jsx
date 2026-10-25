import { Link, useOutletContext } from 'react-router'
import ProductImage from '../components/ProductImage'
import styles from '../components/Store.module.css'
export default function Home() {
  const { catalog } = useOutletContext()
  const featured = catalog.products.slice(0, 3)
  return (
    <>
      <section className={styles.hero}>
        <div>
          <p className="eyebrow">A little discovery, every day</p>
          <h1>
            Good things.
            <br />
            <em>Simple choices.</em>
          </h1>
          <p className={styles.intro}>
            From everyday essentials to something unexpected. Explore clothing,
            jewelry, and technology in one easygoing place.
          </p>
          <Link className="button" to="/shop">
            Explore the collection <span aria-hidden="true">↗</span>
          </Link>
          <p className={styles.heroNote}>
            A demo store. Real products to explore.
          </p>
        </div>
        <div className={styles.heroArt}>
          <span className={styles.artLabel}>THE EVERYDAY EDIT / 01</span>
          <div className={styles.featured}>
            {featured.length ? (
              featured.map((product) => (
                <ProductImage key={product.id} product={product} />
              ))
            ) : (
              <div className={styles.wordArt}>
                A few
                <br />
                good
                <br />
                <em>finds.</em>
              </div>
            )}
          </div>
          <span className={styles.artBottom}>
            COMMON GOODS — AN EXERCISE IN SIMPLICITY
          </span>
        </div>
      </section>
      <section className={styles.homeBottom}>
        <div>
          <p className="eyebrow">Considered, uncomplicated</p>
          <h2>
            A small store.
            <br />
            Room to explore.
          </h2>
        </div>
        <p>
          Browse the catalog, choose your quantities, and build a cart that’s
          yours. This learning project brings the essentials of online shopping
          together, without checkout or real purchases.
        </p>
        <Link to="/shop" className={styles.textLink}>
          Find your next good thing →
        </Link>
      </section>
    </>
  )
}
