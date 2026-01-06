"use client"

import { useState, useCallback, useEffect } from "react"
import Papa from "papaparse"
import * as XLSX from "xlsx"

interface FileMetadata {
  name: string
  size: number
  type: string
  lastModified: number
  rowCount?: number
  columns?: string[]
  dataType?: string
}

interface UseFileUploadReturn {
  parseFile: (file: File) => Promise<{ columns: string[]; rowCount: number; data?: any[] }>
  validateHRHeaders: (
    headers: string[],
    minMatchRatio?: number
  ) => {
    isValid: boolean
    matchRatio: number
    matchedCount: number
    totalCount: number
    matchedHeaders: Array<{
      original: string
      normalized: string
      matchedPattern: string
    }>
    normalizedHeaders: string[]
    error: string
  }
  hrHeadersList: string[]
}

export function useFileUpload(): UseFileUploadReturn {
  const [hrHeadersList, setHrHeadersList] = useState<string[]>([])

  // Load HR headers on mount
  useEffect(() => {
    fetch("/hr-headers.json")
      .then((res) => res.json())
      .then((data) => setHrHeadersList(data))
      .catch((err) => console.error("Failed to load HR headers list:", err))
  }, [])

  // Normalize header - remove all spaces and special characters
  const normalizeHeader = (header: string): string => {
    return header
      .toLowerCase()
      .trim()
      .replace(/[-_\s]+/g, "") // Remove hyphens, underscores, and spaces
      .replace(/[^a-z0-9]/g, "") // Remove all special characters
      .trim()
  }

  // Check if headers are actually data rows
  const areHeadersActuallyData = (headers: string[]): { isData: boolean; reason: string } => {
    for (const header of headers) {
      const normalized = header.trim()

      // Email addresses
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
        return {
          isData: true,
          reason: `Found email address "${normalized}" in first row - file appears to lack headers.`,
        }
      }

      // Date patterns
      if (/^\d{1,4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,4}$/.test(normalized)) {
        return {
          isData: true,
          reason: `Found date value "${normalized}" in first row - file appears to lack headers.`,
        }
      }

      // Phone numbers
      if (/^[\+\(]?\d{1,4}[\)\-\.\s]?\d{3}[\-\.\s]?\d{3,4}[\-\.\s]?\d{4}$/.test(normalized)) {
        return {
          isData: true,
          reason: `Found phone number "${normalized}" in first row - file appears to lack headers.`,
        }
      }

      // Large numbers (likely salary or ID)
      if (/^\d{5,}$/.test(normalized)) {
        return {
          isData: true,
          reason: `Found large numeric value "${normalized}" in first row - file appears to lack headers.`,
        }
      }

      // Decimal numbers
      if (/^\d+\.\d+$/.test(normalized)) {
        return {
          isData: true,
          reason: `Found decimal number "${normalized}" in first row - file appears to lack headers.`,
        }
      }

      // ISO Date
      if (/^\d{4}-?\d{2}-?\d{2}$/.test(normalized)) {
        return {
          isData: true,
          reason: `Found ISO date "${normalized}" in first row - file appears to lack headers.`,
        }
      }
    }

    return { isData: false, reason: "" }
  }

  // Parse file (CSV or Excel)
  const parseFile = useCallback(
    (file: File): Promise<{ columns: string[]; rowCount: number; data?: any[] }> => {
      return new Promise((resolve, reject) => {
        const fileExtension = file.name.split(".").pop()?.toLowerCase()

        if (fileExtension === "csv") {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const columns = results.meta.fields || []

              const nonEmptyRows = results.data.filter((row: any) => {
                return Object.values(row).some(
                  (value) => value !== null && value !== undefined && value !== "" && String(value).trim() !== ""
                )
              })

              const rowCount = nonEmptyRows.length
              resolve({ columns, rowCount, data: nonEmptyRows })
            },
            error: (err) => reject(err),
          })
        } else if (fileExtension === "xlsx" || fileExtension === "xls") {
          const reader = new FileReader()
          reader.onload = (e) => {
            try {
              const data = new Uint8Array(e.target?.result as ArrayBuffer)
              const workbook = XLSX.read(data, { type: "array" })
              const sheetName = workbook.SheetNames[0]
              const worksheet = workbook.Sheets[sheetName]
              const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

              const [headers, ...rows] = jsonData
              const columns = (headers as string[]) || []

              const nonEmptyRows = rows.filter((row: any) => {
                return Array.isArray(row) && row.some((cell) => cell !== null && cell !== undefined && cell !== "" && String(cell).trim() !== "")
              })

              const dataRows = nonEmptyRows.map((row: any) => {
                const rowObj: any = {}
                columns.forEach((col, index) => {
                  rowObj[col] = row[index] || ""
                })
                return rowObj
              })

              const rowCount = nonEmptyRows.length
              resolve({ columns, rowCount, data: dataRows })
            } catch (err) {
              reject(err)
            }
          }
          reader.onerror = () => reject(reader.error)
          reader.readAsArrayBuffer(file)
        } else {
          reject(new Error("Unsupported file format. Please upload a CSV or XLSX file."))
        }
      })
    },
    []
  )

  // Validate HR headers
  const validateHRHeaders = useCallback(
    (
      headers: string[],
      minMatchRatio: number = 0.7
    ): {
      isValid: boolean
      matchRatio: number
      matchedCount: number
      totalCount: number
      matchedHeaders: Array<{
        original: string
        normalized: string
        matchedPattern: string
      }>
      normalizedHeaders: string[]
      error: string
    } => {
      // First check if these are actually data rows, not headers
      const { isData, reason } = areHeadersActuallyData(headers)
      if (isData) {
        return {
          isValid: false,
          matchRatio: 0,
          matchedCount: 0,
          totalCount: headers.length,
          matchedHeaders: [],
          normalizedHeaders: [],
          error: reason,
        }
      }

      // Wait for HR headers list to load
      if (hrHeadersList.length === 0) {
        return {
          isValid: false,
          matchRatio: 0,
          matchedCount: 0,
          totalCount: headers.length,
          matchedHeaders: [],
          normalizedHeaders: [],
          error: "HR headers list is still loading. Please try again.",
        }
      }

      // Normalize all headers
      const normalizedHeaders = headers.map((header) => normalizeHeader(header))
      const matchedHeaders: Array<{
        original: string
        normalized: string
        matchedPattern: string
      }> = []

      // Check each normalized header against HR headers list
      normalizedHeaders.forEach((normalizedHeader, index) => {
        const matchedPattern = hrHeadersList.find(
          (hrHeader) =>
            normalizedHeader === hrHeader || normalizedHeader.includes(hrHeader) || hrHeader.includes(normalizedHeader)
        )

        if (matchedPattern) {
          matchedHeaders.push({
            original: headers[index],
            normalized: normalizedHeader,
            matchedPattern: matchedPattern,
          })
        }
      })

      const matchedCount = matchedHeaders.length
      const totalCount = headers.length
      const matchRatio = totalCount > 0 ? matchedCount / totalCount : 0
      const isValid = matchRatio >= minMatchRatio

      return {
        isValid,
        matchRatio,
        matchedCount,
        totalCount,
        matchedHeaders,
        normalizedHeaders,
        error: isValid ? "" : `This doesn't appear to be an HR data file. Please upload a file with HR data.`,
      }
    },
    [hrHeadersList]
  )

  return {
    parseFile,
    validateHRHeaders,
    hrHeadersList,
  }
}
