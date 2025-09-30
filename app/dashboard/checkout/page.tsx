"use client"

import type React from "react"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, CreditCard, Lock, Check, ArrowLeft } from "lucide-react"
import { useUserContext } from "@/contexts/user-context"
import Link from "next/link"

export default function CheckoutPage() {
  const { user } = useUserContext()
  const searchParams = useSearchParams()
  const [isAnnual, setIsAnnual] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Get plan from URL params, default to starter
  const planId = searchParams.get("plan") || "starter"

  const plans = {
    starter: {
      name: "Starter",
      description: "For small teams getting serious about HR analytics",
      price: { monthly: 49.99, annual: 39.99 },
      features: [
        "Up to 5 team members",
        "Advanced analytics & insights",
        "Data export capabilities",
        "Priority email support",
        "Basic integrations (HRIS, ATS)",
      ],
    },
    professional: {
      name: "Professional",
      description: "For growing companies with advanced HR needs",
      price: { monthly: 149.99, annual: 119.99 },
      features: [
        "Up to 25 team members",
        "Advanced workflow automation",
        "Custom reporting & dashboards",
        "Phone & chat support",
        "Advanced integrations",
        "Custom branding",
        "API access",
      ],
    },
  }

  const selectedPlan = plans[planId as keyof typeof plans] || plans.starter
  const price = isAnnual ? selectedPlan.price.annual : selectedPlan.price.monthly
  const annualSavings = (selectedPlan.price.monthly * 12 - selectedPlan.price.annual * 12).toFixed(2)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Redirect to success page
    window.location.href = "/dashboard/checkout/success"
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/plans"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Complete Your Upgrade</h1>
        <p className="text-gray-600 mt-2">Secure checkout powered by industry-leading encryption</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Plan Details */}
              <div>
                <h3 className="font-semibold text-lg">{selectedPlan.name} Plan</h3>
                <p className="text-sm text-gray-600 mb-4">{selectedPlan.description}</p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={isAnnual}
                      onCheckedChange={setIsAnnual}
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <span className="text-sm font-medium">Annual billing</span>
                  </div>
                  {isAnnual && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Save ${annualSavings}
                    </Badge>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-900">Included features:</h4>
                  <ul className="space-y-1">
                    {selectedPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Separator />

              {/* Pricing Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    {selectedPlan.name} Plan ({isAnnual ? "Annual" : "Monthly"})
                  </span>
                  <span className="font-medium">${price}/month</span>
                </div>

                {isAnnual && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Billed annually</span>
                    <span className="text-gray-600">${(price * 12).toFixed(2)}/year</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total {isAnnual ? "(billed annually)" : "(monthly)"}</span>
                  <span>${isAnnual ? (price * 12).toFixed(2) : price.toFixed(2)}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Lock className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">256-bit SSL encryption</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
              <CardDescription>Your payment information is secure and encrypted</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Billing Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Billing Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="Maya" required />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Jackson" required />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user?.email || "maya.jackson@healthserv.com"}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="company">Company Name</Label>
                    <Input id="company" defaultValue={user?.company || "HealthServ Solutions"} required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" required />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ca">California</SelectItem>
                          <SelectItem value="ny">New York</SelectItem>
                          <SelectItem value="tx">Texas</SelectItem>
                          <SelectItem value="fl">Florida</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input id="zip" required />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Select defaultValue="us" required>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="ca">Canada</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Payment Method */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Payment Method</h3>

                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" required />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" required />
                    </div>
                    <div>
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input id="cardName" defaultValue="Maya Jackson" required />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                      required
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                      I agree to the{" "}
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox id="marketing" />
                    <Label htmlFor="marketing" className="text-sm leading-relaxed">
                      I would like to receive product updates and marketing communications
                    </Label>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  disabled={!agreedToTerms || isProcessing}
                >
                  {isProcessing
                    ? "Processing..."
                    : `Complete Purchase - $${isAnnual ? (price * 12).toFixed(2) : price.toFixed(2)}`}
                </Button>

                {/* Security Notice */}
                <div className="text-center text-sm text-gray-600">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>Your payment is secured with 256-bit SSL encryption</span>
                  </div>
                  <p>We never store your payment information on our servers</p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
