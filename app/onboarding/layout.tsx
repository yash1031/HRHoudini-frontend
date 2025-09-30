import type React from "react"
import Link from "next/link"
import Image from "next/image"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Logo only header */}
      <header className="flex justify-center py-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/HR Houdini-Final.png"
            alt="/HR Houdini"
            width={200}
            height={40}
            priority
            className="h-8 w-auto"
          />
        </Link>
      </header>
      {children}
    </div>
  )
}
