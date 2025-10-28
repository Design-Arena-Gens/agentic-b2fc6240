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

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: true,
      },
    })

    return NextResponse.json({ items: cartItems })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to fetch cart" },
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

    const { productId, quantity } = await req.json()

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    })

    let cartItem

    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true },
      })
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId,
          quantity,
        },
        include: { product: true },
      })
    }

    return NextResponse.json({ item: cartItem })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const itemId = searchParams.get("itemId")

    if (!itemId) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 })
    }

    await prisma.cartItem.delete({
      where: {
        id: itemId,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: "Item removed from cart" })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to remove from cart" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { itemId, quantity } = await req.json()

    if (!itemId || !quantity || quantity < 1) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    const cartItem = await prisma.cartItem.update({
      where: {
        id: itemId,
        userId: session.user.id,
      },
      data: { quantity },
      include: { product: true },
    })

    return NextResponse.json({ item: cartItem })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    )
  }
}
