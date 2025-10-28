import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create demo user
  const hashedPassword = await hash('password123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: hashedPassword,
    },
  })

  console.log('Created user:', user.email)

  // Create products
  const products = [
    {
      name: 'Wireless Bluetooth Headphones',
      description: 'Premium noise-cancelling headphones with 30-hour battery life',
      price: 89.99,
      originalPrice: 129.99,
      category: 'Electronics',
      brand: 'Sony',
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
      stock: 50,
      rating: 4.5,
      reviewCount: 234,
      featured: true,
    },
    {
      name: 'Smart Watch Pro',
      description: 'Track your fitness and stay connected with this advanced smartwatch',
      price: 299.99,
      category: 'Electronics',
      brand: 'Apple',
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
      stock: 30,
      rating: 4.8,
      reviewCount: 567,
      featured: true,
    },
    {
      name: 'Running Shoes',
      description: 'Lightweight and comfortable running shoes for all terrains',
      price: 79.99,
      originalPrice: 99.99,
      category: 'Sports',
      brand: 'Nike',
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
      stock: 100,
      rating: 4.3,
      reviewCount: 189,
      featured: true,
    },
    {
      name: 'Leather Backpack',
      description: 'Stylish and durable leather backpack with laptop compartment',
      price: 129.99,
      category: 'Fashion',
      brand: 'Nike',
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'],
      stock: 45,
      rating: 4.6,
      reviewCount: 98,
      featured: true,
    },
    {
      name: '4K Ultra HD Smart TV',
      description: '55-inch 4K Smart TV with HDR and streaming apps',
      price: 499.99,
      originalPrice: 699.99,
      category: 'Electronics',
      brand: 'Samsung',
      images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500'],
      stock: 20,
      rating: 4.7,
      reviewCount: 432,
      featured: true,
    },
    {
      name: 'Yoga Mat Premium',
      description: 'Extra thick yoga mat with carrying strap',
      price: 29.99,
      category: 'Sports',
      brand: 'Adidas',
      images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500'],
      stock: 150,
      rating: 4.4,
      reviewCount: 76,
      featured: true,
    },
    {
      name: 'Coffee Maker Deluxe',
      description: 'Programmable coffee maker with thermal carafe',
      price: 89.99,
      category: 'Home & Garden',
      brand: 'LG',
      images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500'],
      stock: 60,
      rating: 4.2,
      reviewCount: 145,
      featured: true,
    },
    {
      name: 'Wireless Gaming Mouse',
      description: 'High-precision gaming mouse with RGB lighting',
      price: 59.99,
      category: 'Electronics',
      brand: 'Sony',
      images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500'],
      stock: 80,
      rating: 4.6,
      reviewCount: 213,
      featured: true,
    },
  ]

  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData,
    })
    console.log('Created product:', product.name)
  }

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
