//
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, BarChart3, Download, FileText, Users, Building2, AlertCircle } from "lucide-react"
import { FileUpload } from "@/components/file-upload"
import { useOnboarding } from "../onboarding-template"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useUserContext } from "@/contexts/user-context"
import { useDashboard } from '@/contexts/dashboard-context';
import { apiFetch } from "@/lib/api/client";
import { connectWebSocket, addListener, removeListener, closeWebSocket } from '@/lib/ws';
import {generateCardsFromParquet} from "@/utils/parquetLoader"

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

interface KpiItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType; // since you're storing component references like TrendingDown
  category: string;
}

export function FileUploadStep() {
  const { step, setStep, uploadedFile, setUploadedFile, userContext } = useOnboarding()
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<"upload" | "sample" | null>(null)
  const [hasBrowsedFiles, setHasBrowsedFiles] = useState(false)
  const [fileUploadStarted, setFileUploadStarted] = useState(false)
  const [fileDropped, setFileDropped]= useState(false);
  const [proceedToUpload, setProceedToUpload]= useState(false);
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const {setKpis } = useUserContext()
  const [processedFile, setProcessedFile]= useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  // const [removedColumns, setRemovedColumns] = useState<string[]>([]);
  let aiSuggestQuestionsGenerated= true
  const { 
    setCardsState,
    setChartsState,
    setMetadata, 
    setMessages,
    recommendedQuestions,
    setRecommendedQuestions,
  } = useDashboard();
  
  const hasFileDropped = (args: boolean) => {
    console.log("Args recieved after selecting the file", args)
    setFileDropped(args)
  }
  
  const handleContinue = () => {
    if(processedFile) skipToStep(3)
    else {
      const {file, metadata}= uploadedFile
      processFile(file, metadata.columns, metadata.rowCount)
    }
  }

  const handleSampleFileSelect = (showWelcome: string) => {
    const sampleMetadata = {
      name: "SharpMedian.csv",
      size: 245760, // Approximate size
      type: "text/csv",
      lastModified: Date.now(),
      rowCount: 1247,
      columns: [
        "Employee ID",
        "Employee Status",
        "Employee Type",
        "Employee Name",
        "Original Hire Date",
        "Last Hire Date",
        "Seniority Date",
        "Termination Date",
        "Termination Reason",
        "Company",
        "Organization",
        "Department",
        "Job Title",
        "Supervisor Name",
        "Location",
        "Region",
        "Salary or Hourly",
        "Annual Salary",
        "Gender",
        "Ethnicity",
        "Email Address",
      ],
      dataType: "headcount",
      isSample: true,
    }
    setCardsState({
          data: [],
          loading: false,
          error: null
    })
    setChartsState({
      data: [],
      loading: false,
      error: null
    })
    setMetadata({
      filename: "",
      totalRows: ""
    })
    setMessages([])
    sessionStorage.removeItem("chats")

    const sampleFile = new File(["sample"], "SharpMedian.csv", { type: "text/csv" })
    setUploadedFile({ file: sampleFile, metadata: sampleMetadata })

    const params = new URLSearchParams({
        hasFile: "false",
        showWelcome: showWelcome,
    })

    let dashboardUrl = `/dashboard?${params.toString()}`
    router.push(dashboardUrl)

  }

  const downloadSampleFile = () => {
    const link = document.createElement("a")
    link.href = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SharpMedian-tZH0AS0loyXmDGJmWhyKxY7i9oD9SR.csv"
    link.download = "SharpMedian.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const skipToStep = (targetStep: number) => {
    setStep(targetStep)
  }

  const resetSelection = () => {
    setSelectedOption(null)
    setUploadedFile(null)
    setHasBrowsedFiles(false)
  }

  const handleBrowseFiles = () => {
    setHasBrowsedFiles(true)
  }
  const hasFileUploadStarted = (arg: boolean) => {
    console.log("hasFileUploadStarted, args:", arg)
    setFileUploadStarted(arg)
  }

  const handleBack = () =>{
    setIsUploading(false)
    setFileDropped(false)
    setProcessedFile(false)
    // setRemovedColumns([])
    resetSelection()
    setStep(1)
  }

  // Helper: upload with progress using XMLHttpRequest
  const uploadFileWithProgress = (url: any, file: any, contentType: any) => {
    return new Promise((resolve, reject) => {
      console.log('=== UPLOAD START ===');
      console.log('URL:', url);
      console.log('File:', file.name, file.size, file.type);
      console.log('Content-Type:', contentType);
      
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          console.log(`Upload progress: ${percentComplete.toFixed(2)}%`);
          // Update progress: 20-40% range for upload
          setUploadProgress(20 + (percentComplete * 0.2));
        }
      };
      
      xhr.open("PUT", url, true);
      xhr.setRequestHeader("Content-Type", contentType);
      // Don't add any other headers - presigned URL handles auth
      
      xhr.onload = () => {
        console.log('=== UPLOAD RESPONSE ===');
        console.log('Status:', xhr.status);
        console.log('Status Text:', xhr.statusText);
        console.log('Response:', xhr.response);
        console.log('Response Headers:', xhr.getAllResponseHeaders());
        
        // S3 can return 200 or 204 for successful uploads
        if (xhr.status === 200 || xhr.status === 204) {
          console.log('✅ Upload succeeded!');
          resolve(xhr.response);
        } else {
          console.error(`❌ Upload failed: ${xhr.status} ${xhr.statusText}`);
          console.error('Response:', xhr.response);
          setError(`Upload failed: ${xhr.status} ${xhr.response || xhr.statusText}`);
          setIsUploading(false);
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      };
      
      xhr.onerror = () => {
        console.error('=== XHR ERROR ===');
        console.error('This usually means:');
        console.error('  1. Network error');
        console.error('  2. CORS error (check console for CORS messages)');
        console.error('  3. Request blocked by browser');
        console.error('Check browser Network tab for the failed request');
        setError("Network error during upload. Check browser console for details.");
        setIsUploading(false);
        reject(new Error("Network error during upload"));
        setError("Unable to process file. Please upload it again")
        setIsUploading(false)
      }

      xhr.send(file);
    });
  };

  const processFile = async (file: File, columns: string[], rowCount: number) => {
    let handler: (msg: any) => void = () => {};
    try {
        setIsUploading(true)
        setError(null)
        hasFileUploadStarted(true)
        setUploadProgress(0)
        // setRemovedColumns([])

        let resPresignedURL
        try{
          resPresignedURL = await apiFetch("/api/file-upload/generate-presigned-url", {
            method: "POST",
            headers: { "Content-Type": "application/json",},
            body: JSON.stringify({
                fileName: file.name,
                fileType: file.type,
                userId: localStorage.getItem("user_id"),
                rowCount: rowCount.toString()
              }),
          });
          
        }catch(error: any){
          const parsed = JSON.parse(error.message);
          console.log("Error in generating pre-signed URL: ", parsed.error)
          setError(parsed.error)
          setIsUploading(false)
          return
        }

      const presignedURLData = await resPresignedURL.data;
      console.log("presignedURLData received:", presignedURLData);

      let uploadURL;
      setIsUploaded(true);
      setUploadProgress(20);

        setUploadProgress(20)
        const data = await presignedURLData;
        const { uploadUrl, s3Key, sessionId } = data;
        uploadURL = uploadUrl
        console.log("uploadUrl", uploadUrl, "s3Key", s3Key)
        localStorage.setItem("s3Key", s3Key)
        localStorage.setItem("session_id", sessionId)
        connectWebSocket(data.sessionId, localStorage.getItem("user_id")||"");
        setCardsState(prev => ({ ...prev, loading: true, error: null }));

      // STEP 3: Upload file with progress
      console.log("=== STEP 3: Starting file upload ===");
      console.log("File to upload:", file.name, file.size, file.type);
      console.log("Upload URL:", uploadURL);

      try {
        await uploadFileWithProgress(uploadURL, file, file.type);
        console.log("✅ File upload completed successfully");
        setUploadProgress(40);
      } catch (uploadError) {
        console.error("❌ File upload failed:", uploadError);
        setError("File upload failed. Please try again.");
        setIsUploading(false);
        throw uploadError; // Re-throw to be caught by outer try-catch
      }

        handler = async (msg: any) => {
            console.log('[WS] message received', msg);
            if(msg.event==="convert.ready"){
              console.log("[WS] message: CSV converted to parquet")
              localStorage.setItem("presigned-parquet-url", msg.payload.presigned_url)
              setUploadProgress(70)
      
              // Extract removed columns if they exist
              // if (msg.payload.removed_columns && Array.isArray(msg.payload.removed_columns) && msg.payload.removed_columns.length > 0) {
              //   setRemovedColumns(msg.payload.removed_columns);
              // }

              let responseSuggestedQueries
              try{
                responseSuggestedQueries = await apiFetch("/api/chat/request", {
                  method: "POST",
                  headers: { "Content-Type": "application/json"},
                  body: JSON.stringify({
                        question: null,
                        user_id: localStorage.getItem("user_id"),
                        session_id: localStorage.getItem("session_id")
                      }),
                });
              }catch (error) {
                console.log("Unable to fetch suggested queries", error)
              }

              if(responseSuggestedQueries){
                const suggestedQueriesData= await responseSuggestedQueries.data

                console.log("SuggestionQuestionData received", suggestedQueriesData)
      
                // Display AI Suggested Questions 
                setRecommendedQuestions(suggestedQueriesData.sample_questions)  
              }
            }
            if(msg.event==="convert.failed"){
              console.log("[WS] message: CSV to parquet conversion failed")
              setError("Unable to process file. Please upload it again")
              setIsUploading(false)
              return
            }
            if(msg.event==="kpi.ready"){
              setCardsState({
                data: [],
                loading: false,
                error: null
              })
              console.log("KPIs are ready")
              const items = Array.isArray(msg.payload) ? msg.payload : [];
              const kpisWithIcons: KpiItem[] = items.map((item: any) => ({
                ...item,
                icon: Clock, // fallback
              }));
 
              setKpis(kpisWithIcons);   
              setUploadProgress(100)
              setTimeout(()=>{
                setProcessedFile(true);
                setIsUploading(false)
                hasFileUploadStarted(false)
              },1000)
              // }
            }
            if(msg.event==="kpi.error"){
              console.log("[WS] message: Creating KPIs failed")
              setError("Unable to process file. Please upload it again")
              setIsUploading(false)
              return
            }

            if (msg.event === "global_queries.ready") {
              const parquetUrl = localStorage.getItem("presigned-parquet-url") || "";
              console.log("Global queries received for cards:", msg.payload.text);
              
              // Set loading state
              setCardsState(prev => ({ ...prev, loading: true, error: null }));
              const cardsQueries= JSON.parse(msg.payload.text).summary_cards
              
              generateCardsFromParquet(cardsQueries, parquetUrl)
                .then((result: any) => {
                  console.log("Updated cardsState:", JSON.stringify(result, null, 2));
                  
                  // Success - update cards data in granular state
                  setCardsState({
                    // loading: true,
                    loading: false,
                    error: null,
                    data: result.cards || []
                  });
                })
                .catch((error) => {
                  console.error("Failed to generate cards:", error);
                  
                  // Error - set error state
                  setCardsState({
                    loading: false,
                    error: "Failed to generate KPI cards from data",
                    data: []
                  });
                });
            }
            
            if (msg.event === "global_queries.error") {
              console.error("Backend error in card generation:", msg.payload);
              
              // Backend error
              setCardsState({
                loading: false,
                error: msg.payload?.message || "Backend error generating cards",
                data: []
              });
            }
        };
        addListener(handler!, "file-upload-handler");
    } catch (err) {
      console.error("=== FILE PROCESSING ERROR ===");
      console.error("Error details:", err);
      setError("Failed to process file. Please try again.");
      setTimeout(()=>{
        setError(null);
      }, 3000);
      setIsUploading(false);
      console.error("File processing error:", err);
      closeWebSocket();
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-6">
          <BarChart3 className="h-6 w-6 text-blue-600 mr-2" />
          <CardTitle className="text-lg font-semibold text-blue-900">
            Explore HR insights with your data or sample data
          </CardTitle>
        </div>
        <CardDescription>Choose how you'd like to get started with your HR analytics</CardDescription>
      </CardHeader>
      <CardContent>
        {!selectedOption && !uploadedFile && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
                onClick={() => setSelectedOption("upload")}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Upload Your Own File</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload your organization's HR data to get personalized insights specific to your workforce
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>• CSV, Excel files supported</div>
                    <div>• Your actual data, your insights</div>
                    <div>• Secure and confidential</div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-green-200"
                onClick={() => setSelectedOption("sample")}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Try Sample Data</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Explore the platform using our sample dataset from Sharp Median, a retail company
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>• 1,247 employee records</div>
                    <div>• Complete HR dataset</div>
                    <div>• Perfect for exploration</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {selectedOption === "upload" && !(processedFile && isUploaded) && (
        // {selectedOption === "upload" && !uploadedFile && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Upload Your HR Data</h3>
              <Button variant="ghost" size="sm" onClick={resetSelection}>
                ← Back to options
              </Button>
            </div>
            <FileUpload
              // onFileUpload={handleFileUpload}
              hasFileUploadStarted={hasFileUploadStarted}
              onboardingMode={true}
              userContext={userContext}
              hasFileDropped={hasFileDropped}
              // scenarioConfig={scenarioConfig}
              onBrowseFiles={handleBrowseFiles}
              proceedToUpload={proceedToUpload}
              isUploading={isUploading}
              error={error}
              setError={setError}
              uploadProgress={uploadProgress}
              processedFile={processedFile}
              isUploaded={isUploaded}
            />
          </div>
        )}

        {selectedOption === "sample" && !uploadedFile && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Sharp Median Sample Dataset</h3>
              <Button variant="ghost" size="sm" onClick={resetSelection}>
                ← Back to options
              </Button>
            </div>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 mb-2">Sharp Median Retail Company</h4>
                    <p className="text-sm text-green-800 mb-4">
                      A comprehensive HR dataset from a mid-sized retail organization with diverse departments,
                      locations, and employee demographics. Perfect for exploring workforce analytics capabilities.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div>
                          <strong>Records:</strong> 1,247 employees
                        </div>
                        <div>
                          <strong>Departments:</strong> Customer Service, Retail Operations, Management
                        </div>
                        <div>
                          <strong>Locations:</strong> Multiple regions (Midwest, etc.)
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <strong>Data includes:</strong> Demographics, compensation, tenure
                        </div>
                        <div>
                          <strong>Time period:</strong> Current workforce snapshot
                        </div>
                        <div>
                          <strong>File format:</strong> CSV (245KB)
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadSampleFile}
                        className="flex items-center space-x-2 bg-transparent"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download to Review</span>
                      </Button>
                      <Button
                        onClick={()=> handleSampleFileSelect("true")}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                      >
                        <span>Use This Sample</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {uploadedFile && processedFile && isUploaded && (
          <div className="space-y-4">
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">
                  {uploadedFile.metadata.isSample ? "Sample file loaded successfully!" : "File processed successfully!"}
                </span>
              </div>
              <div className="text-sm text-green-700">
                <strong>{uploadedFile.metadata.rowCount?.toLocaleString()} records</strong> analyzed •
                <strong> {uploadedFile.metadata.dataType}</strong> data detected
                {uploadedFile.metadata.isSample && (
                  <span className="ml-2 px-2 py-1 bg-green-200 text-green-800 rounded text-xs">SAMPLE DATA</span>
                )}
              </div>
            </div>
        
            {/* {removedColumns.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-amber-900 mb-1">
                      Some columns were excluded from analysis
                    </div>
                    <div className="text-sm text-amber-800 mb-2">
                      The following columns contains inconsistent data and have been removed from consideration:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {removedColumns.map((column, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-amber-100 text-amber-900 rounded text-xs font-mono"
                        >
                          {column}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )} */}
          </div>
        )}

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handleBack}>
          {/* <Button variant="outline" onClick={() => setStep(1)}> */}
            Back
          </Button>
          { 
          !(selectedOption === "sample" && !uploadedFile) && (
            <div className="flex space-x-2">
              {/* <Button variant="outline" disabled={fileUploadStarted || uploadedFile} onClick={() => skipToStep(3)}> */}
              <Button variant="outline" disabled={fileUploadStarted || uploadedFile} onClick={()=> handleSampleFileSelect( "false" )}>
                Skip file upload
              </Button>
              <Button
                onClick={handleContinue}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                disabled={!(fileDropped && (!isUploading))}
              >
                <span>{(isUploading || processedFile)? "Continue": "Upload"}</span>
                {(isUploading || processedFile) && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}