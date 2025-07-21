import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, DollarSign, Users, Package } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  sales: number
}

window.thrivestack.track([{
        "event_name": "signed_up",
        "properties": {
            "user_email": "john.doe@acme.xyz",
            "user_name": "John Doe",
            "utm_campaign": "customer_success",
            "utm_medium": "referral",
            "utm_source": "twitter",
            "utm_term": "free_trial"
        },
        "user_id": "18f716ac-37a4-464f-adb7-3cc30032308c",
        "timestamp": "2025-07-21T07:58:57.375Z"
    }]);


export default function DashboardOverviewPage() {
  // Mock data for products (can be fetched from an API in a real app)
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
  ]

  const stats = [
    {
      title: "Total Revenue",
      value: "$12,345",
      change: "+12.5%",
      icon: DollarSign,
    },
    {
      title: "Total Sales",
      value: "546",
      change: "+8.2%",
      icon: TrendingUp,
    },
    {
      title: "Active Products",
      value: "12",
      change: "+2",
      icon: Package,
    },
    {
      title: "Customers",
      value: "1,234",
      change: "+15.3%",
      icon: Users,
    },
  ]

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back!</p> {/* User name will be handled by layout */}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.change}</p>
                </div>
                <stat.icon className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Products */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.slice(0, 4).map((product) => (
              <div key={product.id} className="border rounded-lg p-4">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded mb-3"
                />
                <h3 className="font-semibold text-sm mb-1">{product.name}</h3>
                <p className="text-lg font-bold text-blue-600">${product.price}</p>
                <p className="text-xs text-gray-500">{product.sales} sales</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
