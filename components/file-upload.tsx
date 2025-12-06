"use client"

import { useState, useCallback,Dispatch, SetStateAction, useRef } from "react"
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

  const parseFile = (file: File): Promise<{ columns: string[]; rowCount: number }> => {
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
          resolve({ columns, rowCount })
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
          
          const rowCount = nonEmptyRows.length

          resolve({ columns, rowCount })
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

  const HR_HINTS = [
    "hire", "hired", "hiring", "termination", "terminated", "term", "terminate",
    "depart", "departure", "resigned", "resignation", "exit", "leaving",
    "dept", "department", "division", "team", "unit", "business unit",
    "gender", "sex", "male", "female", "diversity",
    "salary", "wage", "pay", "compensation", "comp", "bonus", "incentive",
    "commission", "stock", "equity", "benefits", "allowance",
    "age", "birth", "dob", "date of birth", "yob",
    "tenure", "service", "seniority", "years", "experience",
    "performance", "rating", "review", "appraisal", "evaluation", "score",
    "manager", "supervisor", "lead", "director", "head", "chief", "reports to",
    "title", "position", "role", "job", "designation", "function",
    "level", "grade", "band", "tier", "rank",
    "location", "office", "site", "city", "region", "country", "geography",
    "state", "province", "branch", "facility",
    "education", "degree", "qualification", "university", "college", "school",
    "promotion", "promoted", "career", "progression", "advancement",
    "employee", "staff", "worker", "personnel", "associate", "member",
    "headcount", "hc", "fte", "full time", "part time", "contractor",
    "status", "active", "inactive", "current", "former",
    "start date", "end date", "join", "joined", "onboard", "onboarding",
    "attrition", "turnover", "retention", "churn",
    "absence", "leave", "vacation", "pto", "sick", "holiday",
    "overtime", "hours", "shift", "schedule",
    "ethnicity", "race", "nationality", "veteran", "disability",
    "marital", "married", "single", "family",
    "id", "emp id", "employee id", "staff id", "badge",
    "cost center", "budget", "payroll",
    "skill", "competency", "certification", "training",
    "discipline", "warning", "pip", "improvement plan"
  ];

  //Normalize headers removing extra characters
  const normalizeHeaderName = (header: string): string => {
    return header
      .toLowerCase()
      .trim()
      .replace(/[-_\s]+/g, " ") // Replace hyphens, underscores, and multiple spaces with single space
      .replace(/[^a-z0-9\s]/g, "") // Remove special characters except spaces
      .trim();
  };

  const areHeadersActuallyData = (headers: string[]): { isData: boolean; reason: string } => {
  
    for (const header of headers) {
      const normalized = header.trim();
      
      // DEFINITIVE INDICATORS - if ANY of these match, it's definitely data, not headers
      
      // 1. Email addresses - headers should NEVER be email addresses
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
        return { 
          isData: true, 
          reason: `Found email address "${normalized}" in first row - this indicates file does not contain headers.` 
        };
      }
      
      // 2. Date patterns - headers should NEVER be dates
      // Matches: MM/DD/YYYY, DD-MM-YYYY, YYYY-MM-DD, M/D/YY, etc.
      if (/^\d{1,4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,4}$/.test(normalized)) {
        return { 
          isData: true, 
          reason: `Found date value "${normalized}" in first row - this indicates file does not contain headers.` 
        };
      }
      
      // 5. Large currency amounts (5+ digits)
      // Headers might have "2024" or "Q1" but not "65000" or "125000"
      if (/^\d{5,}$/.test(normalized)) {
        return { 
          isData: true, 
          reason: `Found large numeric value "${normalized}" in first row - this indicates file does not contain headers.` 
        };
      }
      
      // 6. Decimal numbers (salary, percentages, ratings)
      // Matches: "65000.50", "3.14", "95.5"
      if (/^\d+\.\d+$/.test(normalized)) {
        return { 
          isData: true, 
          reason: `Found decimal number "${normalized}" in first row - this indicates file does not contain headers.` 
        };
      }
      
      // 7. ZIP codes (US 5-digit or 5+4 format)
      // Matches: "02108", "02139", "90210-1234"
      if (/^\d{5}(-\d{4})?$/.test(normalized)) {
        return { 
          isData: true, 
          reason: `Found ZIP code "${normalized}" in first row - this indicates file does not contain headers.` 
        };
      }
      
      // 8. Phone numbers
      // Matches: "555-1234", "(555) 123-4567", "555.123.4567", "+1-555-123-4567"
      if (/^[\+\(]?\d{1,4}[\)\-\.\s]?\d{3}[\-\.\s]?\d{3,4}[\-\.\s]?\d{4}$/.test(normalized)) {
        return { 
          isData: true, 
          reason: `Found phone number "${normalized}" in first row - this indicates file does not contain headers.` 
        };
      }
      
      // 9. Social Security Numbers (US format)
      // Matches: "123-45-6789" or "123456789"
      if (/^\d{3}-?\d{2}-?\d{4}$/.test(normalized)) {
        return { 
          isData: true, 
          reason: `Found SSN pattern "${normalized}" in first row - this indicates file does not contain headers.` 
        };
      }
      
      // 10. URLs/Websites
      if (/^(https?:\/\/|www\.)[^\s]+$/i.test(normalized)) {
        return { 
          isData: true, 
          reason: `Found URL "${normalized}" in first row - this indicates file does not contain headers.` 
        };
      }
      
      // 11. ISO Date format (YYYY-MM-DD or YYYYMMDD)
      if (/^\d{4}-?\d{2}-?\d{2}$/.test(normalized)) {
        return { 
          isData: true, 
          reason: `Found ISO date "${normalized}" in first row - this indicates file does not contain headers.` 
        };
      }
      
      // 12. Time values (HH:MM:SS or HH:MM)
      if (/^\d{1,2}:\d{2}(:\d{2})?(\s?(AM|PM))?$/i.test(normalized)) {
        return { 
          isData: true, 
          reason: `Found time value "${normalized}" in first row - this indicates file does not contain headers.` 
        };
      }
      
      // 13. Percentage values with % symbol
      if (/^\d+\.?\d*%$/.test(normalized)) {
        return { 
          isData: true, 
          reason: `Found percentage value "${normalized}" in first row - this indicates file does not contain headers.` 
        };
      }
      
      // 14. Currency symbols with amounts
      if (/^[\$£€¥][\d,]+\.?\d*$/.test(normalized)) {
        return { 
          isData: true, 
          reason: `Found currency amount "${normalized}" in first row - this indicates file does not contain headers.` 
        };
      }
    }

    return { isData: false, reason:"" };
  }

  //Validate if headers received are relevant HR
  const validateHRHeaders = (headers: string[], minHits: number = 3): { 
    isValid: boolean; 
    hits: number; 
    matchedHeaders: string[];
    normalizedHeaders: string[];
    error: string;
  } => {
    // First check if these are actually data rows, not headers
    const {isData, reason}= areHeadersActuallyData(headers)
    if (isData) {
      return {
        isValid: false,
        hits: 0,
        matchedHeaders: [],
        normalizedHeaders: [],
        error: reason
      };
    }

    const normalizedHeaders = headers.map(normalizeHeaderName);
    const matchedHeaders: string[] = [];
    let hits = 0;

    normalizedHeaders.forEach((header, index) => {
      const isMatch = HR_HINTS.some(hint => {
        const normalizedHint = hint.toLowerCase().replace(/\s+/g, " ");
        // Check if header contains the hint or hint contains the header
        return header.includes(normalizedHint) || normalizedHint.includes(header);
      });
      
      if (isMatch) {
        hits++;
        matchedHeaders.push(headers[index]); // Store original header name
      }
    });

    return {
      isValid: hits >= minHits,
      hits,
      matchedHeaders,
      normalizedHeaders,
      error: hits < minHits?"":`This doesn't appear to be an HR data file or headers are not available. Please upload a correct file`
    };
  };

  const checkFileCondition = async (file: File) =>{
      // Mock metadata extraction

        const { columns, rowCount } = await parseFile(file)

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

        // Validate HR headers
        const headerValidation = validateHRHeaders(columns, 3);
        
        console.log("Header Validation:", {
          columns,
          hits: headerValidation.hits,
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