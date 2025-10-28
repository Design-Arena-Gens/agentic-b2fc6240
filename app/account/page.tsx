"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { User, MapPin, Package } from "lucide-react"
import Link from "next/link"

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

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      fetchAddresses()
    }
  }, [status, router])

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/addresses")
      const data = await res.json()
      setAddresses(data.addresses || [])
    } catch (error) {
      console.error("Failed to fetch addresses:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return

    try {
      const res = await fetch(`/api/addresses?id=${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        fetchAddresses()
      }
    } catch (error) {
      console.error("Failed to delete address:", error)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF9900]"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/account"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
        >
          <User className="w-12 h-12 text-[#FF9900] mb-4" />
          <h2 className="text-xl font-bold mb-2">Profile</h2>
          <p className="text-gray-600">Manage your account settings</p>
        </Link>
        <Link
          href="/orders"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
        >
          <Package className="w-12 h-12 text-[#FF9900] mb-4" />
          <h2 className="text-xl font-bold mb-2">Orders</h2>
          <p className="text-gray-600">View your order history</p>
        </Link>
        <div className="bg-white rounded-lg shadow-md p-6">
          <MapPin className="w-12 h-12 text-[#FF9900] mb-4" />
          <h2 className="text-xl font-bold mb-2">Addresses</h2>
          <p className="text-gray-600">Manage shipping addresses</p>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <p className="text-lg">{session?.user?.name || "Not provided"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-lg">{session?.user?.email}</p>
          </div>
        </div>
      </div>

      {/* Saved Addresses */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Saved Addresses</h2>
          <Link
            href="/checkout"
            className="bg-[#FF9900] hover:bg-[#FFB84D] text-white px-4 py-2 rounded-md transition-colors"
          >
            Add New Address
          </Link>
        </div>
        {addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                {address.isDefault && (
                  <span className="inline-block bg-[#FF9900] text-white text-xs px-2 py-1 rounded mb-2">
                    Default
                  </span>
                )}
                <p className="font-semibold">{address.fullName}</p>
                <p className="text-gray-600">{address.street}</p>
                <p className="text-gray-600">
                  {address.city}, {address.state} {address.zipCode}
                </p>
                <p className="text-gray-600">{address.country}</p>
                <p className="text-gray-600">{address.phone}</p>
                <button
                  onClick={() => deleteAddress(address.id)}
                  className="text-red-500 hover:text-red-700 text-sm mt-2"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No saved addresses</p>
        )}
      </div>
    </div>
  )
}
