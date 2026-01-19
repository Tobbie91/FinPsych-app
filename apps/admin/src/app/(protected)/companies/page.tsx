'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Building2,
  TrendingUp,
  TrendingDown,
  Loader2,
  Eye,
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

interface Institution {
  id: string;
  email: string;
  company_name: string;
  created_at: string;
  applicant_count: number;
  last_applicant_date: string | null;
}

export default function CompaniesPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchInstitutions = async () => {
      setIsLoading(true);

      try {
        // Admins can see ALL institutions
        const { data: institutionsData, error: instError } = await supabase
          .from('institutions')
          .select('*')
          .order('created_at', { ascending: false });

        if (instError) {
          console.error('Error fetching institutions:', instError);
        }

        // Get applicant counts for ALL institutions
        const { data: applicantsByInstitution, error: appError } = await supabase
          .from('applicants')
          .select('institution_id, submitted_at')
          .order('submitted_at', { ascending: false });

        if (appError) {
          console.error('Error fetching applicants:', appError);
        }

        // Group applicants by institution_id
        const applicantMap = new Map<string, { count: number; lastDate: string | null }>();

        applicantsByInstitution?.forEach((applicant) => {
          if (applicant.institution_id) {
            const existing = applicantMap.get(applicant.institution_id);
            if (existing) {
              existing.count += 1;
            } else {
              applicantMap.set(applicant.institution_id, {
                count: 1,
                lastDate: applicant.submitted_at,
              });
            }
          }
        });

        // Combine institutions with their applicant counts
        const combinedData: Institution[] = (institutionsData || []).map((inst) => {
          const applicantData = applicantMap.get(inst.id);
          return {
            id: inst.id,
            email: inst.email,
            company_name: inst.name,
            created_at: inst.created_at,
            applicant_count: applicantData?.count || 0,
            last_applicant_date: applicantData?.lastDate || null,
          };
        });

        // Also add any institutions from applicants that aren't in the institutions table
        // These are legacy institutions that signed up before the institutions table was created
        applicantMap.forEach((data, id) => {
          if (!combinedData.find(inst => inst.id === id)) {
            combinedData.push({
              id,
              email: '',
              company_name: 'Unregistered Company',
              created_at: new Date().toISOString(),
              applicant_count: data.count,
              last_applicant_date: data.lastDate,
            });
          }
        });

        setInstitutions(combinedData);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstitutions();
  }, [supabase]);

  const filteredInstitutions = institutions.filter(
    (inst) =>
      inst.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredInstitutions.length / itemsPerPage);
  const paginatedInstitutions = filteredInstitutions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const totalInstitutions = institutions.length;
  const activeInstitutions = institutions.filter(
    (inst) => inst.last_applicant_date &&
    new Date(inst.last_applicant_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;
  const inactiveInstitutions = totalInstitutions - activeInstitutions;
  const totalApplicants = institutions.reduce((sum, inst) => sum + inst.applicant_count, 0);

  const getRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleExport = () => {
    const csv = [
      ['Institution ID', 'Company Name', 'Email', 'Total Applicants', 'Last Active'],
      ...filteredInstitutions.map(inst => [
        inst.id,
        inst.company_name,
        inst.email,
        inst.applicant_count.toString(),
        getRelativeTime(inst.last_applicant_date),
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'institutions.csv';
    a.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading institutions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-500 mt-1">
            Manage institutional partners and their activity
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Companies Overview
        </h2>
        <div className="grid grid-cols-4 gap-6">
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Total Companies</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalInstitutions}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Active (30 days)</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{activeInstitutions}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-sm text-gray-500">Inactive</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{inactiveInstitutions}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">Total Applicants</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalApplicants}</p>
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        {/* Table Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">All Companies</h3>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
              {filteredInstitutions.length} Companies
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Company
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Total Applicants
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Last Active
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedInstitutions.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-12 text-center text-gray-500">
                  {institutions.length === 0
                    ? 'No institutions have submitted applicants yet'
                    : 'No institutions match your search'}
                </td>
              </tr>
            ) : (
              paginatedInstitutions.map((inst) => (
                <tr
                  key={inst.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {inst.company_name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{inst.company_name}</p>
                        {inst.email && <p className="text-sm text-gray-500">{inst.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-gray-900">
                      {inst.applicant_count.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-500">
                    {getRelativeTime(inst.last_applicant_date)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
