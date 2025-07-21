"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { event } from '@/lib/gtag'
import { useThriveStack } from "@/components/ThriveStackProvider"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [thriveInitialized, setThriveInitialized] = useState(false)
  const router = useRouter()
  const { isReady, setUser, group } = useThriveStack()

  // Additional check for ThriveStack initialization
  useEffect(() => {
    if (isReady) {
      setThriveInitialized(true)
    }
  }, [isReady])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Form validation
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Save user data
      const user = { email, name }
      localStorage.setItem("user", JSON.stringify(user))
      
      // Prepare tracking data
      const timestamp = new Date().toISOString()
      const userId = email
      const accountId = `account_${email}`

      // Debug ThriveStack availability
      console.log("[DEBUG] ThriveStack status:", {
        isReady,
        thriveInitialized,
        windowExists: typeof window !== 'undefined',
        thrivestackExists: typeof window.thrivestack !== 'undefined'
      })

      // Track events if ThriveStack is available
      if (thriveInitialized && typeof window !== 'undefined' && window.thrivestack) {
        try {
          // 1. Set user data
          console.log("[DEBUG] Setting user data...")
          await setUser(userId, email, {
            user_name: name,
            signup_date: timestamp,
          })

          // 2. Create group/account
          console.log("[DEBUG] Setting group data...")
          await group({
            user_id: userId,
            group_id: accountId,
            group_name: `${name}'s Account`,
            properties: {
              plan_name: "Starter Plan",
              employee_count: 1,
            }
          })

          // 3. Track signup event
          console.log("[DEBUG] Tracking signup event...")
          window.thrivestack.track([{
            event_name: "signed_up",
            properties: {
              user_email: email,
              user_name: name,
              utm_campaign: "customer_success",
              utm_medium: "referral",
              utm_source: "twitter",
              utm_term: "free_trial"
            },
            user_id: userId,
            timestamp: timestamp
          }])

          // 4. Track account creation
          console.log("[DEBUG] Tracking account creation...")
          window.thrivestack.track([{
            event_name: "account_created",
            properties: {
              account_domain: window.location.hostname,
              account_id: accountId,
              account_name: `${name}'s Account`
            },
            user_id: userId,
            timestamp: timestamp,
            context: {
              group_id: accountId
            }
          }])

          // 5. Track user-company association
          console.log("[DEBUG] Tracking user-company association...")
          window.thrivestack.track([{
            event_name: "account_added_user",
            properties: {
              account_name: `${name}'s Account`,
              user_email: email
            },
            user_id: userId,
            timestamp: timestamp,
            context: {
              group_id: accountId
            }
          }])

          console.log("[DEBUG] All ThriveStack operations completed successfully")

        } catch (e) {
          console.error("[ERROR] ThriveStack tracking failed:", e)
          // Continue with form submission even if tracking fails
        }
      } else {
        console.warn("[WARNING] ThriveStack not initialized - skipping analytics")
      }

      // Redirect to dashboard
      router.push("/dashboard")

    } catch (err) {
      setError("Failed to create account")
      console.error("Signup error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-semibold text-xl">ProductHub</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Create your account</CardTitle>
            <CardDescription className="text-center">Start your 14-day free trial today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                onClick={() => {
                  event({
                    action: 'signup_submit',
                    category: 'User',
                    label: 'Signup Form Submission',
                  })
                }}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}