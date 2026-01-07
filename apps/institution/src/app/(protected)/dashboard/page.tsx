'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Copy,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  SlidersHorizontal,
  LogOut,
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@fintech/ui';

// Types
interface Applicant {
  id: string;
  full_name: string;
  email: string;
  cwi_score: number | null;
  risk_category: string | null;
  submitted_at: string;
  country: string | null;
  income_range: string | null;
}

interface Score {
  applicant_id: string;
  cwi_0_100: number;
  risk_band: string;
  character_score: number;
  capacity_score: number;
  capital_score: number;
  consistency_score: number;
  conditions_score: number;
}

type FilterTab = 'all' | 'eligible' | 'not_eligible';

export default function DashboardPage() {
  const router = useRouter();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [scores, setScores] = useState<Record<string, Score>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const itemsPerPage = 10;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setInstitutionId(user.id);
          setUserName(user.user_metadata?.company_name || user.email?.split('@')[0] || 'User');
        }

        // Fetch applicants
        const { data: applicantsData, error: applicantsError } = await supabase
          .from('applicants')
          .select('id, full_name, email, cwi_score, risk_category, submitted_at, country, income_range')
          .order('submitted_at', { ascending: false });

        if (applicantsError) {
          console.error('Error fetching applicants:', applicantsError);
        } else {
          setApplicants(applicantsData || []);
        }

        // Fetch scores for these applicants
        if (applicantsData && applicantsData.length > 0) {
          const applicantIds = applicantsData.map(a => a.id);
          const { data: scoresData, error: scoresError } = await supabase
            .from('scores')
            .select('applicant_id, cwi_0_100, risk_band, character_score, capacity_score, capital_score, consistency_score, conditions_score')
            .in('applicant_id', applicantIds);

          if (scoresError) {
            console.error('Error fetching scores:', scoresError);
          } else if (scoresData) {
            const scoresMap: Record<string, Score> = {};
            scoresData.forEach(score => {
              scoresMap[score.applicant_id] = score;
            });
            setScores(scoresMap);
          }
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  // Check if applicant is eligible (LOW or MODERATE risk)
  const isEligible = (applicant: Applicant) => {
    const riskBand = applicant.risk_category || scores[applicant.id]?.risk_band;
    return riskBand === 'LOW' || riskBand === 'MODERATE';
  };

  // Filter applicants
  const filteredApplicants = applicants.filter((applicant) => {
    const matchesSearch =
      (applicant.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (applicant.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    if (activeTab === 'eligible') return matchesSearch && isEligible(applicant);
    if (activeTab === 'not_eligible') return matchesSearch && !isEligible(applicant);
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);
  const paginatedApplicants = filteredApplicants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const stats = {
    total: applicants.length,
    eligible: applicants.filter(a => isEligible(a)).length,
    notEligible: applicants.filter(a => !isEligible(a)).length,
  };

  // Generate questionnaire link
  const getQuestionnaireLink = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APPLICANT_URL ||
      (typeof window !== 'undefined' ? window.location.origin.replace('3001', '3000') : '');
    return institutionId ? `${baseUrl}/questionnaire?institution=${institutionId}` : '';
  };
  const questionnaireLink = getQuestionnaireLink();

  const handleCopyLink = async () => {
    if (questionnaireLink) {
      try {
        await navigator.clipboard.writeText(questionnaireLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        const textArea = document.createElement('textarea');
        textArea.value = questionnaireLink;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          window.prompt('Copy this link:', questionnaireLink);
        }
        document.body.removeChild(textArea);
      }
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    const dataToExport = filteredApplicants.map(a => ({
      name: a.full_name,
      email: a.email,
      cwi_score: a.cwi_score || scores[a.id]?.cwi_0_100 || 'N/A',
      eligibility: isEligible(a) ? 'Eligible' : 'Not Eligible',
      country: a.country || 'N/A',
      submitted_at: new Date(a.submitted_at).toLocaleDateString(),
    }));

    if (format === 'csv') {
      const headers = Object.keys(dataToExport[0] || {}).join(',');
      const rows = dataToExport.map(row => Object.values(row).join(','));
      const csv = [headers, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'applicants.csv';
      a.click();
    } else {
      const json = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'applicants.json';
      a.click();
    }

    setShowExportMenu(false);
  };

  // Get CWI score for display
  const getCwiScore = (applicant: Applicant) => {
    const cwiScore = applicant.cwi_score || scores[applicant.id]?.cwi_0_100;
    if (cwiScore === null || cwiScore === undefined) return null;
    return cwiScore;
  };

  const handleViewApplicant = (applicantId: string) => {
    router.push(`/applicant/${applicantId}`);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FP</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">FINPSYCH</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoggingOut ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <LogOut className="w-5 h-5" />
              )}
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
        <h1 className="text-xl font-semibold text-white">Welcome Back {userName}</h1>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Customers */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm text-gray-500">Total customers</span>
                <div className="flex items-end gap-3 mt-1">
                  <span className="text-4xl font-bold text-gray-900">
                    {stats.total.toLocaleString()}
                  </span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Eligible */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm text-gray-500">Eligible</span>
                <div className="flex items-end gap-3 mt-1">
                  <span className="text-4xl font-bold text-gray-900">
                    {stats.eligible.toLocaleString()}
                  </span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Not Eligible */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm text-gray-500">Not Eligible</span>
                <div className="flex items-end gap-3 mt-1">
                  <span className="text-4xl font-bold text-gray-900">
                    {stats.notEligible.toLocaleString()}
                  </span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Applicants Table Card */}
        <div className="bg-white rounded-xl border border-gray-200">
          {/* Table Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-gray-900">Applicants</h2>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                    {filteredApplicants.length} Applicants
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Keep track of all applicants and their results
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Export Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => handleExport('csv')}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Export as CSV
                      </button>
                      <button
                        onClick={() => handleExport('json')}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Export as JSON
                      </button>
                    </div>
                  )}
                </div>

                {/* Copy Questionnaire Link Button */}
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Questionnaire Link
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Filter Tabs and Search */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-5">
              {/* Tabs */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'all'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  View all
                </button>
                <button
                  onClick={() => { setActiveTab('eligible'); setCurrentPage(1); }}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'eligible'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Eligible
                </button>
                <button
                  onClick={() => { setActiveTab('not_eligible'); setCurrentPage(1); }}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'not_eligible'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Not Eligible
                </button>
              </div>

              {/* Search and Filters */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                </div>
                <button className="px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CWI Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Eligibility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application Date
                  </th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedApplicants.map((applicant) => {
                  const eligible = isEligible(applicant);
                  const cwiScore = getCwiScore(applicant);

                  return (
                    <tr
                      key={applicant.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleViewApplicant(applicant.id)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{applicant.full_name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{applicant.email || 'No email'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">
                          {cwiScore !== null ? cwiScore.toFixed(1) : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${eligible ? 'bg-teal-500' : 'bg-red-500'}`} />
                          <span className={`text-sm font-medium ${eligible ? 'text-teal-600' : 'text-red-500'}`}>
                            {eligible ? 'Eligible' : 'Not Eligible'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {applicant.submitted_at
                          ? new Date(applicant.submitted_at).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewApplicant(applicant.id);
                          }}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {paginatedApplicants.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {applicants.length === 0
                        ? 'No applicants yet. Share your questionnaire link to get started!'
                        : 'No applicants found matching your criteria'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
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
    </div>
  );
}
