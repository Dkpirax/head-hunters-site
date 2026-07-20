import React, { useState, useEffect } from 'react';
import { Download, Search, FileText } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  interestedJobs: string | null;
  cvFileName: string;
  createdAt: string;
}

export function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      // In a real app, you would pass the admin auth token in headers
      const res = await fetch(`${apiUrl}/api/candidates`);
      if (res.ok) {
        const data = await res.json();
        setCandidates(data);
      }
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCV = (filename: string, candidateName: string) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    // Trigger download
    const link = document.createElement('a');
    link.href = `${apiUrl}/api/candidates/download/${filename}`;
    
    // Set a nice filename for the downloaded file
    const ext = filename.split('.').pop() || 'pdf';
    link.download = `CV_${candidateName.replace(/\s+/g, '_')}.${ext}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCandidates = candidates.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.interestedJobs?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Candidates</h1>
          <p className="text-sm text-slate-500">Review submitted CVs and candidate profiles</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#04a891] focus:border-transparent transition-all"
            />
          </div>
          <div className="text-sm text-slate-500 font-medium">
            {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Candidate</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Interested Roles</th>
                <th className="px-6 py-4 font-semibold">Date Submitted</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-slate-200 border-t-[#04a891] rounded-full animate-spin mx-auto mb-2"></div>
                    Loading candidates...
                  </td>
                </tr>
              ) : filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No candidates found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{candidate.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-900">{candidate.email}</span>
                        {candidate.phone && <span className="text-xs text-slate-500">{candidate.phone}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={candidate.interestedJobs || ''}>
                      {candidate.interestedJobs || <span className="text-slate-400 italic">Not specified</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(candidate.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDownloadCV(candidate.cvFileName, candidate.name)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#02695e]/10 text-[#02695e] hover:bg-[#02695e]/20 rounded-md text-xs font-semibold transition-colors"
                      >
                        <Download size={14} />
                        CV
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
