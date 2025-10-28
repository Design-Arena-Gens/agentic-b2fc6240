import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const brand = searchParams.get("brand") || ""
    const minPrice = parseFloat(searchParams.get("minPrice") || "0")
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "999999")
    const minRating = parseFloat(searchParams.get("minRating") || "0")
    const featured = searchParams.get("featured") === "true"
    const limit = parseInt(searchParams.get("limit") || "20")
    const page = parseInt(searchParams.get("page") || "1")

    const where: any = {
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
      rating: {
        gte: minRating,
      },
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category) {
      where.category = category
    }

    if (brand) {
      where.brand = brand
    }

    if (featured) {
      where.featured = true
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}
