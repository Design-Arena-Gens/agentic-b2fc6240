"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Trash2, Plus, Minus } from "lucide-react"

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    images: string[]
    stock: number
  }
}

export default function CartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      fetchCart()
    }
  }, [status, router])

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart")
      const data = await res.json()
      setCartItems(data.items || [])
    } catch (error) {
      console.error("Failed to fetch cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity }),
      })
      if (res.ok) {
        fetchCart()
      }
    } catch (error) {
      console.error("Failed to update quantity:", error)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart?itemId=${itemId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        fetchCart()
      }
    } catch (error) {
      console.error("Failed to remove item:", error)
    }
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )
  const tax = subtotal * 0.1
  const shipping = subtotal > 50 ? 0 : 9.99
  const total = subtotal + tax + shipping

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF9900]"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
          <Link
            href="/products"
            className="inline-block bg-[#FF9900] hover:bg-[#FFB84D] text-white px-6 py-3 rounded-md transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-4 flex gap-4">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={item.product.images[0] || "/placeholder.jpg"}
                    alt={item.product.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <Link
                    href={`/products/${item.product.id}`}
                    className="font-semibold text-lg hover:text-[#FF9900] block mb-2"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xl font-bold text-gray-900 mb-2">
                    ${item.product.price.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="p-1 border border-gray-300 rounded-md hover:bg-gray-100"
                      disabled={item.quantity === 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, Math.min(item.product.stock, item.quantity + 1))}
                      className="p-1 border border-gray-300 rounded-md hover:bg-gray-100"
                      disabled={item.quantity >= item.product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col justify-between items-end">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <p className="text-xl font-bold">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {subtotal < 50 && (
                  <p className="text-sm text-gray-600">
                    Add ${(50 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <Link
                href="/checkout"
                className="w-full block text-center bg-[#FF9900] hover:bg-[#FFB84D] text-white py-3 rounded-md font-semibold transition-colors"
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/products"
                className="w-full block text-center text-[#FF9900] hover:text-[#FFB84D] py-3 font-semibold"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
