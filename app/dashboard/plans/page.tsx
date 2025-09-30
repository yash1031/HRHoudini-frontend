"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Check, X, Star, Zap, Building2, Crown } from "lucide-react"
import { useUserContext } from "@/contexts/user-context"
import Link from "next/link"

export default function PlansPage() {
  const { user } = useUserContext()
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      id: "freemium",
      name: "Freemium",
      description: "All features to drive stickiness",
      icon: Star,
      price: { monthly: 0, annual: 0 },
      duration: "Token-based usage",
      popular: false,
      current: true,
      features: [
        { name: "All core features included", included: true },
        { name: "AI chat messages", included: true },
        { name: "File uploads", included: true },
        { name: "Basic analytics", included: true },
        { name: "Email support", included: true },
        { name: "Custom reports", included: false },
        { name: "API access", included: false },
        { name: "Priority support", included: false },
        { name: "Advanced integrations", included: false },
      ],
      cta: "Current Plan",
      ctaVariant: "secondary" as const,
    },
    {
      id: "starter",
      name: "Starter",
      description: "Perfect for small teams getting started",
      icon: Zap,
      price: { monthly: 49.99, annual: 39.99 },
      duration: isAnnual ? "per month, billed annually" : "per month",
      popular: true,
      current: false,
      features: [
        { name: "500 AI chat messages", included: true },
        { name: "50 file uploads", included: true },
        { name: "All core analytics features", included: true },
        { name: "Data export capabilities", included: true },
        { name: "Priority email support", included: true },
        { name: "Basic integrations (HRIS, ATS)", included: true },
        { name: "Custom reports", included: false },
        { name: "API access", included: false },
        { name: "Phone support", included: false },
      ],
      cta: "Upgrade to Starter",
      ctaVariant: "default" as const,
    },
    {
      id: "professional",
      name: "Professional",
      description: "For growing companies with advanced needs",
      icon: Building2,
      price: { monthly: 149.99, annual: 119.99 },
      duration: isAnnual ? "per month, billed annually" : "per month",
      popular: false,
      current: false,
      features: [
        { name: "1,000 AI chat messages", included: true },
        { name: "50 file uploads", included: true },
        { name: "All Starter features", included: true },
        { name: "Custom Reports (AI Agent Report Writer)", included: true, note: "Coming soon" },
        { name: "Advanced workflow automation", included: true },
        { name: "Phone & chat support", included: true },
        { name: "Advanced integrations", included: true },
        { name: "Custom branding", included: true },
        { name: "API access", included: false },
      ],
      cta: "Upgrade to Professional",
      ctaVariant: "outline" as const,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For large organizations with complex requirements",
      icon: Crown,
      price: { monthly: "Custom", annual: "Custom" },
      duration: "tailored to your needs",
      popular: false,
      current: false,
      features: [
        { name: "Unlimited AI chat messages", included: true },
        { name: "Unlimited file uploads", included: true },
        { name: "All Professional features", included: true },
        { name: "API Access", included: true, note: "Coming soon" },
        { name: "Custom integrations", included: true },
        { name: "Advanced security & compliance", included: true },
        { name: "24/7 priority support", included: true },
        { name: "Dedicated account manager", included: true },
        { name: "SSO authentication", included: true },
      ],
      cta: "Contact Sales",
      ctaVariant: "outline" as const,
    },
  ]

  const formatPrice = (price: number | string) => {
    if (typeof price === "string") return price
    return `$${price}`
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 mb-8">Scale your HR analytics capabilities as your organization grows</p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm font-medium ${!isAnnual ? "text-gray-900" : "text-gray-500"}`}>Monthly</span>
          <Switch checked={isAnnual} onCheckedChange={setIsAnnual} className="data-[state=checked]:bg-blue-600" />
          <span className={`text-sm font-medium ${isAnnual ? "text-gray-900" : "text-gray-500"}`}>Annual</span>
          <Badge variant="secondary" className="bg-green-100 text-green-800 ml-2">
            Save 20%
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon
          const price = isAnnual ? plan.price.annual : plan.price.monthly

          return (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular
                  ? "border-blue-500 shadow-lg scale-105"
                  : plan.current
                    ? "border-orange-300 bg-orange-50"
                    : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-3 py-1">Most Popular</Badge>
                </div>
              )}

              {plan.current && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-orange-600 text-white px-3 py-1">Current Plan</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div
                    className={`p-3 rounded-full ${
                      plan.popular ? "bg-blue-100" : plan.current ? "bg-orange-100" : "bg-gray-100"
                    }`}
                  >
                    <Icon
                      className={`h-6 w-6 ${
                        plan.popular ? "text-blue-600" : plan.current ? "text-orange-600" : "text-gray-600"
                      }`}
                    />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-sm text-gray-600 mb-4">{plan.description}</CardDescription>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPrice(price)}
                    {typeof price === "number" && price > 0 && (
                      <span className="text-lg font-normal text-gray-600">/month</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{plan.duration}</div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-blue-600 hover:bg-blue-700"
                      : plan.current
                        ? "bg-orange-600 hover:bg-orange-700"
                        : ""
                  }`}
                  variant={plan.ctaVariant}
                  disabled={plan.current}
                  asChild={!plan.current}
                >
                  {plan.current ? (
                    plan.cta
                  ) : plan.id === "enterprise" ? (
                    <Link href="/contact">{plan.cta}</Link>
                  ) : (
                    <Link href={`/dashboard/checkout?plan=${plan.id}`}>{plan.cta}</Link>
                  )}
                </Button>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-900 uppercase tracking-wide">Features</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <span className={`text-sm ${feature.included ? "text-gray-900" : "text-gray-500"}`}>
                            {feature.name}
                          </span>
                          {feature.note && <span className="text-xs text-blue-600 ml-2 italic">({feature.note})</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* FAQ Section */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Can I change plans anytime?</h3>
            <p className="text-gray-600 text-sm">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 mb-2">What happens to my data if I downgrade?</h3>
            <p className="text-gray-600 text-sm">
              Your data is always preserved. Some features may become unavailable until you upgrade again.
            </p>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
            <p className="text-gray-600 text-sm">
              We offer a 30-day money-back guarantee for all paid plans. No questions asked.
            </p>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Is there a setup fee?</h3>
            <p className="text-gray-600 text-sm">
              No setup fees for any plan. You only pay the monthly or annual subscription fee.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="mt-12 text-center bg-gray-50 rounded-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Need help choosing?</h3>
        <p className="text-gray-600 mb-6">Our team is here to help you find the perfect plan for your organization.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/contact">Schedule a Demo</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">Contact Sales</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
