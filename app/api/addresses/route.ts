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

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: {
        isDefault: "desc",
      },
    })

    return NextResponse.json({ addresses })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
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

    const { fullName, street, city, state, zipCode, country, phone, isDefault } =
      await req.json()

    if (!fullName || !street || !city || !state || !zipCode || !country || !phone) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      })
    }

    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        fullName,
        street,
        city,
        state,
        zipCode,
        country,
        phone,
        isDefault: isDefault || false,
      },
    })

    return NextResponse.json({ address }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to create address" },
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

    const { id, ...data } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Address ID required" }, { status: 400 })
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      })
    }

    const address = await prisma.address.update({
      where: {
        id,
        userId: session.user.id,
      },
      data,
    })

    return NextResponse.json({ address })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to update address" },
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
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Address ID required" }, { status: 400 })
    }

    await prisma.address.delete({
      where: {
        id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: "Address deleted" })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    )
  }
}
