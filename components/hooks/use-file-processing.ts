"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api/client"
import { connectWebSocket, addListener, closeWebSocket } from "@/lib/ws"
import { generateCardsFromParquet } from "@/utils/parquetLoader"
import { useDashboard } from "@/contexts/dashboard-context"
import { useUserContext } from "@/contexts/user-context"
import { Clock } from "lucide-react"

interface KpiItem {
  id: string
  label: string
  description: string
  icon: React.ElementType
  category: string
}

interface UseFileProcessingReturn {
  processFile: (file: File, columns: string[], rowCount: number) => Promise<void>
  uploadFileWithProgress: (url: string, file: File, contentType: string) => Promise<void>
}

export function useFileProcessing(
  setIsUploading: (value: boolean) => void,
  setError: (value: string | null) => void,
  setUploadProgress: (value: number) => void,
  setProcessedFile: (value: boolean) => void,
  setIsUploaded: (value: boolean) => void,
  hasFileUploadStarted: (value: boolean) => void
): UseFileProcessingReturn {
  const router = useRouter()
  const { setKpis } = useUserContext()
  const {
    setCardsState,
    setChartsState,
    setMetadata,
    setMessages,
    setRecommendedQuestions,
  } = useDashboard()

  // Upload file with progress tracking
  const uploadFileWithProgress = useCallback(
    (url: string, file: File, contentType: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.open("PUT", url, true)
        xhr.setRequestHeader("Content-Type", contentType)

        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 204) {
            console.log("✅ Upload succeeded!")
            resolve()
          } else {
            console.error(`❌ Upload failed: ${xhr.status} ${xhr.statusText}`)
            setError(`Upload failed: ${xhr.status} ${xhr.response || xhr.statusText}`)
            setIsUploading(false)
            reject(new Error(`Upload failed: ${xhr.status}`))
          }
        }

        xhr.onerror = () => {
          console.error("Network error during upload")
          setError("Network error during upload. Check browser console for details.")
          setIsUploading(false)
          reject(new Error("Network error during upload"))
        }

        xhr.onabort = () => {
          console.error("Upload was cancelled")
          setError("Upload was cancelled")
          setIsUploading(false)
          reject(new Error("Upload was cancelled"))
        }

        xhr.send(file)
      })
    },
    [setUploadProgress, setError, setIsUploading]
  )

  // Process file (upload + WebSocket handling)
  const processFile = useCallback(
    async (file: File, columns: string[], rowCount: number) => {
      let handler: (msg: any) => void = () => {}

      try {
        setIsUploading(true)
        setError(null) // Clear any previous errors
        hasFileUploadStarted(true)
        setUploadProgress(0)

        // Step 1: Get presigned URL
        let resPresignedURL
        try {
          resPresignedURL = await apiFetch("/api/file-upload/generate-presigned-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: file.name,
              fileType: file.type,
              userId: localStorage.getItem("user_id"),
              rowCount: rowCount.toString(),
            }),
          })
        } catch (error: any) {
          const parsed = JSON.parse(error.message)
          console.log("Error in generating pre-signed URL: ", parsed.error)
          setError(parsed.error)
          setIsUploading(false)
          return
        }

        const presignedURLData = await resPresignedURL.data
        setIsUploaded(true)
        setUploadProgress(20)

        const data = await presignedURLData
        const { uploadUrl, s3Key, sessionId } = data
        localStorage.setItem("s3Key", s3Key)
        localStorage.setItem("session_id", sessionId)
        connectWebSocket(data.sessionId, localStorage.getItem("user_id") || "")
        setCardsState((prev) => ({ ...prev, loading: true, error: null }))

        // Step 2: Upload file
        await uploadFileWithProgress(uploadUrl, file, file.type)
        setUploadProgress(40)

        // Step 3: Set up WebSocket handlers
        handler = async (msg: any) => {
          console.log("[WS] message received", msg)

          if (msg.event === "convert.ready") {
            console.log("[WS] message: CSV converted to parquet")
            localStorage.setItem("presigned-parquet-url", msg.payload.presigned_url)
            setUploadProgress(70)

            // Fetch suggested queries
            let responseSuggestedQueries
            try {
              responseSuggestedQueries = await apiFetch("/api/chat/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  question: null,
                  user_id: localStorage.getItem("user_id"),
                  session_id: localStorage.getItem("session_id"),
                }),
              })
            } catch (error) {
              console.log("Unable to fetch suggested queries", error)
            }

            if (responseSuggestedQueries) {
              const suggestedQueriesData = await responseSuggestedQueries.data
              console.log("SuggestionQuestionData received", suggestedQueriesData)
              setRecommendedQuestions(suggestedQueriesData.sample_questions)
            }
          }

          if (msg.event === "convert.failed") {
            console.log("[WS] message: CSV to parquet conversion failed")
            setError("Unable to process file. Please upload it again")
            setIsUploading(false)
            return
          }

          if (msg.event === "kpi.ready") {
            setCardsState({
              data: [],
              loading: false,
              error: null,
            })
            console.log("KPIs are ready")
            const items = Array.isArray(msg.payload) ? msg.payload : []
            const kpisWithIcons: KpiItem[] = items.map((item: any) => ({
              ...item,
              icon: Clock, // fallback
            }))

            setKpis(kpisWithIcons)
            setUploadProgress(100)
            // Set processed state immediately - navigation will happen in component via useEffect
            setProcessedFile(true)
            setIsUploading(false)
            hasFileUploadStarted(false)
            // Note: Navigation to success page is handled in the component via useEffect
            // This ensures state is properly updated before navigation
          }

          if (msg.event === "kpi.error") {
            console.log("[WS] message: Creating KPIs failed")
            setError("Unable to process file. Please upload it again")
            setIsUploading(false)
            return
          }

          if (msg.event === "global_queries.ready") {
            const parquetUrl = localStorage.getItem("presigned-parquet-url") || ""
            console.log("Global queries received for cards:", msg.payload.text)

            setCardsState((prev) => ({ ...prev, loading: true, error: null }))
            const cardsQueries = JSON.parse(msg.payload.text).summary_cards

            generateCardsFromParquet(cardsQueries, parquetUrl)
              .then((result: any) => {
                console.log("Updated cardsState:", JSON.stringify(result, null, 2))
                setCardsState({
                  loading: false,
                  error: null,
                  data: result.cards || [],
                })
              })
              .catch((error) => {
                console.error("Failed to generate cards:", error)
                setCardsState({
                  loading: false,
                  error: "Failed to generate KPI cards from data",
                  data: [],
                })
              })
          }

          if (msg.event === "global_queries.error") {
            console.error("Backend error in card generation:", msg.payload)
            setCardsState({
              loading: false,
              error: msg.payload?.message || "Backend error generating cards",
              data: [],
            })
          }
        }

        addListener(handler, "file-upload-handler")
      } catch (err) {
        console.error("=== FILE PROCESSING ERROR ===")
        console.error("Error details:", err)
        setError("Failed to process file. Please try again.")
        setTimeout(() => {
          setError(null)
        }, 3000)
        setIsUploading(false)
        console.error("File processing error:", err)
        closeWebSocket()
      }
    },
    [
      setIsUploading,
      setError,
      setUploadProgress,
      setProcessedFile,
      setIsUploaded,
      hasFileUploadStarted,
      uploadFileWithProgress,
      router,
      setKpis,
      setCardsState,
      setRecommendedQuestions,
    ]
  )

  return {
    processFile,
    uploadFileWithProgress,
  }
}
