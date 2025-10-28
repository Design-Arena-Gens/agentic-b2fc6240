import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId, rating, title, comment } = await req.json()

    if (!productId || !rating || !title || !comment) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId,
        rating,
        title,
        comment,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Update product rating
    const reviews = await prisma.review.findMany({
      where: { productId },
    })

    const avgRating =
      reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: avgRating,
        reviewCount: reviews.length,
      },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error: any) {
    console.error(error)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    )
  }
}
