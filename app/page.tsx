"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import ProductCard from "@/components/ProductCard"
import { ChevronRight, Package, Shield, Truck } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  images: string[]
  rating: number
  reviewCount: number
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const res = await fetch("/api/products?featured=true&limit=8")
      const data = await res.json()
      setFeaturedProducts(data.products || [])
    } catch (error) {
      console.error("Failed to fetch featured products:", error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { name: "Electronics", image: "/categories/electronics.jpg" },
    { name: "Fashion", image: "/categories/fashion.jpg" },
    { name: "Home & Garden", image: "/categories/home.jpg" },
    { name: "Sports", image: "/categories/sports.jpg" },
    { name: "Books", image: "/categories/books.jpg" },
    { name: "Toys", image: "/categories/toys.jpg" },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Welcome to ShopHub
            </h1>
            <p className="text-xl mb-8 text-gray-300">
              Discover amazing products at unbeatable prices. Fast shipping, secure checkout, and excellent customer service.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[#FF9900] hover:bg-[#FFB84D] text-white px-8 py-4 rounded-md text-lg font-semibold transition-colors"
            >
              Shop Now
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="bg-[#FF9900] p-3 rounded-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Fast Shipping</h3>
                <p className="text-gray-600">Free shipping on orders over $50</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-[#FF9900] p-3 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Secure Payment</h3>
                <p className="text-gray-600">Your payment information is safe</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-[#FF9900] p-3 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Easy Returns</h3>
                <p className="text-gray-600">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 text-center"
              >
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="font-semibold">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link
              href="/products"
              className="text-[#FF9900] hover:text-[#FFB84D] font-semibold flex items-center gap-2"
            >
              View All
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF9900]"></div>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">
              <p>No featured products available at the moment.</p>
              <Link href="/products" className="text-[#FF9900] hover:underline mt-4 inline-block">
                Browse all products
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-300 mb-8">
            Subscribe to our newsletter for exclusive deals and updates
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-md text-gray-900 focus:outline-none"
              aria-label="Email address"
            />
            <button className="bg-[#FF9900] hover:bg-[#FFB84D] px-6 py-3 rounded-md font-semibold transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
