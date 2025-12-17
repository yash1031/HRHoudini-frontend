"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Clock, X, Check, Trash2 } from 'lucide-react';
import { useRouter } from "next/navigation"
import { useDashboard } from '@/contexts/dashboard-context';
import { apiFetch } from "@/lib/api/client";
import {generateCardsFromParquet, generateChartsFromParquet, buildQueryFromQueryObj, generateDrilldownChartsData} from "@/utils/parquetLoader"

interface FileUpload {
  id: string;
  session_id: string;
  name: string;
  timestamp: string;
  isFavorite: boolean;
  cardsQueries: any;   
  chartsQueries: any;
  parquetUrl: string;
  aiSuggestedQuestions: string[];
  rowCount: number;
}

interface FileUploadHistoryProps {
  onClose?: () => void;
  fileUploadHistoryData: any;
}

const FileUploadHistory = ({ onClose, fileUploadHistoryData }: FileUploadHistoryProps) => {
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const router = useRouter()
  const { setCardsState, setChartsState, setDrilldownsState, setMetadata, setMessages, setRecommendedQuestions} = useDashboard();
  // Add state for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    uploadId: string | null;
    uploadName: string;
    sessionId: string | null;
  }>({
    isOpen: false,
    uploadId: null,
    uploadName: '',
    sessionId: null
  });

  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(()=>{
    console.log("uploads in FileUploadHistory comp is", fileUploadHistoryData)
    setUploads(fileUploadHistoryData)
  },[fileUploadHistoryData])

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const toggleFavorite = (id: string) => {
    setUploads(uploads.map(upload => 
      upload.id === id ? { ...upload, isFavorite: !upload.isFavorite } : upload
    ));
  };

  const deleteUpload = (id: string) => {
    setUploads(uploads.filter(upload => upload.id !== id));
  };

  const showDeleteConfirmation = (id: string, name: string, sessionId: string) => {
    setDeleteConfirmation({
      isOpen: true,
      uploadId: id,
      uploadName: name,
      sessionId: sessionId
    });
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      uploadId: null,
      uploadName: '',
      sessionId: null
    });
    setIsDeleting(false);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.sessionId) return;
    
    setIsDeleting(true);
    
    try {
      // Get user_id from localStorage or your auth context
      const userId = localStorage.getItem('user_id'); // Adjust based on your auth setup
      
      const response = await apiFetch(
        `/api/insights/delete-session/${deleteConfirmation.sessionId}?user_id=${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      ).catch((error) => {
        const parsedError = JSON.parse(error.message);
        console.log("Error in generating pre-signed URL: ", parsedError.error)
        console.error('Delete failed:', parsedError);
        alert('Failed to delete session. Please try again.');
        return;
      });

      if(response){
        console.log('Delete successful:', response.message);
        
        // Remove from local state
        if (deleteConfirmation.uploadId !== undefined) {
          setUploads(uploads.filter(upload => upload.id !== deleteConfirmation.uploadId));
        }
        
        closeDeleteConfirmation();
      }
      
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('An error occurred while deleting. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const startEditing = (upload: FileUpload) => {
    setEditingId(upload.id);
    setEditValue(upload.name);
  };

  const saveEdit = (id: string) => {
    if (editValue.trim()) {
      setUploads(uploads.map(upload => 
        upload.id === id ? { ...upload, name: editValue.trim() } : upload
      ));
    }
    setEditingId(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleTileClick = (id: string, name: string, session_id: string, cardsQueries: any, chartsQueries: any, parquetUrl: string, aiSuggestedQuestions: string[], rowCount: number) => {
    if (editingId) return;
    // Navigate to dashboard-upload-only with specified parameters
    const params = new URLSearchParams({
      hasFile: "true",
      showWelcome: "false",
    })
    let dashboardUrl = `/dashboard?${params.toString()}`
    localStorage.setItem("from_history","true")
    localStorage.setItem("session_id",session_id)
    localStorage.setItem("file_name", name)
    localStorage.setItem("file_row_count", String(rowCount))
    setRecommendedQuestions(aiSuggestedQuestions)
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
    console.log("Cards Queries Received on clicking side panel", cardsQueries)
    console.log("Charts Queries Received on clicking side panel", chartsQueries)
    console.log("Parquet URL Received on clicking side panel", parquetUrl)
    console.log("Sample_questions Received on clicking side panel", aiSuggestedQuestions)

    //Setting Cards State
    if(cardsQueries && cardsQueries.length>0){
      console.log("Starting to convert queries for KPI Cards, cardsQueries received", cardsQueries)
      setCardsState(prev => ({ ...prev, loading: true, error: null }));                  
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
    else{
      console.log("KPI Cards not available, cardsQueries received", cardsQueries)
      setCardsState({
        loading: false,
        error: "KPI Cards not available",
        data: []
      });
    }
    // Setting Charts State
    if(chartsQueries && chartsQueries.length>0){
      setChartsState(prev => ({ ...prev, loading: true, error: null }));
      generateChartsFromParquet(chartsQueries, parquetUrl)
        .then((result: any) => {
          console.log("Result for generateChartsFromParquet:", JSON.stringify(result, null, 2));
          
          // Success - update charts data in granular state
          setChartsState(prev => ({
            loading: false,
            error: null,
            data: [...prev.data, ...result]  // ← Append new charts to existing
          }));
        })
        .catch((error) => {
          console.error("Failed to generate charts:", error);
          
          // Error - set error state
          setChartsState({
            loading: false,
            error: "Failed to generate analytical charts",
            data: []
          });
        });

      chartsQueries.map((chartQuery: any)=>{

        console.log("chartQuery Received on clicking side", chartQuery)

        const {semantic_id, drilldowns} = chartQuery

        const parentChartId = semantic_id;
        const drilldownCharts = drilldowns?.charts || [];
        const drilldownFilters = drilldowns?.filters || [];
        const drilldownInsights = drilldowns?.insights || [];
        // const kpiId = drilldownPayload?.kpi_id;
        
        if (parentChartId) {
          setDrilldownsState(prev => ({
            ...prev,
            [parentChartId]: { loading: true, error: false }
          }));
        }
        
        (async () => {
          try {
            // Transform filters
            const transformedFilters = drilldownFilters.map((filter: any) => ({
              field: filter.field,
              label: filter.label,
              type: filter.type === 'select' ? 'multiselect' : filter.type,
              options: filter.options || [],
              whereClause: filter.whereClause
            }));
            
            // Prepare queries
            const drilldownQueries = {
              charts: drilldownCharts.map((chart: any) => {
                const queryObjWithUrl = JSON.parse(JSON.stringify(chart.query_obj));
                
                if (queryObjWithUrl.from) {
                  queryObjWithUrl.from.source = parquetUrl;
                } else {
                  queryObjWithUrl.from = { type: 'parquet', source: parquetUrl };
                }
                
                return {
                  ...chart,
                  query: buildQueryFromQueryObj(queryObjWithUrl, parquetUrl),
                  queryObject: queryObjWithUrl
                };
              })
            };
            
            const chartDataResults = await generateDrilldownChartsData(
              drilldownQueries.charts, 
              parquetUrl
            );
            
            console.log("Drilldown charts generated:", chartDataResults);
            
            // Update drilldown state
            if (parentChartId) {
              setDrilldownsState(prev => ({
                ...prev,
                [parentChartId]: { loading: false, error: false }
              }));
            }
            
            // DIRECTLY update chartsState - find and modify the chart
            setChartsState(prev => {
              const currentCharts = [...prev.data];
              
              // Find the parent chart by ID
              const chartIndex = currentCharts.findIndex(
                chart => (chart.id || chart.semantic_id) === parentChartId
              );
              
              if (chartIndex === -1) {
                console.warn("Parent chart not found:", parentChartId);
                return prev;
              }
              
              // Attach drilldown to the chart
              currentCharts[chartIndex] = {
                ...currentCharts[chartIndex],
                drillDownData: {
                  filters: transformedFilters,
                  charts: chartDataResults,
                  insights: drilldownInsights
                }
              };
              
              console.log("Drilldown attached to chart:", parentChartId);
              console.log("Updated chartsState", currentCharts)
              
              return {
                ...prev,
                data: currentCharts
              };
            });
            
          } catch (error) {
            console.error("Failed to process drilldown:", error);
            
            if (parentChartId) {
              setDrilldownsState(prev => ({
                ...prev,
                [parentChartId]: { loading: false, error: true }
              }));
            }
          }
        })();
      })
    }
    else{
      setChartsState({
        loading: false,
        error: "Charts not available",
        data: []
      });
    }

    setMetadata({"filename": name,"totalRows": rowCount.toString()})

    router.push(dashboardUrl)
  };

  return (
    <div className="h-screen flex flex-col bg-[#f8f9fa]" style={{ width: '500px' }}>
      {/* Header */}
      <div className="bg-[#4f5bde] text-white px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText size={24} />
          <h1 className="text-xl font-semibold">File Upload History</h1>
        </div>
        <button 
          className="text-white hover:bg-white/10 rounded p-1 transition-colors"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      {/* Subheader */}
      <div className="px-6 py-3 bg-[#4f5bde] text-white/90">
        <p className="text-sm">Access your previous dashboards and insights generated</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {uploads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <FileText size={64} strokeWidth={1.5} className="mb-4" />
            <p className="text-lg font-medium mb-1">No previous file uploads</p>
            <p className="text-sm">Upload files to build your history</p>
          </div>
        ) : (
          <div className="space-y-2">
            {uploads.map((upload) => (
              <div
                key={upload.id}
                className="bg-white rounded-lg border border-gray-200 hover:border-[#4f5bde] hover:shadow-sm transition-all duration-200 group"
              >
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => handleTileClick(upload.id, 
                    upload.name, 
                    upload.session_id, 
                    upload.cardsQueries, 
                    upload.chartsQueries, 
                    upload.parquetUrl, 
                    upload.aiSuggestedQuestions, 
                    upload.rowCount)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {
                      editingId === upload.id ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 px-2 py-1 border border-[#4f5bde] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#4f5bde]/30"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(upload.id);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                          />
                          <button
                            onClick={() => saveEdit(upload.id)}
                            className="p-1 hover:bg-green-100 rounded text-green-600"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 hover:bg-red-100 rounded text-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : 
                      (
                        <h3 className="font-medium text-gray-900 truncate text-sm mb-1">
                          {upload.name}
                        </h3>
                      )}
                      {/* <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{formatTimestamp(upload.timestamp)}</span>
                      </div> */}
                    </div>
                    
                    {/* <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"> */}
                    <div className="flex items-center gap-1 transition-opacity">
                      {/* <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(upload.id);
                        }}
                        className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
                          upload.isFavorite ? 'text-yellow-500' : 'text-gray-400'
                        }`}
                        title={upload.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star size={16} fill={upload.isFavorite ? 'currentColor' : 'none'} />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(upload);
                        }}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Rename"
                      >
                        <Edit2 size={16} />
                      </button> */}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // deleteUpload(upload.id);
                          showDeleteConfirmation(upload.id, upload.name, upload.session_id);
                        }}
                        className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div> 
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    
      {deleteConfirmation.isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={closeDeleteConfirmation}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-[450px] relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeDeleteConfirmation}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isDeleting}
            >
              <X size={20} />
            </button>

            {/* Content */}
            <div className="p-6 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Deletion
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Deletion of this data cannot be undone. Are you sure you want to delete this upload and history?
              </p>
              
              {/* File name display */}
              <div className="bg-gray-50 rounded p-3 mb-6">
                <p className="text-sm text-gray-700 truncate">
                  <span className="font-medium">File: </span>
                  {deleteConfirmation.uploadName}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeDeleteConfirmation}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(FileUploadHistory);