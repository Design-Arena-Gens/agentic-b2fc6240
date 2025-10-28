"use client"

import Link from "next/link"
import Image from "next/image"
import { Star, ShoppingCart } from "lucide-react"
import { useState } from "react"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  images: string[]
  rating: number
  reviewCount: number
}

export default function ProductCard({ product }: { product: Product }) {
  const [isAdding, setIsAdding] = useState(false)

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsAdding(true)
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      })
      if (res.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to add to cart:", error)
    } finally {
      setIsAdding(false)
    }
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.images[0] || "/placeholder.jpg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {discount > 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold">
              -{discount}%
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
            {product.name}
          </h3>
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? "fill-[#FF9900] text-[#FF9900]"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">
              ({product.reviewCount})
            </span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through ml-2">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={addToCart}
            disabled={isAdding}
            className="w-full bg-[#FF9900] hover:bg-[#FFB84D] text-white py-2 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShoppingCart className="w-4 h-4" />
            {isAdding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </Link>
  )
}
