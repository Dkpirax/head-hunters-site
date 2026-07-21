import React, { useState, useEffect } from 'react';
import { Database, Upload, RefreshCw, CheckCircle, AlertCircle, FileText, Activity, Trash2 } from 'lucide-react';
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

  const handleDelete = async (id: string, titleStr: string) => {
    if (!confirm(`Are you sure you want to delete '${titleStr}'? This cannot be undone.`)) return;
    try {
      const data = await apiClient(`/api/admin/knowledge/${id}`, {
        method: 'DELETE'
      });
      if (data && data.error) {
        alert(`Delete failed: ${data.error}`);
      } else {
        fetchDocuments();
      }
    } catch (error) {
      alert("Error deleting document.");
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Knowledge Base</h1>
          <p className="text-white/40 text-sm">Manage documents used by the AI Chat Agent</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-6">
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
              className="w-full bg-[#04a891] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-[#038c79] transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>
        </div>

        {/* Document List */}
        <div className="bg-[#1a1c1b] border border-white/10 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/10 bg-black/40">
                  <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Document</th>
                  <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Version & Meta</th>
                  <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-white/40">No documents uploaded yet.</td>
                  </tr>
                ) : documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-[#04a891]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-white font-semibold text-sm truncate" title={doc.title || doc.fileName}>{doc.title || doc.fileName}</div>
                          <div className="text-xs text-white/40 truncate mt-0.5" title={doc.fileName}>{doc.fileName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-white/70 font-mono font-medium">{doc.version}</div>
                      <div className="text-[11px] text-white/40 mt-1">{doc.chunkCount !== undefined ? `${doc.chunkCount} chunks` : ''} • {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ''}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
                          ${doc.status === 'APPROVED' ? 'bg-green-500/15 text-green-400 border-green-500/30' : 
                            doc.status === 'INDEXED' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' : 
                            doc.status === 'PROCESSING' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' : 
                            doc.status === 'FAILED' ? 'bg-red-500/15 text-red-400 border-red-500/30' : 
                            doc.status === 'INACTIVE' ? 'bg-slate-500/15 text-slate-400 border-slate-500/30' : 
                            'bg-white/5 text-white/60 border-white/10'}`}
                        >
                          {doc.status}
                        </span>
                        {doc.status === 'FAILED' && doc.errorMessage && (
                          <span className="text-[10px] text-red-400 max-w-[180px] truncate" title={doc.errorMessage}>
                            {doc.errorMessage}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(doc.status === 'DRAFT' || doc.status === 'FAILED' || doc.status === 'INACTIVE') && (
                          <button
                            onClick={() => handleReindex(doc.version)}
                            className="text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg hover:bg-blue-500/25 transition-all"
                          >
                            Parse & Index
                          </button>
                        )}
                        
                        {doc.status === 'INDEXED' && (
                          <button
                            onClick={() => handleApprove(doc.version)}
                            className="text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg hover:bg-green-500/25 transition-all"
                          >
                            Approve & Activate
                          </button>
                        )}

                        {doc.status === 'APPROVED' && (
                          <button
                            onClick={() => handleDeactivate(doc.version)}
                            className="text-xs font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/30 px-3 py-1.5 rounded-lg hover:bg-slate-500/25 transition-all"
                          >
                            Deactivate
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(doc.id, doc.title || doc.fileName)}
                          className="p-1.5 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                          title="Delete Document"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
