"use client"

import { redirect } from "next/navigation"

/**
 * Check if user has processed file before accessing success page
 */
export function checkProcessedFileGuard(): boolean {
  if (typeof window === "undefined") return false
  
  const processed = localStorage.getItem("upload_processed")
  const uploaded = localStorage.getItem("upload_is_uploaded")
  
  return processed === "true" && uploaded === "true"
}

/**
 * Redirect if file not processed
 */
export function requireProcessedFile() {
  if (!checkProcessedFileGuard()) {
    redirect("/upload/upload-file")
  }
}
