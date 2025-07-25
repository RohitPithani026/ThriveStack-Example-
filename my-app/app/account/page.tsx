"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { thriveStackTrack } from "@/lib/thrivestack" 
interface User {
  email: string
  name: string
  userId?: string 
}

export default function AccountSettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState("")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsed = JSON.parse(userData)
      setUser(parsed)
      setName(parsed.name)
    }
  }, [])

  const handleUpdate = () => {
    if (!user) return;

    // ✅ Simulate saving updated name (you can also call an API here)
    const updatedUser = { ...user, name }
    localStorage.setItem("user", JSON.stringify(updatedUser))
    setUser(updatedUser)
    setIsEditing(false)

    // ✅ ThriveStack tracking
    thriveStackTrack([
      {
        event_name: "profile_completed",
        user_id: user.userId || user.email,
        timestamp: new Date().toISOString(),
        properties: {
          section: "basic_info",
        },
        context: {
          group_id: "ac8db7ba-5139-4911-ba6e-523fd9c4704b", // 🔁 replace with real account ID
        },
      },
    ])

    console.log("✅ Profile updated and tracked")
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600">Manage your account preferences</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                readOnly={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={user.email}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                readOnly
              />
            </div>
            {isEditing ? (
              <Button onClick={handleUpdate}>Save Changes</Button>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
