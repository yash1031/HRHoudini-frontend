"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react"
import { v4 as uuidv4 } from "uuid";
import { useDashboard } from '@/contexts/DashboardContext';
import { useUserContext } from "@/contexts/user-context"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Target,
  Award,
  Calendar,
  Briefcase,
} from "lucide-react"
import Papa from "papaparse"
import * as XLSX from "xlsx"


interface FileUploadProps {
  onFileUpload: (file: File, metadata: any) => void
  acceptedTypes?: string[]
  maxSize?: number
  title?: string
  description?: string
  hasFileUploadStarted: (args: boolean) => void
  onBrowseFiles?: () => void
  onboardingMode?: boolean
  userContext?: any
  scenarioConfig?: any
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
  onFileUpload,
  acceptedTypes = [".csv", ".xlsx", ".xls"],
  maxSize = 10 * 1024 * 1024, // 10MB
  title = "Upload HR Data File",
  description = "Drag and drop your HR data file here, or click to browse",
  onBrowseFiles,
  hasFileUploadStarted,
  onboardingMode,
  userContext,
  scenarioConfig,
}: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uuid] = useState<string>(uuidv4());
  const {setKpis } = useUserContext()
  const { setSample_questions, setDashboardCode, setIsLoading, setErrorDash } = useDashboard();
  let resCurrentPlan: Promise<Response>;

  // Helper: upload with progress using XMLHttpRequest
  const uploadFileWithProgress = (url: any, file: any, contentType: any) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url, true);
      xhr.setRequestHeader("Content-Type", contentType);

      // xhr.upload.onprogress = (event) => {
      //   if (event.lengthComputable) {
      //     const percent = Math.round((event.loaded / event.total) * 100);
      //     setUploadProgress(percent);
      //   }
      // };

      xhr.onload = () => {
        if (xhr.status === 200) {
          console.log(`Upload succeded with status ${xhr.status} & response is ${xhr.response}`)
          resolve(xhr.response);
        } else {
          console.log(`Upload failed with status ${xhr.status}`)
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(file);
    });
  };

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
          const rowCount = results.data.length
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
          const rowCount = rows.length

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

  const processFile = async (file: File) => {

    const dataCurrentPlan = await resCurrentPlan;
    if (!dataCurrentPlan.ok) throw new Error("Failed to fetch current user plan");
    const currentPlanData=   await dataCurrentPlan.json();
    console.log("Successfully fetched user's current plan. Result is ", JSON.stringify(currentPlanData))
    console.log("Remaining quotas are", currentPlanData.subscriptions[0].remaining_tokens);
    console.log("File Size is", file.size);


    // const maxFileSizeTokens = parseInt(process.env.NEXT_PUBLIC_TOKEN_FOR_FULLSIZE_FILE || "0", 10);
    // console.log("maxFileSize", maxFileSizeTokens)


    const tokensNeeded= parseInt(process.env.NEXT_PUBLIC_TOKEN_FOR_FULLSIZE_FILE || "0", 10);
    console.log("Tokens needed", tokensNeeded)
    if(currentPlanData.subscriptions[0].remaining_tokens<tokensNeeded){
      setError("File upload quotas are exhausted.")
      setTimeout(()=>{
        setError(null);
      }, 3000)
      return;
    }
    setIsUploading(true)
    setError(null)
    hasFileUploadStarted(true)
    setUploadProgress(0)

    try {
      // Simulate file processing with progress
      // const progressInterval = setInterval(() => {
      //   setUploadProgress((prev) => {
      //     if (prev >= 90) {
      //       clearInterval(progressInterval)
      //       return 90
      //     }
      //     return prev + 10
      //   })
      // }, 200)

      // Simulate file analysis
      // await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock metadata extraction

      const { columns, rowCount } = await parseFile(file)

      // const metadata: FileMetadata = {
      //   name: file.name,
      //   size: file.size,
      //   type: file.type || "application/octet-stream",
      //   lastModified: file.lastModified,
      //   rowCount: Math.floor(Math.random() * 1000) + 100,
      //   columns: ["employee_id", "name", "department", "hire_date", "salary", "manager_id"],
      //   dataType: file.name.toLowerCase().includes("headcount") ? "headcount" : "general",
      // }

      const metadata: FileMetadata = {
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        lastModified: file.lastModified,
        rowCount,
        columns,
        dataType: file.name.toLowerCase().includes("headcount") ? "headcount" : "general",
      }

      localStorage.setItem("file_name", file.name)
      localStorage.setItem("file_row_count", JSON.stringify(rowCount))


      console.log("Metadata is: "+ JSON.stringify(metadata));

      // clearInterval(progressInterval)
      // setUploadProgress(100)
      setFileMetadata(metadata)
      setUploadedFile(file)

      // 1. Create KPIs
      const resCreateKPIs = fetch(
        "https://9tg2uhy952.execute-api.us-east-1.amazonaws.com/dev/generate-kpis",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: localStorage.getItem("user_id"),
            session_id: uuid,
            column_headers: columns
          }),
        }
      );

      // 2. Create KPIs
      const resAISuggestedQues = fetch(
        "https://9tg2uhy952.execute-api.us-east-1.amazonaws.com/dev/ask-ai",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: localStorage.getItem("user_id"),
            session_id: uuid,
            column_headers: columns
          }),
        }
      );

      // 3. Get presigned URL
      const response = await fetch(
        "https://9tg2uhy952.execute-api.us-east-1.amazonaws.com/dev/upload-docs",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            userId: localStorage.getItem("user_id"),
            uuid: uuid,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to get presigned URL");

      setUploadProgress(20)
      const data = await response.json();
      console.log("Data after generating presigned URL is ", JSON.stringify(data))
      const body = JSON.parse(data.body);
      const { uploadUrl, s3Key } = body;
      console.log("uploadUrl", uploadUrl, "s3Key", s3Key)
      // setSessionId(sessionId);
      localStorage.setItem("s3Key", s3Key)

      // 4. Upload file with progress
      await uploadFileWithProgress(uploadUrl, file, file.type);

      setUploadProgress(40)

      // 5. Convert CSV to parquet
      const resCSVToParq = await fetch(
        "https://9tg2uhy952.execute-api.us-east-1.amazonaws.com/dev/csv-parquet-processor",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: localStorage.getItem("user_id"),
            session_id: uuid,
          }),
        }
      );

      if (!resCSVToParq.ok) throw new Error("Failed to convert CSV to parquet");

      const data1 = await resCSVToParq.json();
      console.log("Successfully converted to parquet. Result is ", JSON.stringify(data1))
      setUploadProgress(60)

      // 6. Create Athena Table
      const resCreateAthena = await fetch(
        "https://9tg2uhy952.execute-api.us-east-1.amazonaws.com/dev/create-athena-ddl",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: localStorage.getItem("user_id"),
            session_id: uuid,
          }),
        }
      );

      if (!resCreateAthena.ok) throw new Error("Failed to Create Athena Table");

      const data2 = await resCreateAthena.json();
      console.log("Successfully converted athena table. Result is ", JSON.stringify(data1))
      setUploadProgress(80)
      localStorage.setItem("session_id", uuid)

      // const fileName= file.name.toLowerCase().split(".")[0]
      // const first8_session_id = uuid.substring(0, 8)
      // const table_name= fileName+ '_' + first8_session_id


      const dataKPIs = await resCreateKPIs;
      if (!dataKPIs.ok) throw new Error("Failed to Create KPIs");
      const kpisData=   await dataKPIs.json();
      console.log("Successfully created KPIs. Result is ", JSON.stringify(kpisData))
      // ✅ Parse the string inside `body`
      const parsedBody = JSON.parse(kpisData.body);
      console.log("Parsed body:", parsedBody);
      console.log("KPI Questions are:", parsedBody.kpi_items);

      // Transform kpi_items to include actual icon components
      const kpisWithIcons: KpiItem[] = parsedBody.kpi_items.map((item: any) => ({
        ...item,
        icon: Clock, // fallback to Clock
      }));

      // ✅ Set KPIs from parsed response
      setKpis(kpisWithIcons);

      const dataAIRecommendedQuestions = await resAISuggestedQues;
      if (!dataAIRecommendedQuestions.ok) throw new Error("Failed to Create KPIs");
      const aIRecommendedQuestionsData=   await dataAIRecommendedQuestions.json();
      console.log("Successfully generated AI Recommended Ques. Result is ", JSON.stringify(aIRecommendedQuestionsData))
      // ✅ Parse the string inside `body`
      const parsedBodyAIRQ = JSON.parse(aIRecommendedQuestionsData.body);
      console.log("Parsed body:", parsedBodyAIRQ);
      console.log("AI Recommended Ques. are:", parsedBodyAIRQ.sample_questions);
      localStorage.setItem("sample_questions", JSON.stringify(parsedBodyAIRQ.sample_questions))
      // setSample_questions(parsedBody.sample_questions)
      // hasFileUploadStarted(false)
      setUploadProgress(100)

      // Call the parent callback
      onFileUpload(file, metadata)

    } catch (err) {
      setError("Failed to process file. Please try again.")
      console.error("File processing error:", err)
    } finally {
      setIsUploading(false)
    }
  }

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0]
        if (rejection.errors.some((e: any) => e.code === "file-too-large")) {
          setError(`File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`)
        } else if (rejection.errors.some((e: any) => e.code === "file-invalid-type")) {
          setError(`Invalid file type. Accepted types: ${acceptedTypes.join(", ")}`)
        } else {
          setError("File upload failed. Please try again.")
        }
        return
      }

      if (acceptedFiles.length > 0) {
        checkFileUpoadQuotas()
        console.log("File is uploaded correctly")
        processFile(acceptedFiles[0])
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
    // accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    accept: mimeTypeMap,
    maxSize,
    multiple: false,
    noClick: true, // Prevent click on the drop zone from opening dialog
    noKeyboard: true, // Prevent keyboard interaction
  })

  const removeFile = () => {
    setUploadedFile(null)
    setFileMetadata(null)
    setUploadProgress(0)
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
    checkFileUpoadQuotas()
    const input = document.createElement("input")
    input.type = "file"
    input.accept = acceptedTypes.join(",")
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        hasFileUploadStarted(true)
        processFile(files[0])
      }
    }
    input.click()

    if (onBrowseFiles) {
      onBrowseFiles()
    }
  }

  const checkFileUpoadQuotas = async () =>{
    console.log("CheckFileUploadQuotas Triggered")
    resCurrentPlan = fetch(
        `https://9tg2uhy952.execute-api.us-east-1.amazonaws.com/dev/billing/current-plan?user_id=${localStorage.getItem("user_id")}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
  }

  return (
    <Card className="w-full">
      <CardContent className="space-y-4">
        {!uploadedFile && (
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

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {uploadedFile && fileMetadata && (
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
                  <Button variant="ghost" size="sm" onClick={removeFile}>
                    <X className="h-4 w-4" />
                  </Button>
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
  )
}
