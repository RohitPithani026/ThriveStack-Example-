"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { event } from "@/lib/gtag"

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  sales: number
}

export default function ProductsPage() {
  const products: Product[] = [
    {
      id: "1",
      name: "Ultimate Web Dev Bootcamp",
      price: 299,
      image: "/placeholder.svg?height=200&width=200",
      category: "Online Course",
      sales: 321,
    },
    {
      id: "2",
      name: "SaaS Landing Page Kit",
      price: 79,
      image: "/placeholder.svg?height=200&width=200",
      category: "UI Kit",
      sales: 185,
    },
    {
      id: "3",
      name: "E-commerce SEO Guide 2024",
      price: 49,
      image: "/placeholder.svg?height=200&width=200",
      category: "Ebook",
      sales: 450,
    },
    {
      id: "4",
      name: "Podcast Production Template",
      price: 39,
      image: "/placeholder.svg?height=200&width=200",
      category: "Template",
      sales: 112,
    },
    {
      id: "5",
      name: "AI Prompt Engineering Masterclass",
      price: 149,
      image: "/placeholder.svg?height=200&width=200",
      category: "Online Course",
      sales: 210,
    },
    {
      id: "6",
      name: "Social Media Content Calendar",
      price: 25,
      image: "/placeholder.svg?height=200&width=200",
      category: "Template",
      sales: 380,
    },
    {
      id: "7",
      name: "Digital Art Brush Pack Vol. 1",
      price: 15,
      image: "/placeholder.svg?height=200&width=200",
      category: "Digital Asset",
      sales: 560,
    },
    {
      id: "8",
      name: "Freelance Contract Bundle",
      price: 59,
      image: "/placeholder.svg?height=200&width=200",
      category: "Legal Templates",
      sales: 95,
    },
  ]

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your digital products</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-0">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{product.category}</Badge>
                  <span className="text-sm text-gray-500">{product.sales} sales</span>
                </div>
                <h3 className="font-semibold mb-2">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                  <Button onClick={() => {
                    console.log("CTA clicked");
                    event({
                      action: 'first_action',
                      category: 'Activation',
                      label: 'Visited Product',
                    });
                  }} size="sm">Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  )
}
