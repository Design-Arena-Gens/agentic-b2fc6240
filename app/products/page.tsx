"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import ProductCard from "@/components/ProductCard"
import { Filter, ChevronDown } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  images: string[]
  rating: number
  reviewCount: number
  category: string
  brand: string
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    brand: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [filters])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const res = await fetch(`/api/products?${params.toString()}`)
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setLoading(false)
    }
  }

  const categories = ["Electronics", "Fashion", "Home & Garden", "Sports", "Books", "Toys"]
  const brands = ["Apple", "Samsung", "Nike", "Adidas", "Sony", "LG"]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden w-full flex items-center justify-between mb-4"
            >
              <span className="font-bold text-lg flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </span>
              <ChevronDown className={`w-5 h-5 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>

            <div className={`space-y-6 ${showFilters || "hidden md:block"}`}>
              <h2 className="font-bold text-lg hidden md:block">Filters</h2>

              <div>
                <h3 className="font-semibold mb-2">Category</h3>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] text-gray-900"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Brand</h3>
                <select
                  value={filters.brand}
                  onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] text-gray-900"
                >
                  <option value="">All Brands</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Price Range</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] text-gray-900"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] text-gray-900"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Minimum Rating</h3>
                <select
                  value={filters.minRating}
                  onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] text-gray-900"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>

              <button
                onClick={() => setFilters({ search: "", category: "", brand: "", minPrice: "", maxPrice: "", minRating: "" })}
                className="w-full text-[#FF9900] hover:text-[#FFB84D] font-semibold"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">
              {filters.search ? `Search results for "${filters.search}"` : "All Products"}
            </h1>
            <p className="text-gray-600">
              {products.length} {products.length === 1 ? "product" : "products"} found
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF9900]"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">
              <p className="text-xl mb-4">No products found</p>
              <p>Try adjusting your filters or search terms</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF9900]"></div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}
