import React, { useState, useEffect } from 'react';
import { Database, Upload, RefreshCw, CheckCircle, AlertCircle, FileText, Activity } from 'lucide-react';
import { apiClient } from '../../lib/api';

export function AdminKnowledgePage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await apiClient('/api/admin/knowledge/status');
      if (res) {
        setDocuments(res.documents);
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);

    try {
      const res = await fetch('/api/admin/knowledge/upload', {
        method: 'POST',
        // apiClient stringifies JSON, so we use fetch for FormData. We need the session cookie, which fetch automatically includes if we use apiClient's defaults, but wait, apiClient does `credentials: "same-origin"`. Let's just use fetch without the auth token since it's session cookie based!
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        alert("Upload successful. Document is now DRAFT. Please reindex.");
        setFile(null);
        setTitle('');
        fetchDocuments();
      } else {
        alert(`Upload failed: ${data.error}`);
      }
    } catch (error) {
      alert("Error uploading document.");
    } finally {
      setUploading(false);
    }
  };

  const handleReindex = async (version: string) => {
    try {
      // Optimistically show processing
      setDocuments(docs => docs.map(d => d.version === version ? { ...d, status: 'PROCESSING' } : d));
      
      const data = await apiClient('/api/admin/knowledge/reindex', {
        method: 'POST',
        body: JSON.stringify({ version })
      });
      
      if (data && data.error) {
        alert(`Reindex failed: ${data.error}`);
      }
    } catch (error) {
      alert("Error reindexing document.");
    } finally {
      fetchDocuments();
    }
  };

  const handleApprove = async (version: string) => {
    if (!confirm("Are you sure you want to approve and activate this version? It will become the public knowledge base.")) return;
    try {
      const data = await apiClient('/api/admin/knowledge/approve', {
        method: 'POST',
        body: JSON.stringify({ version })
      });
      if (data && data.error) {
        alert(`Approval failed: ${data.error}`);
      } else {
        alert("Version is now APPROVED and ACTIVE.");
      }
    } catch (error) {
      alert("Error approving version.");
    } finally {
      fetchDocuments();
    }
  };

  const handleDeactivate = async (version: string) => {
    if (!confirm("Are you sure you want to deactivate this version? The AI agent will have NO knowledge base until a new one is activated.")) return;
    try {
      const data = await apiClient('/api/admin/knowledge/deactivate', {
        method: 'POST',
        body: JSON.stringify({ version })
      });
      if (data && data.error) {
        alert(`Deactivation failed: ${data.error}`);
      } else {
        alert("Version is now INACTIVE.");
      }
    } catch (error) {
      alert("Error deactivating version.");
    } finally {
      fetchDocuments();
    }
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-[#04a891]" />
            Knowledge Base
          </h1>
          <p className="text-white/60 mt-1">Manage documents used by the AI Chat Agent.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        {/* Upload Form */}
        <div className="bg-[#1a1c1b] border border-white/10 rounded-xl p-6 h-fit">
          <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#04a891]" />
            Upload Document
          </h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Title (Optional)</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#04a891]"
                placeholder="e.g. Website Scope"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">File (.pdf or .docx)</label>
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#04a891] file:text-white hover:file:bg-[#038c79] cursor-pointer"
              />
            </div>
            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full bg-[#04a891] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#038c79] transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>
        </div>

        {/* Document List */}
        <div className="bg-[#1a1c1b] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-black/20">
                <th className="p-4 text-sm font-medium text-white/60">Document</th>
                <th className="p-4 text-sm font-medium text-white/60">Version & Checksum</th>
                <th className="p-4 text-sm font-medium text-white/60">Status & Meta</th>
                <th className="p-4 text-sm font-medium text-white/60 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-white/40">No documents uploaded yet.</td>
                </tr>
              ) : documents.map((doc) => (
                <tr key={doc.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-white/40" />
                      <div>
                        <div className="text-white font-medium">{doc.title}</div>
                        <div className="text-xs text-white/40">{doc.fileName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-white/60 font-mono">{doc.version}</div>
                    <div className="text-xs text-white/30 truncate max-w-[120px]" title={doc.checksum}>{doc.checksum || 'No checksum'}</div>
                    <div className="text-[10px] text-white/40 mt-1">{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ''}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col items-start gap-1">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                        ${doc.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                          doc.status === 'INDEXED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          doc.status === 'PROCESSING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                          doc.status === 'FAILED' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                          doc.status === 'INACTIVE' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 
                          'bg-white/5 text-white/60 border-white/10'}`}
                      >
                        {doc.status}
                      </span>
                      {doc.chunkCount !== undefined && <span className="text-[10px] text-white/40">{doc.chunkCount} chunks</span>}
                      {doc.status === 'FAILED' && doc.errorMessage && <span className="text-[10px] text-red-400 max-w-[150px] truncate" title={doc.errorMessage}>{doc.errorMessage}</span>}
                    </div>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {(doc.status === 'DRAFT' || doc.status === 'FAILED' || doc.status === 'INACTIVE') && (
                      <button
                        onClick={() => handleReindex(doc.version)}
                        className="text-sm bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded hover:bg-blue-500/20 transition-colors"
                      >
                        Parse & Index
                      </button>
                    )}
                    
                    {doc.status === 'INDEXED' && (
                      <button
                        onClick={() => handleApprove(doc.version)}
                        className="text-sm bg-green-500/10 text-green-400 px-3 py-1.5 rounded hover:bg-green-500/20 transition-colors"
                      >
                        Approve & Activate
                      </button>
                    )}

                    {doc.status === 'APPROVED' && (
                      <button
                        onClick={() => handleDeactivate(doc.version)}
                        className="text-sm bg-red-500/10 text-red-400 px-3 py-1.5 rounded hover:bg-red-500/20 transition-colors"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
