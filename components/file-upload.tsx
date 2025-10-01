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

interface FileUploadProps {
  onFileUpload: (file: File, metadata: any) => void
  acceptedTypes?: string[]
  maxSize?: number
  title?: string
  description?: string
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

  const parseCsvFile = (file: File): Promise<{ columns: string[]; rowCount: number }> => {
  return new Promise((resolve, reject) => {
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
  })
}

  const processFile = async (file: File) => {
    setIsUploading(true)
    setError(null)
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

      const { columns, rowCount } = await parseCsvFile(file)

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

      console.log("Metadata is: "+ JSON.stringify(metadata));

      // clearInterval(progressInterval)
      // setUploadProgress(100)
      setFileMetadata(metadata)
      setUploadedFile(file)

      // 1️⃣ Get presigned URL
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
      const { uploadUrl, sessionId, fileKey } = body;
      console.log("uploadUrl", uploadUrl, "sessionId", sessionId, "fileKey", fileKey)
      // setSessionId(sessionId);


      // 2️⃣ Upload file with progress
      await uploadFileWithProgress(uploadUrl, file, file.type);

      setUploadProgress(40)
      // Convert CSV to parquet
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

      // Create Athena Table
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

      // Create KPIs
    const resCreateKPIs = await fetch(
      "https://9tg2uhy952.execute-api.us-east-1.amazonaws.com/dev/generate-kpis",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: localStorage.getItem("user_id"),
          session_id: localStorage.getItem("session_id"),
        }),
      }
    );
    if (!resCreateKPIs.ok) throw new Error("Failed to Create KPIs");
    const data3 = await resCreateKPIs.json();
    console.log("Successfully created KPIs. Result is ", JSON.stringify(data))
    // ✅ Parse the string inside `body`
    const parsedBody = JSON.parse(data3.body);
    console.log("Parsed body:", parsedBody);
    console.log("KPI Questions are:", parsedBody.kpi_items);

    // Transform kpi_items to include actual icon components
  const kpisWithIcons: KpiItem[] = parsedBody.kpi_items.map((item: any) => ({
    ...item,
    icon: Clock, // fallback to Clock
  }));

    // ✅ Set KPIs from parsed response
    // setKpis(parsedBody.kpi_items);
    setKpis(kpisWithIcons);

    setUploadProgress(100)

      // setStatus({
      //   type: "success",
      //   message: `✅ File uploaded successfully! (Key: ${fileKey || file.name})`,
      // });

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
        console.log("File is uploaded correctly")
        processFile(acceptedFiles[0])
      }
    },
    [acceptedTypes, maxSize],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple: false,
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
    const input = document.createElement("input")
    input.type = "file"
    input.accept = acceptedTypes.join(",")
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        processFile(files[0])
      }
    }
    input.click()

    if (onBrowseFiles) {
      onBrowseFiles()
    }
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
