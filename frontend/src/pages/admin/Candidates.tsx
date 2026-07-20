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
    <div className="p-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Candidates</h1>
          <p className="text-white/40 text-sm">Review submitted CVs and candidate profiles</p>
        </div>
      </div>

      <div className="bg-white/3 border border-white/8 rounded-[16px] overflow-hidden flex flex-col min-h-0">
        <div className="p-4 border-b border-white/8 flex items-center justify-between bg-white/1 shrink-0">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#04a891] focus:border-transparent transition-all"
            />
          </div>
          <div className="text-sm text-white/40 font-medium px-4">
            {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-white/5 text-xs uppercase text-white/50 border-b border-white/8">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Candidate</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Contact</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Interested Roles</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Date Submitted</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-white/40">
                    Loading candidates...
                  </td>
                </tr>
              ) : filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-white/40">
                    No candidates found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{c.name || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{c.email}</div>
                      {c.phone && <div className="text-white/50 text-xs mt-1">{c.phone}</div>}
                    </td>
                    <td className="px-6 py-4">
                      {c.interestedJobs ? (
                        <div className="flex flex-wrap gap-1">
                          {c.interestedJobs.split(',').map((job, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#04a891]/20 text-[#04a891]">
                              {job.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-white/30">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white/50">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDownloadCV(c.cvFileName, c.name || 'Candidate')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        <Download size={14} />
                        Download CV
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
