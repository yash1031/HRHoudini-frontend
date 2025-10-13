import React, { useState, useEffect } from 'react';
import { Star, Trash2, Edit2, FileText, Clock, X, Check } from 'lucide-react';
import { useRouter } from "next/navigation"
import { useDashboard } from '@/contexts/DashboardContext';

interface FileUpload {
  id: string;
  name: string;
  timestamp: string;
  isFavorite: boolean;
  dashboardJSON: any;
}

interface FileUploadHistoryProps {
  onClose?: () => void;
  fileUploadHistoryData: any;
}

const FileUploadHistory = ({ onClose, fileUploadHistoryData }: FileUploadHistoryProps) => {
  // const [uploads, setUploads] = useState<FileUpload[]>([
  //   { id: '1', name: 'Employee_Data_Q1.csv', timestamp: '2025-10-13T10:30:00', isFavorite: true },
  //   { id: '2', name: 'Payroll_Report_Sept.xlsx', timestamp: '2025-10-12T15:45:00', isFavorite: false },
  //   { id: '3', name: 'Performance_Metrics.csv', timestamp: '2025-10-11T09:20:00', isFavorite: true },
  //   { id: '4', name: 'Department_Analytics.xlsx', timestamp: '2025-10-10T14:15:00', isFavorite: false },
  //   { id: '5', name: 'Attendance_Records.csv', timestamp: '2025-10-09T11:00:00', isFavorite: false },
  //   { id: '6', name: 'Benefits_Enrollment.xlsx', timestamp: '2025-10-08T16:30:00', isFavorite: false },
  // ]);
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const router = useRouter()
  const { setDashboard_data,setDashboardCode, setIsLoading, setErrorDash } = useDashboard();
  console.log("uploads in FileUploadHistory comp is", fileUploadHistoryData)

  useEffect(()=>{
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

  const handleTileClick = (id: string, dashboardJSON: any) => {
    if (editingId) return;
    console.log('Navigate to:', id);
    // Navigate to dashboard-upload-only with specified parameters
    const params = new URLSearchParams({
      persona: "hr-generalist---upload-only",
      company: "HealthServ+Solutions",
      onboarding: "completed",
      hasFile: "false",
      showWelcome: "true",
      challenges: "[object+Object],[object+Object],[object+Object],[object+Object],[object+Object],[object+Object]",
    })
    params.set("company", "HealthServ")
    params.set("hasFile", "true")
    let dashboardUrl = `/dashboard-uo-1?${params.toString()}`
    localStorage.setItem("dashboard_data", JSON.stringify(dashboardJSON))
    setDashboard_data(dashboardJSON);
    router.push(dashboardUrl)

    // Add your navigation logic here
    // e.g., navigate(`/upload/${id}`);
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
                  onClick={() => handleTileClick(upload.id, upload.dashboardJSON)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {editingId === upload.id ? (
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
                      ) : (
                        <h3 className="font-medium text-gray-900 truncate text-sm mb-1">
                          {upload.name}
                        </h3>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{formatTimestamp(upload.timestamp)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
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
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteUpload(upload.id);
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
    </div>
  );
};

export default FileUploadHistory;