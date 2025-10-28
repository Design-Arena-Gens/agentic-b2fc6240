import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import Navbar from "@/components/Navbar";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: "ShopHub - Your Premier E-Commerce Destination",
  description: "Shop the best products with secure checkout and fast shipping",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${openSans.variable} font-sans antialiased bg-gray-50`}>
        <SessionProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <footer className="bg-gray-900 text-white py-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p>&copy; 2025 ShopHub. All rights reserved.</p>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
