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
import { useOnboarding } from "./onboarding/onboarding-template"
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
  const { uploadedFile, setUploadedFile } = useOnboarding()
  const { setMetadata} = useDashboard();

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
              value !== '' && 
              String(value).trim() !== ''
            )
          })
          
          const rowCount = nonEmptyRows.length
          resolve({ columns, rowCount, data: nonEmptyRows })
        },
        error: (err) => reject(err),
      })
    } else if (fileExtension === "xlsx" || fileExtension === "xls") {
      // Parse Excel files
      console.log("Uploaded file is in excel format")
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: "array" })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) // raw rows

          const [headers, ...rows] = jsonData
          const columns = (headers as string[]) || []
          
          // Filter out rows that are completely empty
          const nonEmptyRows = rows.filter((row: any) => {
            return Array.isArray(row) && row.some(cell => 
              cell !== null && 
              cell !== undefined && 
              cell !== '' && 
              String(cell).trim() !== ''
            )
          })
          
          // Convert rows to objects with headers as keys
          const dataRows = nonEmptyRows.map((row: any) => {
            const rowObj: any = {}
            columns.forEach((col, index) => {
              rowObj[col] = row[index] || ''
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
  }

  // Load HR headers list
  const [hrHeadersList, setHrHeadersList] = useState<string[]>([]);

  // Load HR headers on component mount
  useEffect(() => {
    fetch('/hr-headers.json')
      .then(res => res.json())
      .then(data => setHrHeadersList(data))
      .catch(err => console.error('Failed to load HR headers list:', err));
  }, []);

  // Normalize header - remove all spaces and special characters
  const normalizeHeader = (header: string): string => {
    return header
      .toLowerCase()
      .trim()
      .replace(/[-_\s]+/g, '') // Remove hyphens, underscores, and spaces
      .replace(/[^a-z0-9]/g, '') // Remove all special characters
      .trim();
  };


  const areHeadersActuallyData = (headers: string[]): { isData: boolean; reason: string } => {
    for (const header of headers) {
      const normalized = header.trim();
      
      // Email addresses
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
        return { 
          isData: true, 
          reason: `Found email address "${normalized}" in first row - file appears to lack headers.` 
        };
      }
      
      // Date patterns
      if (/^\d{1,4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,4}$/.test(normalized)) {
        return { 
          isData: true, 
          reason: `Found date value "${normalized}" in first row - file appears to lack headers.` 
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

        if (rejection.errors.some((e: any) => e.code === "file-too-large")) {
          errorRef.current= `File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`
          
        } else if (rejection.errors.some((e: any) => e.code === "file-invalid-type")) {
          errorRef.current= `Invalid file type. Accepted types: ${acceptedTypes.join(", ")}`
          
        } else {
          errorRef.current= "File upload failed. Please try again."
          
        }
        const metadata: FileMetadata = {
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          lastModified: file.lastModified,
          rowCount: 0,
          columns: [],
          dataType: file.name.toLowerCase().includes("headcount") ? "headcount" : "general",
        }
        setFileMetadata(metadata)
        setUploadedFile({file, metadata})
        console.log("errorRef.current", errorRef.current)
        setError(errorRef.current)
      }

      if (acceptedFiles.length > 0) {
        checkFileCondition(acceptedFiles[0])
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

        // File size limit check (1 MB)
        if (file.size > maxSize) {
          console.log("File is large")
          errorRef.current= `File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`
        }
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
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
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