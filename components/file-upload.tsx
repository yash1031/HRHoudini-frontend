"use client"

import { useState, useCallback, useEffect, Dispatch, SetStateAction, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react"
import { useDashboard } from '@/contexts/dashboard-context';
import { useUpload } from "@/contexts/upload-context"
import { useUserContext } from "@/contexts/user-context"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import { apiFetch } from "@/lib/api/client";


interface FileUploadProps {
  // onFileUpload: (file: File, metadata: any) => void
  acceptedTypes?: string[]
  maxSize?: number
  title?: string
  description?: string
  hasFileUploadStarted: (args: boolean) => void
  onBrowseFiles?: () => void
  hasFileDropped: (args: boolean) => void
  isUploading: boolean
  error: string | null
  setError: Dispatch<SetStateAction<string | null>>
  processedFile: boolean
  uploadProgress: number
  proceedToUpload?: boolean
  onboardingMode?: boolean
  userContext?: any
  scenarioConfig?: any
  isUploaded: boolean
}

interface FileMetadata {
  name: string
  size: number
  type: string
  lastModified: number
  rowCount?: number
  columns?: string[]
  dataType?: string
}

interface KpiItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType; // since you're storing component references like TrendingDown
  category: string;
}

export function FileUpload({
  // onFileUpload,
  acceptedTypes = [".csv", ".xlsx", ".xls"],
  maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || "1", 10) * 1024 * 1024, // 10MB
  title = "Upload HR Data File",
  description = "Drag and drop your HR data file here, or click to browse",
  onBrowseFiles,
  hasFileUploadStarted,
  hasFileDropped,
  isUploading,
  error,
  setError,
  uploadProgress,
  processedFile,
  proceedToUpload,
  onboardingMode,
  userContext,
  isUploaded
  // scenarioConfig,
}: FileUploadProps) {
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null)
  const [fileDropped, setFileDropped]= useState(false);
  const errorRef = useRef<string | null>(null);
  const metadataRestoredRef = useRef(false)
  const { uploadedFile, setUploadedFile } = useUpload()
  const { setMetadata} = useDashboard();

  // Restore fileMetadata from uploadedFile when component mounts or uploadedFile changes
  // This handles browser back/forward navigation where state is restored from localStorage
  useEffect(() => {
    if (uploadedFile && uploadedFile.metadata) {
      // Restore fileMetadata from uploadedFile.metadata (for browser navigation)
      setFileMetadata((current) => {
        // Only update if different to avoid unnecessary re-renders
        if (!current || current.name !== uploadedFile.metadata.name) {
          return uploadedFile.metadata
        }
        return current
      })
      
      // Also restore fileDropped state if file is processed
      if (processedFile && isUploaded) {
        setFileDropped(true)
      }
      
      metadataRestoredRef.current = true
    } else if (!uploadedFile) {
      // Clear fileMetadata if uploadedFile is cleared
      setFileMetadata(null)
      setFileDropped(false)
      metadataRestoredRef.current = false
    }
  }, [uploadedFile, processedFile, isUploaded]) // Don't include fileMetadata/fileDropped to avoid loops

  const parseFile = (file: File): Promise<{ columns: string[]; rowCount: number; data?: any[] }> => {
  return new Promise((resolve, reject) => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase()

    if (fileExtension === "csv") {
      // Parse CSV files
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const columns = results.meta.fields || []
          
          // Filter out rows that are completely empty (all values are null, undefined, or empty strings)
          const nonEmptyRows = results.data.filter((row: any) => {
            return Object.values(row).some(value => 
              value !== null && 
              value !== undefined && 
              value !== ""
            )
          })
          
          resolve({
            columns,
            rowCount: nonEmptyRows.length,
            data: nonEmptyRows,
          })
        },
        error: (error) => {
          reject(error)
        },
      })
    } else if (fileExtension === "xlsx" || fileExtension === "xls") {
      // Parse Excel files
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: "array" })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

          if (jsonData.length === 0) {
            resolve({ columns: [], rowCount: 0, data: [] })
            return
          }

          // First row is headers
          const headers = (jsonData[0] || []).map((h: any) => String(h || "").trim()).filter(Boolean)
          
          // Filter out completely empty rows
          const nonEmptyRows = jsonData.slice(1).filter((row: any[]) => {
            return row.some(cell => cell !== null && cell !== undefined && cell !== "")
          })

          resolve({
            columns: headers,
            rowCount: nonEmptyRows.length,
            data: nonEmptyRows.map((row: any[]) => {
              const rowObj: any = {}
              headers.forEach((header, index) => {
                rowObj[header] = row[index] || ""
              })
              return rowObj
            }),
          })
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error("Failed to read Excel file"))
      reader.readAsArrayBuffer(file)
    } else {
      reject(new Error("Unsupported file type"))
    }
  })
}

  // Load HR headers list from JSON file
  const [hrHeadersList, setHrHeadersList] = useState<string[]>([])

  useEffect(() => {
    fetch("/hr-headers.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch HR headers: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        let headersArray: string[] = []
        
        // Check if data is directly an array (current format)
        if (Array.isArray(data)) {
          headersArray = data
        } 
        // Check if data has headers property (alternative format)
        else if (data && Array.isArray(data.headers)) {
          headersArray = data.headers
        } 
        else {
          console.error("HR headers data structure is invalid:", data)
          setHrHeadersList([])
          return
        }
        
        // Normalize headers (remove spaces, special chars, lowercase)
        const normalized = headersArray.map((h: string) => normalizeHeader(String(h)))
        setHrHeadersList(normalized)
      })
      .catch((err) => {
        console.error("Failed to load HR headers:", err)
        setHrHeadersList([])
      })
  }, [])

  // Normalize header string (remove spaces, special chars, lowercase)
  const normalizeHeader = (header: string): string => {
    return header
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
  }

  // Check if headers are actually data rows (not real headers)
  const areHeadersActuallyData = (headers: string[]): { isData: boolean; reason: string } => {
    // Check first few headers for patterns that suggest they're data, not headers
    for (let i = 0; i < Math.min(3, headers.length); i++) {
      const normalized = normalizeHeader(headers[i])
      
      // Skip empty headers
      if (!normalized) continue
      
      // Email addresses
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
        return { 
          isData: true, 
          reason: `Found email address "${headers[i]}" in first row - file appears to lack headers.` 
        };
      }
      
      // Phone numbers
      if (/^[\+\(]?\d{1,4}[\)\-\.\s]?\d{3}[\-\.\s]?\d{3,4}[\-\.\s]?\d{4}$/.test(normalized)) {
        return { 
          isData: true, 
          reason: `Found phone number "${normalized}" in first row - file appears to lack headers.` 
        };
      }
      
      // Large numbers (likely salary or ID)
      if (/^\d{5,}$/.test(normalized)) {
        return { 
          isData: true, 
          reason: `Found large numeric value "${normalized}" in first row - file appears to lack headers.` 
        };
      }
      
      // Decimal numbers
      if (/^\d+\.\d+$/.test(normalized)) {
        return { 
          isData: true, 
          reason: `Found decimal number "${normalized}" in first row - file appears to lack headers.` 
        };
      }
      
      // ISO Date
      if (/^\d{4}-?\d{2}-?\d{2}$/.test(normalized)) {
        return { 
          isData: true, 
          reason: `Found ISO date "${normalized}" in first row - file appears to lack headers.` 
        };
      }
    }

    return { isData: false, reason: '' };
  }

  // SIMPLE HR HEADER VALIDATION - Match against comprehensive HR headers list
  const validateHRHeaders = (
    headers: string[],
    minMatchRatio: number = 0.7 // 70% of headers must match HR headers list
  ): { 
    isValid: boolean; 
    matchRatio: number;
    matchedCount: number;
    totalCount: number;
    matchedHeaders: Array<{ 
      original: string; 
      normalized: string; 
      matchedPattern: string;
    }>;
    normalizedHeaders: string[];
    error: string;
  } => {
    // First check if these are actually data rows, not headers
    const { isData, reason } = areHeadersActuallyData(headers);
    if (isData) {
      return {
        isValid: false,
        matchRatio: 0,
        matchedCount: 0,
        totalCount: headers.length,
        matchedHeaders: [],
        normalizedHeaders: [],
        error: reason,
      };
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
        error: 'HR headers list is still loading. Please try again.',
      };
    }

    // Normalize all headers (remove spaces and special characters)
    const normalizedHeaders = headers.map(header => normalizeHeader(header));
    const matchedHeaders: Array<{ 
      original: string; 
      normalized: string; 
      matchedPattern: string;
    }> = [];

    // Check each normalized header against HR headers list
    normalizedHeaders.forEach((normalizedHeader, index) => {
      // Check if normalized header matches any HR header pattern
      const matchedPattern = hrHeadersList.find(hrHeader => 
        normalizedHeader === hrHeader || normalizedHeader.includes(hrHeader) || hrHeader.includes(normalizedHeader)
      );

      if (matchedPattern) {
        matchedHeaders.push({
          original: headers[index],
          normalized: normalizedHeader,
          matchedPattern: matchedPattern,
        });
      }
    });

    const matchedCount = matchedHeaders.length;
    const totalCount = headers.length;
    const matchRatio = totalCount > 0 ? matchedCount / totalCount : 0;
    const isValid = matchRatio >= minMatchRatio;

    return {
      isValid,
      matchRatio,
      matchedCount,
      totalCount,
      matchedHeaders,
      normalizedHeaders,
      error: isValid 
        ? '' 
        : `This doesn't appear to be an HR data file. Please upload a file with HR data.`,
    };
  };

  const checkFileCondition = async (file: File) =>{
      // BUG FIX: Clear previous errors when new file is selected
      setError(null)
      errorRef.current = null
      
      // File size validation - check FIRST before processing
      if (file.size > maxSize) {
        const errorMsg = `File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`
        errorRef.current = errorMsg
        setError(errorMsg)
        return
      }
      
      // Mock metadata extraction
        const { columns, rowCount, data } = await parseFile(file)

        const metadata: FileMetadata = {
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          lastModified: file.lastModified,
          rowCount,
          columns,
          dataType: file.name.toLowerCase().includes("headcount") ? "headcount" : "general",
        }

        console.log("In check file condition, file_row_count", rowCount)

        if(rowCount == 0){
          setError("File is empty. Please upload file with some data.")
          return;
        }

        // Validate HR headers against comprehensive list
        const headerValidation = validateHRHeaders(columns, 0.7);
        
        console.log("Header Validation:", {
          columns,
          matchRatio: headerValidation.matchRatio,
          matchedCount: headerValidation.matchedCount,
          totalCount: headerValidation.totalCount,
          matchedHeaders: headerValidation.matchedHeaders,
          isValid: headerValidation.isValid,
          error: headerValidation.error,
        });

        // Check if headers are HR-related
        if (!headerValidation.isValid) {
          setError(
            headerValidation.error
          );
          return;
        }

        if(errorRef.current){
          console.log("errorRef.current", errorRef.current)
          setError(errorRef.current)
          return;
        }

        localStorage.setItem("file_name", file.name)
        localStorage.setItem("file_row_count", JSON.stringify(rowCount))

        setFileMetadata(metadata)
        setUploadedFile({file, metadata})
        setMetadata({filename: file.name, totalRows: rowCount})
        
        console.log("no futureError")
        console.log("File is dropped successfully")
        console.log("fileDropped useState", fileDropped)
        setFileDropped(true)
        hasFileDropped(true)
  }

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0]
        const file = rejection.file;

        let errorMessage = ""
        if (rejection.errors.some((e: any) => e.code === "file-too-large")) {
          errorMessage = `File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`
        } else if (rejection.errors.some((e: any) => e.code === "file-invalid-type")) {
          errorMessage = `Invalid file type. Accepted types: ${acceptedTypes.join(", ")}`
        } else {
          errorMessage = "File upload failed. Please try again."
        }
        
        // Set error immediately and don't process the file
        errorRef.current = errorMessage
        setError(errorMessage)
        return // Don't process rejected files
      }

      // Only process accepted files (they've passed size and type validation)
      if (acceptedFiles.length > 0) {
        // Double-check size here as well (defensive programming)
        const file = acceptedFiles[0]
        if (file.size > maxSize) {
          const errorMsg = `File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`
          errorRef.current = errorMsg
          setError(errorMsg)
          return
        }
        checkFileCondition(file)
      }
    },
    [acceptedTypes, maxSize],
  )

  // Map file extensions to MIME types
  const mimeTypeMap: Record<string, string[]> = {
    'text/csv': ['.csv'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-excel': ['.xls']
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: mimeTypeMap,
    maxSize,
    multiple: false,
    noClick: true, // Prevent click on the drop zone from opening dialog
    noKeyboard: true, // Prevent keyboard interaction
  })

  const removeFile = () => {
    setUploadedFile(null)
    setFileMetadata(null)
    setError(null)
    errorRef.current= null
    hasFileDropped(false)
    setError(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleBrowseClick = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = acceptedTypes.join(",")
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        const file = files[0];

        // File size limit check - return early if too large
        if (file.size > maxSize) {
          const errorMsg = `File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`
          errorRef.current = errorMsg
          setError(errorMsg)
          return // Don't process the file if it's too large
        }
        
        // Only process file if size is valid
        checkFileCondition(files[0])
      }
    }
    input.click()

    if (onBrowseFiles) {
      onBrowseFiles()
    }
  }

  return (
    <>
      {error && (
            <div className="relative mb-4">
              <Alert variant="destructive" className="pr-10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="pr-10">{error}</AlertDescription>
              </Alert>
              <button
                type="button"
                className="absolute top-1/2 -translate-y-1/2 right-10 h-6 w-6 p-0 flex items-center justify-center rounded-sm hover:bg-destructive/20 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 z-50 text-destructive cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setError(null)
                  errorRef.current = null
                }}
                aria-label="Close error message"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
      <Card className="w-full">
        <CardContent className="space-y-4">
          {!uploadedFile  && (
            <>
              <div
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }`} 
              >
                <input {...getInputProps()} />  
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                {isDragActive ? (
                  <p className="text-blue-600 font-medium">Drop the file here...</p>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">Drag and drop your file here</p>
                    <p className="text-sm text-gray-500">
                      Supported formats: {acceptedTypes.join(", ")} (max {maxSize / (1024 * 1024)}MB)
                    </p>
                  </div>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={handleBrowseClick}>
                Browse files
              </Button>
            </>
          )}

          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Processing file...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {!isUploading && !processedFile && uploadedFile && fileMetadata &&  (
          
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>{fileMetadata.name}</span>
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={removeFile}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
          )}

          {processedFile && isUploaded && !isUploading && uploadedFile && fileMetadata && (
            <div className="space-y-4">
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    {uploadedFile.metadata.isSample ? "Sample file loaded successfully!" : "File processed successfully!"}
                  </span>
                </div>
                <div className="text-sm text-green-700">
                  <strong>{fileMetadata.rowCount?.toLocaleString()} records</strong> analyzed •
                  <strong> {fileMetadata.dataType}</strong> data detected
                  {uploadedFile.metadata.isSample && (
                    <span className="ml-2 px-2 py-1 bg-green-200 text-green-800 rounded text-xs">SAMPLE DATA</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {isUploading && fileMetadata && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>File uploaded and getting processed...!</AlertDescription>
              </Alert>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>{fileMetadata.name}</span>
                    </CardTitle>
                    {/* <Button variant="ghost" size="sm" onClick={removeFile}>
                      <X className="h-4 w-4" />
                    </Button> */}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">File Size:</span>
                      <span className="ml-2 text-gray-600">{formatFileSize(fileMetadata.size)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Data Type:</span>
                      <Badge variant="secondary" className="ml-2">
                        {fileMetadata.dataType}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Rows:</span>
                      <span className="ml-2 text-gray-600">{fileMetadata.rowCount?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium">Columns:</span>
                      <span className="ml-2 text-gray-600">{fileMetadata.columns?.length}</span>
                    </div>
                  </div>

                  {fileMetadata.columns && (
                    <div>
                      <span className="font-medium text-sm">Detected Columns:</span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {fileMetadata.columns.map((column, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {column}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
