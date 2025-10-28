"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { ShoppingCart, Search, Menu, User, Package } from "lucide-react"

export default function Navbar() {
  const { data: session } = useSession()
  const [cartCount, setCartCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetchCartCount()
    }
  }, [session])

  const fetchCartCount = async () => {
    try {
      const res = await fetch("/api/cart")
      const data = await res.json()
      setCartCount(data.items?.length || 0)
    } catch (error) {
      console.error("Failed to fetch cart count:", error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-[#FF9900] hover:text-[#FFB84D] transition-colors">
            ShopHub
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="flex w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-4 py-2 rounded-l-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
                aria-label="Search products"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-[#FF9900] hover:bg-[#FFB84D] rounded-r-md transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/products" className="hover:text-[#FF9900] transition-colors">
              Products
            </Link>
            {session?.user ? (
              <>
                <Link href="/orders" className="hover:text-[#FF9900] transition-colors flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Orders
                </Link>
                <Link href="/account" className="hover:text-[#FF9900] transition-colors flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Account
                </Link>
                <Link href="/cart" className="hover:text-[#FF9900] transition-colors relative">
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#FF9900] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="hover:text-[#FF9900] transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-[#FF9900] transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-[#FF9900] hover:bg-[#FFB84D] px-4 py-2 rounded-md transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden py-2">
          <div className="flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-4 py-2 rounded-l-md text-gray-900 focus:outline-none"
              aria-label="Search products"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#FF9900] rounded-r-md"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              href="/products"
              className="block hover:text-[#FF9900] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            {session?.user ? (
              <>
                <Link
                  href="/orders"
                  className="block hover:text-[#FF9900] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Orders
                </Link>
                <Link
                  href="/account"
                  className="block hover:text-[#FF9900] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Account
                </Link>
                <Link
                  href="/cart"
                  className="block hover:text-[#FF9900] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cart ({cartCount})
                </Link>
                <button
                  onClick={() => {
                    signOut()
                    setMobileMenuOpen(false)
                  }}
                  className="block hover:text-[#FF9900] transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block hover:text-[#FF9900] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block hover:text-[#FF9900] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
