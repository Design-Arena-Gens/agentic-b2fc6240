import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { addressId, paymentMethod, paymentIntentId } = await req.json()

    if (!addressId || !paymentMethod) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true },
    })

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    // Calculate totals
    const subtotal = cartItems.reduce(
      (sum: number, item: any) => sum + item.product.price * item.quantity,
      0
    )
    const tax = subtotal * 0.1 // 10% tax
    const shipping = subtotal > 50 ? 0 : 9.99
    const total = subtotal + tax + shipping

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        orderNumber,
        subtotal,
        tax,
        shipping,
        total,
        addressId,
        paymentMethod,
        paymentIntentId,
        status: "processing",
        items: {
          create: cartItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
      },
    })

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id },
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}
