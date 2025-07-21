"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { event } from '@/lib/gtag';
import { useThriveStack } from "@/components/ThriveStackProvider"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { isReady, setUser, group } = useThriveStack();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const user = { email, name };
      localStorage.setItem("user", JSON.stringify(user));
      const timestamp = new Date().toISOString();
      const userId = email;
      const accountId = "account_" + email;

      // Debug ThriveStack availability
      console.log("[DEBUG] Checking ThriveStack availability:", {
        exists: typeof window.thrivestack !== 'undefined',
        hasTrack: window.thrivestack?.track ? true : false,
        hasSetUser: window.thrivestack?.setUser ? true : false,
        hasGroup: window.thrivestack?.group ? true : false
      });

      if (isReady && typeof window !== "undefined" && window.thrivestack) {
        try {
          // 1. Track user signup
          const signupEvent = {
            "event_name": "signed_up",
            "properties": {
              "user_email": email,
              "user_name": name,
              "utm_campaign": "customer_success",
              "utm_medium": "referral",
              "utm_source": "twitter",
              "utm_term": "free_trial"
            },
            "user_id": userId,
            "timestamp": timestamp
          };
          
          console.log("[DEBUG] Sending signup event to ThriveStack:", signupEvent);
          window.thrivestack.track([signupEvent]);

          // 2. Track account creation
          const accountEvent = {
            "event_name": "account_created",
            "properties": {
              "account_domain": window.location.hostname,
              "account_id": accountId,
              "account_name": name + "'s Account"
            },
            "user_id": userId,
            "timestamp": timestamp,
            "context": {
              "group_id": accountId  // Matches account_id
            }
          };
          
          console.log("[DEBUG] Sending account creation to ThriveStack:", accountEvent);
          window.thrivestack.track([accountEvent]);

          // 3. Track user-company association
          const userCompanyEvent = {
            "event_name": "account_added_user",
            "properties": {
              "account_name": name + "'s Account",
              "user_email": email
            },
            "user_id": userId,
            "timestamp": timestamp,
            "context": {
              "group_id": accountId
            }
          };
          
          console.log("[DEBUG] Sending user-company association to ThriveStack:", userCompanyEvent);
          window.thrivestack.track([userCompanyEvent]);

          // 4. Set user data in ThriveStack
          console.log("[DEBUG] Attempting to set user data in ThriveStack:", {
            userId: userId,
            userEmail: email
          });
          window.thrivestack.setUser(email, email, {
            user_name: name,
            signup_date: timestamp,
          });
          console.log("[DEBUG] Successfully set user data in ThriveStack");

          // 5. Set group data in ThriveStack
          const groupName = name + "'s Account";
          const groupDomain = window.location.hostname;
          
          console.log("[DEBUG] Attempting to set group data in ThriveStack:", {
            groupId: accountId,
            groupDomain: groupDomain,
            groupName: groupName
          });
          window.thrivestack.group({
            user_id: email,
            group_id: accountId,
            group_name: groupName,
            properties: {
              plan_name: "Starter Plan",
              employee_count: 1,
            },
          });
          console.log("[DEBUG] Successfully set group data in ThriveStack");

          console.log("[DEBUG] All ThriveStack operations completed successfully");

        } catch (e) {
          console.error("[DEBUG] ThriveStack operation error:", e);
        }
      } else {
        console.warn("[DEBUG] ThriveStack not available for tracking");
      }
      
      router.push("/dashboard");
    } catch (err) {
      setError("Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

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

              <Button onClick={() => {
                console.log("CTA clicked");
                event({
                  action: 'dashboard_visit',
                  category: 'User',
                  label: 'Initial Dashboard Load',
                });
              }} type="submit" className="w-full" disabled={isLoading}>
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