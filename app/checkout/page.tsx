"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Address {
  id: string
  fullName: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  isDefault: boolean
}

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState("")
  const [showNewAddress, setShowNewAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    phone: "",
  })
  const [cartTotal, setCartTotal] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAddresses()
    fetchCart()
  }, [])

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/addresses")
      const data = await res.json()
      setAddresses(data.addresses || [])
      const defaultAddr = data.addresses?.find((a: Address) => a.isDefault)
      if (defaultAddr) setSelectedAddress(defaultAddr.id)
    } catch (error) {
      console.error("Failed to fetch addresses:", error)
    }
  }

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart")
      const data = await res.json()
      const items = data.items || []
      const subtotal = items.reduce(
        (sum: number, item: any) => sum + item.product.price * item.quantity,
        0
      )
      const tax = subtotal * 0.1
      const shipping = subtotal > 50 ? 0 : 9.99
      setCartTotal(subtotal + tax + shipping)
    } catch (error) {
      console.error("Failed to fetch cart:", error)
    }
  }

  const handleNewAddress = async () => {
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      })
      const data = await res.json()
      if (res.ok) {
        setAddresses([...addresses, data.address])
        setSelectedAddress(data.address.id)
        setShowNewAddress(false)
      }
    } catch (error) {
      console.error("Failed to create address:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements || !selectedAddress) return

    setProcessing(true)
    setError("")

    try {
      // Create payment intent
      const piRes = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: cartTotal }),
      })
      const { clientSecret } = await piRes.json()

      // Confirm payment
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) return

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      )

      if (stripeError) {
        setError(stripeError.message || "Payment failed")
        return
      }

      // Create order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: selectedAddress,
          paymentMethod: "card",
          paymentIntentId: paymentIntent?.id,
        }),
      })

      if (orderRes.ok) {
        const { order } = await orderRes.json()
        router.push(`/orders/${order.id}`)
      }
    } catch (error) {
      setError("Something went wrong")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Shipping Address */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
        {addresses.length > 0 ? (
          <div className="space-y-2 mb-4">
            {addresses.map((addr) => (
              <label key={addr.id} className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:border-[#FF9900]">
                <input
                  type="radio"
                  name="address"
                  value={addr.id}
                  checked={selectedAddress === addr.id}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-semibold">{addr.fullName}</p>
                  <p className="text-gray-600">{addr.street}</p>
                  <p className="text-gray-600">
                    {addr.city}, {addr.state} {addr.zipCode}
                  </p>
                  <p className="text-gray-600">{addr.phone}</p>
                </div>
              </label>
            ))}
          </div>
        ) : null}

        {showNewAddress ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newAddress.fullName}
                onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Street Address</label>
              <input
                type="text"
                required
                value={newAddress.street}
                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] text-gray-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  required
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input
                  type="text"
                  required
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] text-gray-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ZIP Code</label>
              <input
                type="text"
                required
                value={newAddress.zipCode}
                onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                required
                value={newAddress.phone}
                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] text-gray-900"
              />
            </div>
            <button
              type="button"
              onClick={handleNewAddress}
              className="bg-[#FF9900] hover:bg-[#FFB84D] text-white px-4 py-2 rounded-md transition-colors"
            >
              Save Address
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowNewAddress(true)}
            className="text-[#FF9900] hover:text-[#FFB84D] font-semibold"
          >
            + Add New Address
          </button>
        )}
      </div>

      {/* Payment */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Payment Information</h2>
        <div className="border border-gray-300 rounded-md p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-4" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing || !selectedAddress}
        className="w-full bg-[#FF9900] hover:bg-[#FFB84D] text-white py-3 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? "Processing..." : `Pay $${cartTotal.toFixed(2)}`}
      </button>
    </form>
  )
}

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF9900]"></div>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  )
}
