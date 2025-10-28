"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Star, ShoppingCart, Truck, Shield, ChevronLeft } from "lucide-react"
import Link from "next/link"
import ProductCard from "@/components/ProductCard"

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  rating: number
  reviewCount: number
  category: string
  brand: string
  stock: number
  specifications?: any
  reviews: Review[]
  relatedProducts: Product[]
}

interface Review {
  id: string
  rating: number
  title: string
  comment: string
  createdAt: string
  user: {
    name: string
  }
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
  })

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${params.id}`)
      const data = await res.json()
      setProduct(data)
    } catch (error) {
      console.error("Failed to fetch product:", error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async () => {
    if (!session) {
      router.push("/login")
      return
    }

    setIsAdding(true)
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product?.id, quantity }),
      })
      if (res.ok) {
        router.push("/cart")
      }
    } catch (error) {
      console.error("Failed to add to cart:", error)
    } finally {
      setIsAdding(false)
    }
  }

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      router.push("/login")
      return
    }

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product?.id,
          ...reviewForm,
        }),
      })
      if (res.ok) {
        setShowReviewForm(false)
        setReviewForm({ rating: 5, title: "", comment: "" })
        fetchProduct()
      }
    } catch (error) {
      console.error("Failed to submit review:", error)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF9900]"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link href="/products" className="text-[#FF9900] hover:underline">
          Browse all products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/products" className="inline-flex items-center gap-2 text-[#FF9900] hover:text-[#FFB84D] mb-6">
        <ChevronLeft className="w-4 h-4" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="relative aspect-square mb-4 bg-white rounded-lg overflow-hidden">
            <Image
              src={product.images[selectedImage] || "/placeholder.jpg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative aspect-square border-2 rounded-lg overflow-hidden ${
                  selectedImage === idx ? "border-[#FF9900]" : "border-gray-200"
                }`}
              >
                <Image src={image} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating) ? "fill-[#FF9900] text-[#FF9900]" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-600">
              {product.rating.toFixed(1)} ({product.reviewCount} reviews)
            </span>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-4 mb-2">
              <span className="text-4xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <p className="text-green-600 font-semibold">In Stock ({product.stock} available)</p>
          </div>

          <p className="text-gray-700 mb-6">{product.description}</p>

          <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-3">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-[#FF9900]" />
              <span>Free shipping on orders over $50</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#FF9900]" />
              <span>30-day money-back guarantee</span>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] text-gray-900"
              />
            </div>
          </div>

          <button
            onClick={addToCart}
            disabled={isAdding || product.stock === 0}
            className="w-full bg-[#FF9900] hover:bg-[#FFB84D] text-white py-3 rounded-md font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-5 h-5" />
            {isAdding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Reviews */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          {session && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-[#FF9900] hover:bg-[#FFB84D] text-white px-4 py-2 rounded-md transition-colors"
            >
              Write a Review
            </button>
          )}
        </div>

        {showReviewForm && (
          <form onSubmit={submitReview} className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Rating</label>
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] text-gray-900"
              >
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} Stars
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                required
                value={reviewForm.title}
                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] text-gray-900"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Review</label>
              <textarea
                required
                rows={4}
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] text-gray-900"
              />
            </div>
            <button
              type="submit"
              className="bg-[#FF9900] hover:bg-[#FFB84D] text-white px-6 py-2 rounded-md transition-colors"
            >
              Submit Review
            </button>
          </form>
        )}

        <div className="space-y-4">
          {product.reviews.length > 0 ? (
            product.reviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? "fill-[#FF9900] text-[#FF9900]" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-semibold mb-2">{review.title}</h3>
                <p className="text-gray-700 mb-2">{review.comment}</p>
                <p className="text-sm text-gray-600">By {review.user.name}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
          )}
        </div>
      </div>

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
