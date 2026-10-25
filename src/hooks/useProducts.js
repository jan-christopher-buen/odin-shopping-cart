import { useEffect, useState } from 'react'
export const PRODUCTS_URL = 'https://fakestoreapi.com/products'
export function parseProducts(data) {
  if (!Array.isArray(data))
    throw new Error('The catalog response was not a product list.')
  const ids = new Set()
  const products = data
    .filter((p) => {
      if (
        !p ||
        !['number', 'string'].includes(typeof p.id) ||
        !String(p.id).trim() ||
        ids.has(String(p.id)) ||
        typeof p.title !== 'string' ||
        !p.title.trim() ||
        typeof p.price !== 'number' ||
        !Number.isFinite(p.price) ||
        p.price < 0 ||
        !Number.isSafeInteger(Math.round(p.price * 100) * 99)
      )
        return false
      ids.add(String(p.id))
      return true
    })
    .map((p) => ({
      id: String(p.id),
      title: p.title.trim(),
      priceCents: Math.round(p.price * 100),
      image:
        typeof p.image === 'string' && /^https?:\/\//.test(p.image)
          ? p.image
          : '',
      category: typeof p.category === 'string' ? p.category : 'Everyday goods',
    }))
  if (data.length && !products.length)
    throw new Error('The catalog contained no usable products.')
  return products
}
export default function useProducts() {
  const [catalog, setCatalog] = useState({ status: 'loading', products: [] })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    let active = true
    async function load() {
      try {
        const response = await fetch(PRODUCTS_URL, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Catalog request failed.')
        const products = parseProducts(await response.json())
        if (active) setCatalog({ status: 'success', products })
      } catch {
        if (active && !controller.signal.aborted)
          setCatalog({ status: 'error', products: [] })
      }
    }
    load()
    return () => {
      active = false
      controller.abort()
    }
  }, [attempt])
  function retry() {
    setCatalog({ status: 'loading', products: [] })
    setAttempt((n) => n + 1)
  }
  return { ...catalog, retry }
}
