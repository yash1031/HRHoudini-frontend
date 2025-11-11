"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, BarChart3, Download, FileText, Users, Building2 } from "lucide-react"
import { FileUpload } from "@/components/file-upload"
import { useOnboarding } from "../onboarding-template"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useUserContext } from "@/contexts/user-context"
import { v4 as uuidv4 } from "uuid";
import { useDashboard } from '@/contexts/DashboardContext';
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
  // const { step, setStep, userContext } = useOnboarding()
  const { step, setStep, uploadedFile, setUploadedFile, userContext } = useOnboarding()
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<"upload" | "sample" | null>(null)
  const [hasBrowsedFiles, setHasBrowsedFiles] = useState(false)
  const [uuid] = useState<string>(uuidv4());
  const [fileUploadStarted, setFileUploadStarted] = useState(false)
  const [fileDropped, setFileDropped]= useState(false);
  const [proceedToUpload, setProceedToUpload]= useState(false);
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const {setKpis } = useUserContext()
  const [processedFile, setProcessedFile]= useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const { setDashboard_data, setIsLoading, setErrorDash } = useDashboard();
  
  const hasFileDropped = (args: boolean) => {
    console.log("Args recieved after selecting the file", args)
    setFileDropped(args)
  }
  

  const handleContinue = () => {
    if(processedFile) skipToStep(3)
    else {
      const {file, metadata}= uploadedFile
      processFile(file, metadata.columns)
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
    resetSelection()
    setStep(1)
  }

    // Helper: upload with progress using XMLHttpRequest
  const uploadFileWithProgress = (url: any, file: any, contentType: any) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url, true);
      xhr.setRequestHeader("Content-Type", contentType);

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

  const processFile = async (file: File, columns: string[]) => {
    let handler: (msg: any) => void = () => {};
    try {
        setIsUploading(true)
        setError(null)
        hasFileUploadStarted(true)
        setUploadProgress(0)

        let resPresignedURL
        try{
          resPresignedURL = await apiFetch("/api/file-upload/generate-presigned-url", {
            method: "POST",
            headers: { "Content-Type": "application/json",},
            body: JSON.stringify({
                fileName: file.name,
                fileType: file.type,
                userId: localStorage.getItem("user_id"),
                // uuid: uuid,
              }),
          });
        }catch(error){
          console.log("Error in generating pre-signed URL", error)
          setError("Insufficient Tokens")
          setTimeout(()=>{
            setError(null);
          }, 3000)
          setIsUploading(false)
          return
        }

        const presignedURLData= await resPresignedURL.data
        console.log("presignedURLData is", JSON.stringify(presignedURLData))
        let uploadURL;
        console.log("Uploaded the file successfully to presigned URL", resPresignedURL)
        setIsUploaded(true);

        setUploadProgress(20)
        const data = await presignedURLData;
        console.log("Data after generating presigned URL is ", data)
        const { uploadUrl, s3Key, sessionId, idempotency_key } = data;
        uploadURL = uploadUrl
        console.log("uploadUrl", uploadUrl, "s3Key", s3Key)
        localStorage.setItem("s3Key", s3Key)
        localStorage.setItem("session_id", sessionId)
        localStorage.setItem("idempotency_key", idempotency_key)
        connectWebSocket(data.sessionId, localStorage.getItem("user_id")||"");

        
        
        // let createKPIsRes
        // try{
        //   createKPIsRes = apiFetch("/api/file-upload/generate-kpis", {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json", },
        //     body: JSON.stringify({
        //         user_id: localStorage.getItem("user_id"),
        //         session_id: sessionId,
        //         column_headers: columns
        //       }),
        //   });
        // }catch(error){
        //   setError("Failed to process file. Please try again.")
        //   setTimeout(()=>{
        //     setError(null);
        //   }, 3000)
        //   setIsUploading(false)
        //   console.error("Failed to create KPIs")
        //   return;
        // }

        let AISuggestedQuesRes
        try{
          AISuggestedQuesRes = apiFetch("/api/file-upload/generate-recommended-questions", {
            method: "POST",
            headers: { "Content-Type": "application/json",},
            body: JSON.stringify({
                user_id: localStorage.getItem("user_id"),
                session_id: uuid,
                column_headers: columns
              }),
          });
        }catch(error){
          setError("Failed to process file. Please try again.")
          setTimeout(()=>{
            setError(null);
          }, 3000)
          setIsUploading(false)
          console.error("Failed to create AI recommended question")
          return;
        }

        // 4. Upload file with progress
        await uploadFileWithProgress(uploadURL, file, file.type);

        setUploadProgress(40)

        handler = (msg: any) => {
            console.log('[WS] message', msg);
            if(msg.event==="convert.ready"){
              console.log("[WS] message: CSV converted to parquet")
              localStorage.setItem("presigned-parquet-url", msg.payload.presigned_url)
              setUploadProgress(70)
            }
            if(msg.event==="athena.completed"){
              console.log("Athena table created")
              setUploadProgress(100)
              setProcessedFile(true);
              setIsUploading(false)
              hasFileUploadStarted(false)
            }
            if(msg.event==="kpi.ready"){
              console.log("KPIs are ready")
              const items = Array.isArray(msg.payload) ? msg.payload : [];
              const kpisWithIcons: KpiItem[] = items.map((item: any) => ({
                ...item,
                icon: Clock, // fallback
              }));
 
              setKpis(kpisWithIcons);   // save to context
              setStep(3);               // go to KPIs step
            }
            if(msg.event==="global_queries.ready"){
              const parquetUrl= localStorage.getItem("presigned-parquet-url") || ""
              console.log("Global queries received for cards are", msg.payload.text)
              generateCardsFromParquet(msg.payload.text, parquetUrl)
              .then((result:any) => {
                console.log("Result for generateCardsFromParquet", JSON.stringify(result, null, 2))
                // setIsLoading(false)
                setErrorDash(null);
                setDashboard_data(result);
              })
              .catch(console.error);
            }
        };
        addListener(handler!, "chards-generator");

        // const resCreateKPIs= await createKPIsRes; 
        // const createKPIsData= await resCreateKPIs.data
        // console.log("createKPIsData is", JSON.stringify(createKPIsData))
        // const kpisData= await createKPIsData;
        // console.log("Successfully created KPIs. Result is ", JSON.stringify(kpisData))
        // const kpisWithIcons: KpiItem[] = kpisData.kpi_items.map((item: any) => ({
        //   ...item,
        //   icon: Clock, // fallback to Clock
        // }));

        // setKpis(kpisWithIcons);

        const resAISuggestedQues= await AISuggestedQuesRes;
        const AISuggestedQuesData= await resAISuggestedQues.data
        console.log("AISuggestedQuesData is", JSON.stringify(AISuggestedQuesData))
        const aIRecommendedQuestionsData=   await AISuggestedQuesData;
        console.log("Successfully generated AI Recommended Ques. Result is ", JSON.stringify(aIRecommendedQuestionsData))
        localStorage.setItem("sample_questions", JSON.stringify(aIRecommendedQuestionsData.sample_questions))

    } catch (err) {
      setError("Failed to process file. Please try again.")
      setTimeout(()=>{
        setError(null);
      }, 3000)
      console.error("File processing error:", err)
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